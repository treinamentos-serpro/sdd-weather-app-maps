# Discovery — Weather App

## Contexto

A empresa solicitou uma aplicação web de previsão do tempo. O objetivo é
permitir que usuários finais consultem o clima atual e a previsão de curto
prazo de qualquer cidade, com suporte a diferentes unidades de temperatura e
uso confortável em dispositivos móveis. Este documento organiza o briefing
inicial em requisitos, riscos e lacunas de informação antes de qualquer
especificação técnica ou implementação.

## Personas

### Ana, a Viajante Urbana
- **Objetivo principal**: decidir rapidamente o que vestir e se precisa de
  guarda-chuva antes de sair de casa ou durante deslocamentos.
- **Contexto de uso**: majoritariamente **mobile**, sessões curtas e
  frequentes, muitas vezes em conexão instável na rua.
- **Métrica de sucesso**: vê o clima atual da cidade em que está em poucos
  segundos, sem passos extras ou telas de erro.

### Marcos, o Planejador de Fim de Semana
- **Objetivo principal**: verificar a previsão de vários dias para planejar
  atividades ao ar livre em uma cidade que não é a dele.
- **Contexto de uso**: uso misto, com preferência por **desktop** em momentos
  de planejamento mais deliberado.
- **Métrica de sucesso**: compara a previsão de 5 dias com clareza e confia
  que a cidade exibida é exatamente a que procurou (sem ambiguidade de nomes).

### Beatriz, a Usuária com Necessidades de Acessibilidade
- **Objetivo principal**: obter informações de clima de forma confiável
  usando leitor de tela ou navegação por teclado, sem depender apenas de
  cores ou ícones.
- **Contexto de uso**: **mobile e desktop**, com tecnologia assistiva ativa.
- **Métrica de sucesso**: entende o clima atual e a previsão inteiramente por
  texto/labels semânticos, sem barreiras de navegação ou informação.

## Requisitos Funcionais

- RF01 — O usuário deve poder buscar uma cidade pelo nome.
- RF02 — O sistema deve exibir o clima atual da cidade selecionada
  (temperatura, condição, e indicadores relevantes como sensação térmica,
  umidade e vento).
- RF03 — O sistema deve exibir a previsão do tempo para os próximos 5 dias.
- RF04 — O usuário deve poder alternar a unidade de temperatura entre Celsius
  e Fahrenheit.
- RF05 — O sistema deve tratar explicitamente os estados de carregamento, erro
  (ex.: cidade não encontrada, falha de rede) e vazio (nenhuma busca realizada
  ainda).

## Requisitos Não-Funcionais

- RNF01 — **Responsividade**: a interface deve ser utilizável em dispositivos
  móveis, adaptando layout para telas pequenas.
- RNF02 — **Desempenho**: tempo de resposta percebido para busca e carregamento
  do clima deve ser rápido, com feedback visual de carregamento.
- RNF03 — **Acessibilidade**: uso de roles/labels semânticos, contraste
  adequado e suporte a navegação por teclado.
- RNF04 — **Disponibilidade/Resiliência**: o app deve lidar de forma
  previsível com indisponibilidade ou lentidão da API externa de clima.
- RNF05 — **Manutenibilidade**: código organizado em camadas (UI, hooks,
  serviços, tipos) para facilitar testes e evolução.
- RNF06 — **Performance mensurável**: tempo até o primeiro render do clima
  após busca válida ≤ 2s em conexão 4G simulada.
- RNF07 — **Acessibilidade com padrão de conformidade**: aderência a WCAG 2.1
  nível AA (contraste mínimo, foco visível, ordem de tabulação lógica).
- RNF08 — **Responsividade com breakpoints definidos**: suportar viewports de
  360px, 768px e 1280px sem quebra de layout ou perda de funcionalidade.
- RNF09 — **Disponibilidade/degradação da API externa**: definir timeout e
  fallback (mensagem de erro clara + nova tentativa) quando a API de clima
  estiver indisponível ou lenta.
- RNF10 — **Compatibilidade de navegadores**: suportar as últimas 2 versões de
  Chrome, Firefox, Safari e Edge.
- RNF11 — **Segurança básica de cliente**: sanitização da entrada de busca e
  uso exclusivo de HTTPS nas chamadas à API.

## Riscos

| # | Risco | Probabilidade | Impacto | Estratégia de Mitigação |
|---|---|---|---|---|
| 1 | Dependência de API externa de clima/geocoding (indisponibilidade, mudança de contrato, limites de uso) | Média | Alto — sem dados, o app não funciona | Isolar toda a rede em `services/`; definir timeout e fallback de erro; monitorar limites de requisição; ter camada de abstração que facilite trocar de provedor |
| 2 | Ambiguidade de cidades com nomes duplicados (ex.: mesma cidade em países diferentes) | Alta | Médio — usuário vê o clima errado sem perceber | Exibir país/estado nos resultados de busca; exigir confirmação explícita do usuário antes de mostrar o clima |
| 3 | Falta de definição sobre cache/offline | Média | Médio — pode gerar retrabalho de arquitetura se decidido tarde | Registrar como open question e decidir antes da fase de Plan; se não decidido, assumir "sem cache" como padrão documentado |
| 4 | UX ruim em conexões lentas (loading mal tratado) | Média | Médio — percepção de app quebrado ou travado | Tratar explicitamente estados de loading/erro/vazio em todos os componentes, com feedback visual imediato |
| 5 | Limites de uso (rate limit) da API gratuita em picos de tráfego | Baixa | Alto — app pode parar de responder para todos os usuários | Adicionar tratamento de erro específico para status 429; considerar cache básico de respostas recentes |
| 6 | Acessibilidade não atingir padrão adequado (WCAG) | Média | Médio — exclusão de usuários e possível risco de compliance | Testar com leitores de tela e navegação por teclado desde os primeiros componentes; usar roles/labels semânticos por padrão |
| 7 | Escopo mal definido de "mobile" (responsivo vs. PWA) | Média | Médio — expectativa de negócio não atendida | Confirmar definição na fase de Spec antes de iniciar o design de UI |
| 8 | Falta de métricas de sucesso definidas | Baixa | Médio — dificuldade de avaliar se o MVP atingiu o objetivo | Definir ao menos 1-2 métricas simples (ex.: buscas com sucesso, taxa de erro) antes do lançamento |
| 9 | Conversão de temperatura incorreta ao alternar C/F | Baixa | Alto — dado incorreto exibido ao usuário é um bug crítico de confiança | Cobrir a função de conversão com testes unitários dedicados, incluindo casos de borda (negativos, zero) |
| 10 | Regressão de UI ao evoluir componentes sem testes | Média | Médio — bugs visuais ou funcionais não detectados | Cobertura de testes unitários (Vitest) e E2E (Playwright) desde o início, seguindo a convenção do projeto |

## Perguntas em Aberto (Open Questions)

- Qual API de clima/geocoding será utilizada?
- A busca deve sugerir cidades conforme o usuário digita (autocomplete) ou só
  buscar ao confirmar?
- Como desambiguar cidades com nomes iguais (ex.: exibir país/estado)?
- Deve haver geolocalização automática (usar a localização atual do usuário)?
- Deve haver persistência de preferências do usuário (última cidade buscada,
  unidade escolhida) entre sessões?
- Há requisito de internacionalização (idiomas) além de pt-BR?
- Existe um público-alvo de acessibilidade específico (ex.: suporte a leitor de
  tela obrigatório)? Há exigência de conformidade formal (ex.: WCAG 2.1 AA)?
- A previsão de 5 dias deve mostrar apenas um resumo diário (mín/máx) ou também
  variação ao longo do dia? — **Impacto se não respondida**: risco de refazer
  o design dos cards de previsão após a implementação inicial.
- "Usar em dispositivos móveis" significa apenas web responsivo, ou também
  PWA instalável? — **Impacto se não respondida**: escopo técnico pode ficar
  subdimensionado frente à expectativa do negócio.
- Qual mensagem/comportamento é esperado em erro de rede, cidade inexistente ou
  timeout da API? — **Impacto se não respondida**: comportamento de erro
  inconsistente entre desenvolvedores, prejudicando a percepção de qualidade.
- Quais métricas de sucesso o negócio espera acompanhar após o lançamento
  (uso, tempo de sessão, taxa de erro)? — **Impacto se não respondida**: fica
  difícil priorizar melhorias futuras ou avaliar se o MVP atingiu o objetivo.

## Decisões

Decisões fechadas para destravar a especificação. Substituem as suposições e
perguntas em aberto correspondentes.

- **Fonte de dados: Open-Meteo (sem API key)**
  - **Justificativa**: elimina a necessidade de gestão de chaves/segredos e de
    custo, simplificando o setup do projeto.
  - **Resolve**: a pergunta "Qual API de clima/geocoding será utilizada?".

- **"5 dias" = hoje + 4 dias**
  - **Justificativa**: define granularidade e janela exatas, evitando
    interpretações divergentes entre design e implementação.
  - **Resolve**: a pergunta sobre a granularidade da previsão de 5 dias
    (permanece em aberto apenas se mostra resumo diário ou também variação
    horária dentro de cada dia).

- **Unidade padrão: Celsius**
  - **Justificativa**: alinhado à suposição já registrada e ao público
    primário de referência (pt-BR); Fahrenheit continua disponível via toggle.
  - **Resolve**: confirma formalmente a suposição de unidade padrão.

- **Sem autenticação e sem persistência de servidor**
  - **Justificativa**: reduz escopo técnico do MVP; app funciona como SPA
    client-side consumindo diretamente a API pública.
  - **Resolve**: a pergunta sobre persistência de preferências do usuário
    entre sessões — fica definido que, se houver, será local (ex.:
    localStorage), nunca em backend próprio.

- **Idioma da UI: pt-BR**
  - **Justificativa**: público-alvo inicial é de fala portuguesa; evita
    esforço de internacionalização fora do escopo do MVP.
  - **Resolve**: a pergunta "Há requisito de internacionalização (idiomas)
    além de pt-BR?" — resposta é não, para esta versão.

## Suposições (Assumptions)

- Assume-se que a aplicação será um SPA client-side sem necessidade de backend
  próprio, consumindo diretamente uma API pública de clima.
- Assume-se que não há necessidade de autenticação de usuário nesta primeira
  versão.
- Assume-se que a unidade padrão de temperatura será Celsius, com Fahrenheit
  como alternativa via toggle.
- Assume-se que "5 dias de previsão" significa granularidade diária (não
  horária).
- Assume-se que o suporte a "dispositivos móveis" significa design responsivo
  via navegador, não um app nativo.


