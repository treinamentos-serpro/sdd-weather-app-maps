// "celsius" é o padrão da sessão; "fahrenheit" é a alternativa via toggle (RF04)
export type Unit = 'celsius' | 'fahrenheit';

export type WeatherErrorKind = 'not_found' | 'network';

// classe (não apenas interface) para poder ser lançada/capturada com `instanceof`
export class WeatherServiceError extends Error {
  constructor(
    public readonly kind: WeatherErrorKind,
    message: string, // mensagem segura para exibição ao usuário
  ) {
    super(message);
  }
}
