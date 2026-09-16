import { expect, type Page, test } from '@playwright/test';

const city = {
  id: 3448439,
  name: 'São Paulo',
  country: 'Brazil',
  admin1: 'São Paulo',
  latitude: -23.5475,
  longitude: -46.63611,
  timezone: 'America/Sao_Paulo',
};

async function mockForecast(page: Page) {
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          temperature_2m: 0,
          apparent_temperature: 0,
          relative_humidity_2m: 58,
          wind_speed_10m: 12.3,
          weather_code: 0,
        },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
          temperature_2m_max: [10, 11, 12, 13, 14],
          temperature_2m_min: [0, 1, 2, 3, 4],
          weather_code: [0, 1, 2, 3, 61],
          precipitation_probability_max: [null, 20, 40, 60, 80],
        },
      }),
    });
  });
}

test('busca uma cidade, exibe a previsão e alterna para Fahrenheit', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });

  await mockForecast(page);

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('region', { name: 'Clima atual em São Paulo' })).toContainText(
    'São Paulo, São Paulo',
  );
  await expect(page.locator('main')).toBeFocused();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();

  await expect(page.getByRole('region', { name: 'Clima atual em São Paulo' })).toContainText(
    '32°F',
  );
});

test('exibe mensagem quando o geocoding não retorna cidades', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText('Nenhuma cidade encontrada');
});

test('não dispara busca para campo vazio ou apenas espaços', async ({ page }) => {
  let requestCount = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    requestCount += 1;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ results: [] }) });
  });

  await page.goto('/');
  const input = page.getByLabel('Nome da cidade');
  const searchButton = page.getByRole('button', { name: 'Buscar' });

  await searchButton.click();
  await input.fill('   ');
  await searchButton.click();

  await expect(page.getByText('Busque uma cidade para ver o clima')).toBeVisible();
  expect(requestCount).toBe(0);
});

test('sanitiza caracteres especiais antes de chamar o geocoding', async ({ page }) => {
  let requestedName: string | null = null;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    requestedName = new URL(route.request().url()).searchParams.get('name');
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ results: [] }) });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo <script>alert(1)</script> ☀️');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText('Nenhuma cidade encontrada');
  expect(requestedName).toBe('São Paulo ☀️');
});

test('exibe erro quando o forecast está incompleto', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ current: {}, daily: {} }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText(
    'O serviço de clima retornou dados inválidos. Tente novamente.',
  );
  await expect(page.getByRole('region', { name: 'Clima atual em São Paulo' })).toHaveCount(0);
});

test('renderiza o clima corretamente em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });
  await mockForecast(page);

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('region', { name: 'Clima atual em São Paulo' })).toContainText(
    'São Paulo, São Paulo',
  );
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
});
