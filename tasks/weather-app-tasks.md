# Backlog de Implementação — Weather App

As tarefas abaixo são derivadas de `plans/weather-app-plan.md` e estão
organizadas por entrega e dependência. Cada tarefa usa o identificador `T-NN`
e informa título, descrição curta, critérios de aceite, dependências, arquivos
prováveis e tipo (`UI`, `Data`, `Test` ou `Infra`).

## Pré-requisito — Bootstrap de infraestrutura

### T-01 — Preparar a configuração de execução
- **Descrição:** Confirmar scripts, dependências e comandos básicos do projeto.
- **Critérios de aceite:** `pnpm lint`, `pnpm build` e `pnpm test` são reconhecidos pelo projeto; nenhuma biblioteca de estado global ou UI kit é adicionada.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `package.json`.
- **Tipo:** Infra

## Entrega 1 — Tipos

### T-02 — Definir os tipos de clima
- **Descrição:** Criar os contratos `City`, `CurrentWeather`, `ForecastDay` e `WeatherData` com temperaturas canônicas em Celsius.
- **Critérios de aceite:** Os tipos representam todos os campos do plano; campos opcionais do clima atual aceitam `null`; `WeatherData.forecast` exige exatamente o formato de cinco dias em nível de domínio.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

### T-03 — Definir os tipos de busca e erro
- **Descrição:** Criar `Unit`, `SearchState` e `WeatherServiceError` para os contratos de estado e falha.
- **Critérios de aceite:** `SearchState` possui apenas `empty`, `loading`, `disambiguation`, `error` e `success`; `Unit` aceita apenas Celsius/Fahrenheit; o erro distingue `not_found` e `network`.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/types/search.ts`, `src/types/errors.ts`.
- **Tipo:** Data

## Entrega 2 — Funções de domínio

### T-04 — Implementar a sanitização de consulta
- **Descrição:** Criar a função que limpa a entrada da busca e limita seu tamanho.
- **Critérios de aceite:** Remove tags e scripts; preserva acentos e caixa; limita a 100 caracteres; identifica entrada vazia ou apenas espaços sem fazer I/O.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/sanitizeQuery.ts`.
- **Tipo:** Data

### T-05 — Implementar a conversão de temperatura
- **Descrição:** Criar conversões Celsius/Fahrenheit e a função de temperatura exibida.
- **Critérios de aceite:** As fórmulas direta e inversa estão corretas; `toDisplayTemperature` usa a unidade recebida e arredonda para inteiro; os dados originais não são mutados.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data

### T-06 — Implementar a tradução de códigos meteorológicos
- **Descrição:** Criar o mapa único de códigos WMO para textos em pt-BR.
- **Critérios de aceite:** Todos os agrupamentos definidos no plano são cobertos; códigos desconhecidos retornam `Condição desconhecida`; a função não depende de rede ou UI.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/weatherCode.ts`.
- **Tipo:** Data

## Entrega 3 — Acesso aos dados

### T-07 — Implementar o cliente HTTP comum
- **Descrição:** Encapsular `fetch`, timeout de 8 segundos, cancelamento e classificação de erros HTTP/rede.
- **Critérios de aceite:** Aceita `AbortSignal`; aborta após 8 segundos; classifica falhas de rede, 5xx e 429 como `network`; não expõe detalhes técnicos para a UI.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/services/httpClient.ts`.
- **Tipo:** Data

### T-08 — Implementar o parsing de geocoding
- **Descrição:** Converter um payload válido da API em uma lista de `City` e classificar resposta vazia.
- **Critérios de aceite:** Mapeia id, nome, país, região, coordenadas e timezone; preserva a ordem da API; lista vazia ou ausente produz `not_found`; payload inválido produz `network`.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Tipo:** Data

### T-09 — Conectar o serviço de geocoding à API
- **Descrição:** Montar a URL de geocoding e executar a consulta usando o cliente HTTP.
- **Critérios de aceite:** Usa `name`, `count=10`, `language=pt` e `format=json`; codifica a query; aceita cancelamento; não chama a API quando recebe query vazia.
- **Dependências:** T-04, T-07, T-08.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Tipo:** Data

### T-10 — Implementar o parsing de forecast
- **Descrição:** Converter o payload de previsão em `CurrentWeather` e cinco `ForecastDay`.
- **Critérios de aceite:** Usa `daily.weather_code`; mantém Celsius; converte campos opcionais ausentes para `null`; rejeita menos de cinco dias, campos obrigatórios ausentes ou payload malformado como `network`.
- **Dependências:** T-02, T-03, T-06.
- **Arquivos prováveis:** `src/services/forecastService.ts`.
- **Tipo:** Data

### T-11 — Conectar o serviço de forecast à API
- **Descrição:** Montar a URL de forecast por coordenadas e combinar a cidade com o parsing do payload.
- **Critérios de aceite:** Solicita campos current/daily, `forecast_days=5` e `timezone=auto`; usa `httpClient`; aceita cancelamento; retorna `WeatherData` completo ou erro tipado.
- **Dependências:** T-02, T-07, T-10.
- **Arquivos prováveis:** `src/services/forecastService.ts`.
- **Tipo:** Data

## Entrega 4 — Orquestração e estado

### T-12 — Implementar as transições da busca
- **Descrição:** Criar reducer ou função pura que modele as transições válidas da state machine.
- **Critérios de aceite:** Define ações para início, geocoding, seleção, sucesso, falha e retry; estados são mutuamente exclusivos; transições inválidas não produzem estado inconsistente.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/hooks/searchReducer.ts`, `src/types/search.ts`.
- **Tipo:** Data

### T-13 — Implementar o hook de busca
- **Descrição:** Orquestrar geocoding, forecast, seleção, retry e descarte de respostas obsoletas usando as transições definidas.
- **Critérios de aceite:** Inicia em `empty`; cidade única segue ao forecast; múltiplas cidades ficam em `disambiguation`; retry repete a última ação; respostas antigas não sobrescrevem a mais recente.
- **Dependências:** T-09, T-11, T-12.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Tipo:** Data

### T-14 — Implementar o hook de unidade
- **Descrição:** Manter a unidade da sessão e alterná-la sem tocar no estado ou nos services de busca.
- **Critérios de aceite:** Inicia em Celsius; alterna somente entre Celsius e Fahrenheit; não dispara rede nem altera `SearchState`.
- **Dependências:** T-03, T-05.
- **Arquivos prováveis:** `src/hooks/useTemperatureUnit.ts`.
- **Tipo:** UI

## Entrega 5 — Componentes de apresentação

### T-15 — Criar o formulário de busca
- **Descrição:** Implementar campo, label, botão e submissão por Enter/clique.
- **Critérios de aceite:** Possui label semântico e foco visível; Enter e clique emitem o mesmo evento; entrada inválida não emite busca.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Tipo:** UI

### T-16 — Criar a visualização de estados
- **Descrição:** Renderizar vazio e carregamento com semântica acessível.
- **Critérios de aceite:** Vazio usa `data-testid="empty-state"`; carregamento usa `role="status"`; cada estado apresenta apenas sua própria mensagem.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/components/StatusView.tsx`.
- **Tipo:** UI

### T-17 — Adicionar erro e retry à visualização de estados
- **Descrição:** Renderizar mensagens de erro e o controle para repetir a última ação.
- **Critérios de aceite:** Erro usa `role="alert"`; diferencia `not_found` de `network`; botão `Tentar novamente` é acessível e acionável por teclado.
- **Dependências:** T-16.
- **Arquivos prováveis:** `src/components/StatusView.tsx`.
- **Tipo:** UI

### T-18 — Criar a lista de desambiguação
- **Descrição:** Exibir até dez cidades e emitir a seleção do usuário.
- **Critérios de aceite:** Mostra nome, país e região quando disponível; usa chave estável; cada item tem foco visível e pode ser selecionado por mouse, Enter ou Espaço.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/components/CityDisambiguationList.tsx`.
- **Tipo:** UI

### T-19 — Criar o cartão de clima atual
- **Descrição:** Renderizar temperatura, condição e métricas atuais com unidade ativa.
- **Critérios de aceite:** Exibe temperatura, condição textual, sensação, umidade e vento; campos `null` exibem `indisponível`; usa conversão sem alterar `WeatherData`.
- **Dependências:** T-02, T-05, T-06, T-11.
- **Arquivos prováveis:** `src/components/CurrentWeatherCard.tsx`.
- **Tipo:** UI

### T-20 — Criar a lista de previsão
- **Descrição:** Renderizar os cinco dias de previsão com dados diários e unidade ativa.
- **Critérios de aceite:** Exibe exatamente cinco itens; cada item mostra data/dia, mínima, máxima e condição textual; usa diretamente o código diário traduzido.
- **Dependências:** T-02, T-05, T-06, T-11.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI

### T-21 — Criar o controle de unidade
- **Descrição:** Implementar o toggle acessível para Celsius/Fahrenheit.
- **Critérios de aceite:** Indica a unidade por `aria-pressed` ou equivalente; funciona com Enter e Espaço; mantém foco visível.
- **Dependências:** T-03, T-14.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI

## Entrega 6 — Composição e estilo

### T-22 — Compor o fluxo de estados no App
- **Descrição:** Conectar `useWeatherSearch` e os componentes de busca, estado e desambiguação.
- **Critérios de aceite:** Estado `status` decide a seção exibida; não há fetch em componentes; seleção e retry chegam ao hook correto; a tela inicia vazia.
- **Dependências:** T-13, T-15, T-16, T-17, T-18.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-23 — Compor o fluxo de sucesso no App
- **Descrição:** Conectar dados de sucesso, controle de unidade e cartões de clima ao App.
- **Critérios de aceite:** Clima atual e previsão aparecem em `success`; toggle atualiza ambos; nova busca não reseta a unidade da sessão.
- **Dependências:** T-14, T-19, T-20, T-21, T-22.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-24 — Aplicar layout e estilos globais
- **Descrição:** Implementar tema Tailwind, layout responsivo e estilos de foco da tela composta.
- **Critérios de aceite:** Não há overflow horizontal em 360px; informações não se sobrepõem em 360px, 768px e 1280px; controles têm foco visível.
- **Dependências:** T-23.
- **Arquivos prováveis:** `src/index.css`, `tailwind.config.js`.
- **Tipo:** UI

## Entrega 7 — Testes unitários

### T-25 — Testar a sanitização
- **Descrição:** Cobrir entradas vazias, scripts, caracteres especiais, truncamento, acentos e caixa.
- **Critérios de aceite:** Testes verificam todos os casos de T-04 e não usam rede.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/sanitizeQuery.test.ts`.
- **Tipo:** Test

### T-26 — Testar conversão de unidade
- **Descrição:** Cobrir a conversão de temperatura entre Celsius e Fahrenheit.
- **Critérios de aceite:** Testes verificam Celsius como unidade padrão, conversão direta e inversa, arredondamento, 0°C, valores negativos e valores altos; alternar a unidade não altera o valor Celsius armazenado.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test

### T-27 — Testar tradução meteorológica
- **Descrição:** Cobrir códigos conhecidos e fallback desconhecido.
- **Critérios de aceite:** Cada agrupamento definido no plano possui expectativa e nenhum teste chama a API.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/weatherCode.test.ts`.
- **Tipo:** Test

### T-28 — Testar services com mock de fetch
- **Descrição:** Validar o cliente HTTP e o service de geocoding usando `fetch` mockado.
- **Critérios de aceite:** Os testes substituem `globalThis.fetch`; cobrem query codificada, 200 vazio, 1 resultado, múltiplos resultados, 5xx, 429, erro de rede, cancelamento e timeout; nenhuma chamada acessa a Open-Meteo real.
- **Dependências:** T-07, T-08, T-09.
- **Arquivos prováveis:** `tests/unit/httpClient.test.ts`, `tests/unit/geocodingService.test.ts`.
- **Tipo:** Test

### T-29 — Testar o serviço de forecast
- **Descrição:** Validar o service de forecast com `fetch` mockado.
- **Critérios de aceite:** Os testes substituem `globalThis.fetch`; cobrem payload completo, campos opcionais ausentes, JSON inválido, menos de cinco dias e dia incompleto; nenhuma chamada acessa a Open-Meteo real.
- **Dependências:** T-10, T-11.
- **Arquivos prováveis:** `tests/unit/forecastService.test.ts`.
- **Tipo:** Test

### T-30 — Testar reducer e hook de busca
- **Descrição:** Cobrir transições, retry e concorrência do estado de busca.
- **Critérios de aceite:** Testes cobrem todos os cinco estados, seleção, erro, retry e descarte de resposta obsoleta com services mockados.
- **Dependências:** T-12, T-13.
- **Arquivos prováveis:** `tests/unit/searchReducer.test.ts`, `tests/unit/useWeatherSearch.test.ts`.
- **Tipo:** Test

### T-31 — Testar hook e controle de unidade
- **Descrição:** Verificar a alternância isolada de Celsius/Fahrenheit.
- **Critérios de aceite:** Unidade inicia em Celsius, alterna por chamadas sucessivas e não executa serviços de rede.
- **Dependências:** T-14, T-21.
- **Arquivos prováveis:** `tests/unit/useTemperatureUnit.test.ts`, `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test

### T-32 — Testar StatusView nos estados vazio, loading e erro
- **Descrição:** Cobrir exclusivamente os estados visuais de `StatusView` por queries acessíveis.
- **Critérios de aceite:** O estado vazio exibe `data-testid="empty-state"`; loading exibe `role="status"`; erro exibe `role="alert"`, as duas mensagens previstas e o botão `Tentar novamente`; nenhum estado exibe conteúdo de outro estado.
- **Dependências:** T-16, T-17.
- **Arquivos prováveis:** `tests/unit/StatusView.test.tsx`.
- **Tipo:** Test

### T-33 — Testar a lista de desambiguação
- **Descrição:** Cobrir a renderização e seleção acessível de cidades ambíguas.
- **Critérios de aceite:** Testes verificam país/região, chave estável, foco e seleção por mouse, Enter ou Espaço.
- **Dependências:** T-18.
- **Arquivos prováveis:** `tests/unit/CityDisambiguationList.test.tsx`.
- **Tipo:** Test

### T-34 — Testar cartões de clima e previsão
- **Descrição:** Cobrir clima atual, campos indisponíveis e previsão de cinco dias.
- **Critérios de aceite:** Testes verificam conversão de temperatura, `indisponível`, condição textual e exatamente cinco itens de previsão.
- **Dependências:** T-19, T-20.
- **Arquivos prováveis:** `tests/unit/CurrentWeatherCard.test.tsx`, `tests/unit/ForecastList.test.tsx`.
- **Tipo:** Test

## Entrega 8 — Testes E2E

### T-35 — Testar o fluxo feliz E2E
- **Descrição:** Validar busca única, clima atual, previsão e toggle com rotas Open-Meteo interceptadas.
- **Critérios de aceite:** O fluxo mostra cinco dias; a troca de unidade não gera nova chamada de rede; o mesmo fluxo passa em viewport mobile de 360px sem perda de conteúdo ou funcionalidade.
- **Dependências:** T-23, T-24.
- **Arquivos prováveis:** `tests/e2e/happy-path.spec.ts`.
- **Tipo:** Test

### T-36 — Testar desambiguação E2E
- **Descrição:** Validar múltiplos resultados e seleção de cidade por teclado.
- **Critérios de aceite:** O clima não aparece antes da seleção; país/região são exibidos; Enter ou Espaço conclui a seleção.
- **Dependências:** T-22, T-24.
- **Arquivos prováveis:** `tests/e2e/disambiguation.spec.ts`.
- **Tipo:** Test

### T-37 — Testar erros e retry E2E
- **Descrição:** Validar cidade inexistente, falhas de rede e repetição da última ação.
- **Critérios de aceite:** Mensagens corretas aparecem com `role="alert"`; retry refaz a chamada esperada; a API real nunca é usada.
- **Dependências:** T-22, T-24.
- **Arquivos prováveis:** `tests/e2e/errors-and-retry.spec.ts`.
- **Tipo:** Test

### T-38 — Testar responsividade e compatibilidade E2E
- **Descrição:** Executar o fluxo principal nos breakpoints e engines previstos.
- **Critérios de aceite:** O fluxo funciona em 360px, 768px e 1280px; não há overflow horizontal; Chromium e WebKit são executados.
- **Dependências:** T-35, T-24.
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test

### T-39 — Testar performance e teclado E2E
- **Descrição:** Medir loading, primeiro render e navegação por teclado em rede controlada.
- **Critérios de aceite:** Loading aparece em até 200 ms; clima completo em até 2 s no cenário definido; Tab, Enter e Espaço alcançam os controles sem bloqueio.
- **Dependências:** T-35, T-36.
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`, `tests/e2e/keyboard-accessibility.spec.ts`.
- **Tipo:** Test

## Entrega 9 — Hardening e validação final

### T-40 — Executar lint e build finais
- **Descrição:** Validar qualidade estática e compilação após a implementação.
- **Critérios de aceite:** `pnpm lint` e `pnpm build` terminam sem erros; falhas são corrigidas apenas nos arquivos do escopo.
- **Dependências:** T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-32, T-33, T-34, T-35, T-36, T-37, T-38, T-39.
- **Arquivos prováveis:** `package.json`, `biome.json`, arquivos `src/` alterados.
- **Tipo:** Infra

### T-41 — Executar a suíte final de testes
- **Descrição:** Rodar testes unitários e E2E como verificação integrada do backlog.
- **Critérios de aceite:** `pnpm test` e a suíte Playwright configurada passam nos engines disponíveis; limitações externas do runner são registradas sem mascarar falhas.
- **Dependências:** T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-32, T-33, T-34, T-35, T-36, T-37, T-38, T-39, T-40.
- **Arquivos prováveis:** `package.json`, `playwright.config.ts`.
- **Tipo:** Infra

## Rastreabilidade com a especificação

Os critérios de aceite acima são verificáveis por comportamento, compilação ou
teste automatizado. A tabela abaixo liga cada tarefa aos requisitos e
critérios da spec; tarefas de suporte técnico estão marcadas com a seção
correspondente do plano quando não implementam um requisito funcional direto.

| Tarefa | Requisitos rastreados |
|---|---|
| T-01 | RNF05; plano §2 e §9 |
| T-02 | Data Model §4.1; RF02; RF03; RF04 |
| T-03 | RF04; RF05; plano §8 |
| T-04 | AC01.3; AC01.4; AC01.6; RNF11 |
| T-05 | RF04; AC02.1; AC02.3; AC04.3 |
| T-06 | RF02; AC02.1; AC02.2; AC03.2 |
| T-07 | RNF09; AC05.4; plano §8.2 |
| T-08 | AC01.1; AC01.2; AC05.3; RF06 |
| T-09 | AC01.1; AC01.2; AC01.4; AC06.1; RNF09 |
| T-10 | AC02.4; AC03.1; AC03.2; AC03.3; AC03.4 |
| T-11 | RF03; AC03.1; AC03.3; AC03.4; RNF09 |
| T-12 | AC05.5; plano §7.2 |
| T-13 | RF01; RF05; RF06; AC05.2; AC05.4; RNF12 |
| T-14 | RF04; AC04.1; AC04.3 |
| T-15 | RF01; AC01.3; AC01.4; AC01.5; AC01.6; RNF07; RNF11 |
| T-16 | RF05; AC05.1; AC05.2; AC05.5 |
| T-17 | RF05; AC05.3; AC05.4; AC05.5; RNF07 |
| T-18 | RF06; AC06.1; AC06.2; AC06.3; AC06.4; RNF07 |
| T-19 | RF02; AC02.1; AC02.2; AC02.3; AC02.4; RNF07 |
| T-20 | RF03; AC03.1; AC03.2; AC03.3; AC03.4 |
| T-21 | RF04; AC04.1; AC04.2; RNF07 |
| T-22 | RF01; RF05; RF06; AC05.5 |
| T-23 | RF02; RF03; RF04; AC02.3; AC03.1; AC04.1 |
| T-24 | RNF01; RNF07; RNF08 |
| T-25 | AC01.3; AC01.4; AC01.6; RNF11 |
| T-26 | RF04; AC02.1; AC02.3; AC04.1; AC04.3 |
| T-27 | RF02; AC02.1; AC03.2 |
| T-28 | AC01.1; AC01.2; AC05.3; AC05.4; RNF09 |
| T-29 | AC02.4; AC03.1; AC03.3; AC03.4 |
| T-30 | RF05; AC05.2; AC05.3; AC05.4; AC05.5; RNF12 |
| T-31 | RF04; AC04.1; AC04.2 |
| T-32 | AC05.1; AC05.2; AC05.3; AC05.4; AC05.5; RNF07 |
| T-33 | RF06; AC06.1; AC06.3 |
| T-34 | RF02; RF03; AC02.1; AC02.4; AC03.1; AC03.2; AC04.3 |
| T-35 | AC01.1; AC02.1; AC03.1; AC04.1; RNF01; RNF08 |
| T-36 | AC01.2; AC06.2; AC06.3; AC06.4 |
| T-37 | AC05.3; AC05.4; RF05 |
| T-38 | RNF01; RNF08; RNF10 |
| T-39 | RNF02; RNF06; RNF07 |
| T-40 | RNF03; RNF05 |
| T-41 | RNF03; RNF10; plano §9 |

## Rastreabilidade por requisito funcional

| Requisito funcional | Tarefas de implementação | Tarefas de teste/verificação | Cobertura |
|---|---|---|---|
| **RF01 — Busca de cidade por nome** | T-04, T-08, T-09, T-13, T-15, T-22 | T-25, T-28, T-32, T-35 | Coberto: sanitização, query para geocoding, busca única, entrada acessível e fluxo feliz. |
| **RF02 — Exibição do clima atual** | T-02, T-06, T-10, T-11, T-19, T-23 | T-27, T-29, T-34, T-35 | Coberto: dados atuais, tradução WMO, campos opcionais, unidade e renderização. |
| **RF03 — Previsão de 5 dias** | T-02, T-06, T-10, T-11, T-20, T-23 | T-29, T-34, T-35 | Coberto: cinco itens, timezone da API, dados diários e rejeição de payload incompleto. |
| **RF04 — Alternância de unidade de temperatura** | T-03, T-05, T-14, T-21, T-23 | T-26, T-31, T-34, T-35 | Coberto: conversão pura, estado independente, controle acessível e ausência de nova requisição. |
| **RF05 — Estados de carregamento, erro e vazio** | T-03, T-07, T-12, T-13, T-16, T-17, T-22 | T-30, T-32, T-37, T-39 | Coberto: estados mutuamente exclusivos, timeout/rede, mensagens, retry e loading observável. |
| **RF06 — Desambiguação de cidades** | T-08, T-09, T-13, T-18, T-22 | T-30, T-33, T-36 | Coberto: até dez resultados, localização, seleção explícita e navegação por teclado. |

### Requisitos sem tarefa correspondente

Nenhum requisito funcional da spec está sem tarefa correspondente. Os seis
requisitos `RF01` a `RF06` possuem tarefas de implementação e tarefas de
teste/verificação associadas.

## Prioridade e tamanho relativo

**P0** representa o caminho mínimo demonstrável do produto; **P1** cobre
resiliência, acessibilidade e cenários funcionais essenciais; **P2** reúne
compatibilidade, performance e validações finais. O tamanho é relativo ao
esforço e ao risco da tarefa, não ao número de linhas produzidas.

| Tarefa | Prioridade | Tamanho | Motivo resumido |
|---|---|---|---|
| T-01 | P0 | P | Bootstrap necessário para executar o projeto. |
| T-02 | P0 | P | Contratos centrais de clima. |
| T-03 | P0 | P | Contratos de busca, unidade e erro. |
| T-04 | P0 | P | Sanitização usada no primeiro fluxo de busca. |
| T-05 | P0 | P | Conversão usada na apresentação das temperaturas. |
| T-06 | P0 | P | Tradução usada em clima atual e previsão. |
| T-07 | P0 | M | Timeout, abort e classificação comum de rede. |
| T-08 | P0 | M | Parsing e validação de resultados de cidade. |
| T-09 | P0 | M | Primeira integração com a API de geocoding. |
| T-10 | P0 | M | Parsing e validação do payload de forecast. |
| T-11 | P0 | M | Integração do forecast com dados de domínio. |
| T-12 | P0 | M | State machine que controla todo o fluxo. |
| T-13 | P0 | G | Orquestra duas APIs, retry e concorrência. |
| T-14 | P0 | P | Estado independente da unidade. |
| T-15 | P0 | P | Entrada principal do usuário. |
| T-16 | P0 | P | Feedback inicial de vazio e loading. |
| T-17 | P1 | P | Mensagens de erro e retry explícito. |
| T-18 | P1 | P | Seleção de cidades ambíguas. |
| T-19 | P0 | M | Exibição do clima atual. |
| T-20 | P0 | M | Exibição dos cinco dias. |
| T-21 | P1 | P | Controle acessível de unidade. |
| T-22 | P0 | M | App funcional para busca e estados. |
| T-23 | P0 | M | App funcional com dados de sucesso. |
| T-24 | P1 | M | Layout responsivo e foco visual. |
| T-25 | P0 | P | Teste da entrada e sanitização. |
| T-26 | P0 | P | Teste da conversão de unidade. |
| T-27 | P0 | P | Teste da tabela WMO. |
| T-28 | P0 | M | Testes de rede e geocoding com fetch mockado. |
| T-29 | P0 | M | Testes do forecast com fetch mockado. |
| T-30 | P1 | M | Testes de state machine e concorrência. |
| T-31 | P1 | P | Testes do hook e toggle de unidade. |
| T-32 | P1 | P | Testes de vazio, loading e erro. |
| T-33 | P1 | P | Testes de desambiguação acessível. |
| T-34 | P0 | M | Testes dos dados apresentados. |
| T-35 | P0 | M | Smoke test E2E do fluxo principal, incluindo mobile. |
| T-36 | P1 | M | E2E de desambiguação. |
| T-37 | P1 | M | E2E de erros e retry. |
| T-38 | P1 | M | E2E de breakpoints e engines. |
| T-39 | P2 | M | Métricas de performance e teclado sob rede controlada. |
| T-40 | P2 | P | Lint e build finais. |
| T-41 | P2 | P | Execução integrada da suíte final. |

## Sequência de entrega em fatias verticais

As fatias abaixo atravessam as camadas necessárias para produzir um resultado
observável. Cada fatia pode ser demonstrada antes da seguinte; os testes P0
entram junto com a funcionalidade correspondente.

### Fatia 0 — Projeto executável

**Objetivo visível:** projeto inicia e os comandos básicos funcionam.

**Tarefas:** T-01.

### Fatia 1 — Tela inicial com busca e feedback

**Objetivo visível:** usuário vê a tela vazia, digita uma cidade e recebe
feedback de loading ou cidade não encontrada, ainda com API interceptada.

**Tarefas:** T-02, T-03, T-04, T-07, T-08, T-09, T-12, T-13, T-15, T-16,
T-17, T-18, T-22, T-25, T-28, T-30, T-32.

### Fatia 2 — Primeiro clima completo

**Objetivo visível:** uma cidade única mostra clima atual e previsão de cinco
dias em Celsius, com teste E2E do caminho principal em 360px.

**Tarefas:** T-05, T-06, T-10, T-11, T-14, T-19, T-20, T-21, T-23, T-24,
T-26, T-27, T-29, T-31, T-34, T-35.

### Fatia 3 — Busca ambígua e recuperação

**Objetivo visível:** usuário escolhe entre cidades homônimas e consegue
repetir buscas que falharam.

**Tarefas:** T-33, T-36, T-37.

### Fatia 4 — Compatibilidade e qualidade de entrega

**Objetivo visível:** o mesmo fluxo permanece utilizável nos breakpoints e
engines suportados, com limites de performance verificados.

**Tarefas:** T-38, T-39, T-40, T-41.