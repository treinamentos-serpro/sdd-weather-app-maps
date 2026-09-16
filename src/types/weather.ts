export interface City {
  id: number; // id retornado pela API de geocoding, usado como key estável em listas
  name: string; // nome oficial da cidade (grafia da API, ex.: "São Paulo")
  country: string; // nome do país, exibido na desambiguação (AC06.1)
  admin1?: string; // estado/região (quando a API não retorna, campo fica ausente)
  latitude: number; // usada como parâmetro da chamada de forecast
  longitude: number; // usada como parâmetro da chamada de forecast
  timezone: string; // fuso horário IANA local da cidade (ex.: "America/Sao_Paulo"), define o "hoje" da previsão (RF03)
}

export interface CurrentWeather {
  temperatureC: number | null; // temperature_2m; null quando ausente no payload
  apparentTemperatureC: number | null; // apparent_temperature; null quando ausente no payload → UI exibe "indisponível" (AC02.4)
  humidityPercent: number | null; // relative_humidity_2m; null quando ausente (AC02.4)
  windSpeedKmh: number | null; // wind_speed_10m; null quando ausente (AC02.4)
  weatherCode: number | null; // weather_code (código WMO bruto); traduzido via tabela fixa
}

export interface ForecastDay {
  date: string | null; // "YYYY-MM-DD" (daily.time), já no timezone local da cidade, não do dispositivo
  temperatureMinC: number | null; // daily.temperature_2m_min do dia
  temperatureMaxC: number | null; // daily.temperature_2m_max do dia
  weatherCode: number | null; // daily.weather_code do dia; nunca derivado de dados horários (AC03.2)
  precipitationProbability: number; // daily.precipitation_probability_max; null vira 0
}

export interface WeatherData {
  city: City; // cidade confirmada pelo usuário (única ou selecionada na desambiguação)
  current: CurrentWeather; // snapshot do clima atual no momento da consulta
  forecast: ForecastDay[]; // sempre exatamente 5 itens (hoje + 4 dias); payload incompleto é rejeitado, não preenchido (AC03.1, AC03.4)
}
