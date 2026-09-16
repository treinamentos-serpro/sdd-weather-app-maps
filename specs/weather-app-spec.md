# Especificação do Produto — Weather App

> FUse `specs/weather-app-spec.md` como fonte da verdade. Gere
`plans/weather-app-plan.md` com as seções: Architecture, Tech Stack, Project
Structure, Data Model, Data Flow, External APIs, State Management, Error
Handling, Testing Strategy e Risks & Trade-offs.

Não gere o código final — defina decisões e contratos (tipos/interfaces).
Prefira simplicidade; evite over-engineering.onte: [`specs/discovery.md`](./discovery.md). Este documento é a fonte
> única da verdade para as fases seguintes do fluxo SDD (Plan → Tasks →
> Code → Test → Review). Não contém detalhes de implementação.

## 1. Overview

O Weather App é uma aplicação web (SPA client-side) que permite a qualquer
usuário buscar uma cidade pelo nome e consultar o clima atual e a previsão
dos próximos 5 dias (hoje + 4 dias), sem necessidade de cadastro, login ou
backend próprio. Os dados são obtidos em tempo real da API pública
Open-Meteo (geocoding + forecast), sem uso de chave de API.

O produto atende três perfis principais de uso — consulta rápida em
mobile (Ana), planejamento deliberado em desktop (Marcos) e uso com
tecnologia assistiva (Beatriz) — e deve funcionar de forma responsiva,
acessível (WCAG 2.1 AA) e resiliente a falhas da API externa.

**Objetivos do produto:**

- Permitir que o usuário descubra o clima atual de qualquer cidade em
  poucos segundos.
- Permitir planejamento de curto prazo com a previsão de 5 dias.
- Garantir que a cidade exibida seja inequivocamente a cidade buscada,
  mesmo quando há nomes duplicados.
- Ser utilizável por teclado e leitor de tela, sem depender apenas de
  cor/ícone para transmitir informação.
- Lidar de forma previsível com erros, lentidão e indisponibilidade da API.

## 2. Functional Requirements

### RF01 — Busca de cidade por nome

O sistema deve permitir que o usuário busque uma cidade digitando seu nome
em um campo de busca. A busca é case-insensitive e tolerante a
acentuação (ex.: "sao paulo", "São Paulo" e "SÃO PAULO" retornam o mesmo
resultado).

### RF02 — Exibição do clima atual

O sistema deve exibir o clima atual da cidade selecionada, incluindo
temperatura, condição (ex.: ensolarado, nublado, chuva), sensação térmica,
umidade e velocidade do vento. A tradução de cada código de condição
retornado pela API para o texto exibido em pt-BR deve seguir uma tabela de
mapeamento única e fixa, definida na fase de Plan.

### RF03 — Previsão de 5 dias

O sistema deve exibir a previsão do tempo para os próximos 5 dias (hoje +
4 dias), com resumo diário de temperatura mínima, máxima e condição
predominante por dia. O dia "hoje" é determinado pelo fuso horário local
da cidade selecionada (retornado pela API), não pelo fuso horário do
dispositivo do usuário.

### RF04 — Alternância de unidade de temperatura

O usuário deve poder alternar a exibição da temperatura entre Celsius
(padrão) e Fahrenheit, a qualquer momento, para o clima atual e para a
previsão. A conversão utiliza a fórmula padrão F = C × 9/5 + 32 (e sua
inversa para obter C a partir de F).

### RF05 — Estados de carregamento, erro e vazio

O sistema deve tratar explicitamente quatro estados, mutuamente
exclusivos, para qualquer busca: **vazio** (nenhuma busca realizada
ainda), **carregando** (requisição em andamento), **erro** (ex.: cidade
não encontrada, falha de rede, timeout) e **sucesso** (dados exibidos). No
estado de erro, o sistema deve sempre oferecer um controle explícito de
nova tentativa (retry) que repete a última busca.

### RF06 — Desambiguação de cidades com nomes duplicados

Quando a busca retornar mais de uma cidade correspondente (mesmo nome ou
correspondência parcial, ex.: mesma cidade em países ou estados
diferentes), o sistema deve exibir uma lista de até 10 resultados,
ordenados pela relevância retornada pela API de geocoding, com
informações de localização (país e/ou estado/região) para cada item, e
exigir que o usuário selecione explicitamente uma opção antes de exibir o
clima.

## 3. User Stories

### US01 — Consulta rápida do clima atual

Como **Ana, a Viajante Urbana**, quero **buscar uma cidade pelo nome e ver
o clima atual dela rapidamente pelo celular** para **decidir o que vestir
ou se preciso de guarda-chuva antes de sair de casa**.

*Requisitos relacionados: RF01 (busca de cidade por nome), RF02 (exibição
do clima atual).*

### US02 — Planejamento com previsão de 5 dias

Como **Marcos, o Planejador de Fim de Semana**, quero **ver a previsão dos
próximos 5 dias de uma cidade que não é a minha** para **decidir quais
dias são melhores para atividades ao ar livre**.

*Requisito relacionado: RF03 (previsão de 5 dias).*

### US03 — Alternância de unidade de temperatura

Como **Ana, a Viajante Urbana**, quero **alternar a temperatura exibida
entre Celsius e Fahrenheit a qualquer momento** para **interpretar o clima
atual e a previsão na unidade que me é mais familiar**.

*Requisito relacionado: RF04 (alternância de unidade de temperatura).*

### US04 — Acesso ao clima via tecnologia assistiva

Como **Beatriz, a Usuária com Necessidades de Acessibilidade**, quero
**acessar todas as informações de clima atual e de previsão por
texto/labels semânticos, navegando apenas pelo teclado** para **obter as
mesmas informações que um usuário vidente, sem depender de leitor de
mouse, cor ou ícone**.

*Requisitos relacionados: RF02 (exibição do clima atual), RF03 (previsão
de 5 dias).*

### US05 — Desambiguação de cidades com nomes duplicados

Como **Marcos, o Planejador de Fim de Semana**, quero **ver o país e/ou
estado de cada cidade retornada em uma busca com nome ambíguo antes de
escolher uma** para **ter certeza de que estou vendo o clima da cidade
certa, e não de uma homônima em outro lugar**.

*Requisito relacionado: RF06 (desambiguação de cidades com nomes
duplicados).*

### US06 — Clareza sobre estados de carregamento, erro e vazio

Como **Ana, a Viajante Urbana**, quero **entender claramente quando minha
busca está carregando, falhou (ex.: cidade não encontrada, falha de rede)
ou ainda não foi realizada** para **não confundir lentidão ou erro da API
com uma aplicação quebrada, mesmo em conexão instável na rua**.

*Requisito relacionado: RF05 (estados de carregamento, erro e vazio).*

## 4. Acceptance Criteria

Cada critério é descrito como um cenário **Given/When/Then** (Dado/Quando/
Então), objetivo e testável, servindo de base direta para os testes
automatizados (unitários e E2E) dos módulos seguintes.

### RF01 — Busca de cidade por nome

#### AC01.1 — Busca com resultado único
- **Dado** que o usuário está na tela inicial (estado vazio),
- **Quando** digita o nome de uma cidade válida que retorna exatamente um
  resultado e confirma a busca (Enter ou clique no botão buscar),
- **Então** o sistema exibe diretamente o clima da cidade correspondente,
  sem exigir passo de confirmação adicional.

#### AC01.2 — Busca com múltiplos resultados
- **Dado** que o usuário está na tela inicial (estado vazio),
- **Quando** digita o nome de uma cidade válida que retorna mais de um
  resultado e confirma a busca,
- **Então** o sistema exibe a lista de resultados para seleção, conforme
  RF06, em vez do clima diretamente.

#### AC01.3 — Busca com campo vazio ou apenas espaços
- **Dado** que o campo de busca está vazio ou contém apenas espaços em
  branco,
- **Quando** o usuário tenta confirmar a busca,
- **Então** o sistema não dispara nenhuma requisição de rede e permanece
  no estado vazio.

#### AC01.4 — Sanitização de caracteres especiais
- **Dado** que o campo de busca contém caracteres especiais, emojis ou
  marcações de script,
- **Quando** o usuário confirma a busca,
- **Então** o sistema envia à API apenas o texto sanitizado (sem tags/
  scripts executáveis) e prossegue com o fluxo normal de busca (sucesso,
  erro "cidade não encontrada" ou lista de resultados), nunca renderizando
  o valor bruto não sanitizado na UI.

#### AC01.5 — Acessibilidade do campo de busca
- **Dado** que o usuário está navegando por teclado,
- **Quando** o usuário pressiona Tab até alcançar o campo de busca,
- **Então** o campo recebe foco visível, possui label semântico associado
  e pode ser confirmado com a tecla Enter.

#### AC01.6 — Busca case-insensitive e tolerante a acentuação
- **Dado** que o usuário digita o nome de uma cidade sem respeitar
  maiúsculas/minúsculas ou acentuação (ex.: "sao paulo"),
- **Quando** confirma a busca,
- **Então** o sistema retorna o(s) mesmo(s) resultado(s) que retornaria
  para a grafia oficial da cidade (ex.: "São Paulo").

### RF02 — Exibição do clima atual

#### AC02.1 — Dados exibidos do clima atual
- **Dado** que uma cidade foi selecionada com sucesso,
- **Quando** o clima atual é carregado,
- **Então** o sistema exibe temperatura atual (inteiro, sem casas
  decimais), condição textual, sensação térmica (inteiro), umidade (%,
  inteiro) e velocidade do vento (km/h, inteiro).

#### AC02.2 — Leitura por tecnologia assistiva
- **Dado** que o clima atual está sendo exibido,
- **Quando** um leitor de tela percorre a seção de clima atual,
- **Então** todas as informações (temperatura, condição, sensação térmica,
  umidade, vento) estão disponíveis como texto, sem depender apenas de
  ícone ou cor.

#### AC02.3 — Unidade de temperatura respeitada
- **Dado** que o usuário selecionou uma unidade de temperatura (Celsius ou
  Fahrenheit),
- **Quando** o clima atual é exibido ou atualizado,
- **Então** a temperatura atual é exibida convertida para a unidade
  selecionada.

#### AC02.4 — Campo individual indisponível
- **Dado** que o payload do clima atual não inclui um ou mais campos
  (ex.: sensação térmica, umidade ou vento),
- **Quando** o clima atual é renderizado,
- **Então** os campos disponíveis são exibidos normalmente e cada campo
  ausente exibe o texto "indisponível" em vez de ser omitido
  silenciosamente ou quebrar o layout.

### RF03 — Previsão de 5 dias

#### AC03.1 — Quantidade de itens de previsão
- **Dado** que uma cidade foi selecionada com sucesso,
- **Quando** a previsão é carregada,
- **Então** o sistema exibe exatamente 5 itens de previsão, correspondentes
  a hoje + 4 dias seguintes, calculados a partir do fuso horário local da
  cidade selecionada (RF03).

#### AC03.2 — Conteúdo mínimo por item
- **Dado** que a previsão de 5 dias está sendo exibida,
- **Quando** o usuário observa qualquer item da previsão,
- **Então** esse item contém, no mínimo: data/dia da semana, temperatura
  mínima e máxima (inteiros, mesma convenção de arredondamento de
  AC02.1) e condição predominante do dia, sendo esta última obtida
  diretamente do campo diário de condição da API (`daily.weathercode`),
  sem derivação própria a partir de dados horários.

#### AC03.3 — Ausência de dados de previsão
- **Dado** que uma cidade foi selecionada,
- **Quando** a API não retorna dados de previsão para essa cidade,
- **Então** o sistema exibe o estado de erro (RF05), nunca uma lista vazia
  silenciosa.

#### AC03.4 — Previsão parcial ou incompleta
- **Dado** que uma cidade foi selecionada,
- **Quando** a API retorna menos de 5 dias de previsão, ou um dia sem
  temperatura mínima, máxima ou condição,
- **Então** o sistema exibe o estado de erro (RF05), sem preencher os
  dias ausentes com valores fictícios (ex.: zero) nem exibir uma previsão
  com menos de 5 itens.

### RF04 — Alternância de unidade de temperatura

#### AC04.1 — Recalcular sem nova requisição
- **Dado** que o clima atual e/ou a previsão de 5 dias estão sendo
  exibidos,
- **Quando** o usuário aciona o controle de alternância de unidade,
- **Então** todas as temperaturas visíveis são recalculadas e exibidas na
  nova unidade imediatamente, sem disparar nova requisição de rede.

#### AC04.2 — Operável por teclado e tecnologia assistiva
- **Dado** que o usuário está navegando por teclado,
- **Quando** o foco chega ao controle de alternância de unidade,
- **Então** o controle é ativável via teclado (Enter/Espaço) e expõe o
  atributo `aria-pressed` (`true` = Fahrenheit ativo, `false` = Celsius
  ativo) para comunicar seu estado atual a tecnologia assistiva.

#### AC04.3 — Conversão correta em valores de borda
- **Dado** um valor de temperatura em Celsius igual a 0, -10 ou outro
  valor arbitrário,
- **Quando** o sistema converte esse valor para Fahrenheit (ou vice-versa),
- **Então** o resultado da conversão é matematicamente correto (ex.: 0°C =
  32°F, -10°C = 14°F).

### RF05 — Estados de carregamento, erro e vazio

#### AC05.1 — Estado vazio inicial
- **Dado** que o usuário acabou de abrir a aplicação e ainda não realizou
  nenhuma busca,
- **Quando** a tela inicial é renderizada,
- **Então** o sistema exibe, em um elemento com `data-testid="empty-
  state"`, o texto "Busque uma cidade para ver o clima.".

#### AC05.2 — Estado de carregamento
- **Dado** que o usuário confirmou uma busca válida,
- **Quando** a requisição à API está em andamento,
- **Então** o sistema exibe um indicador de carregamento visível,
  contido em um elemento com `role="status"`, anunciado automaticamente
  a tecnologia assistiva.

#### AC05.3 — Erro: cidade não encontrada
- **Dado** que o usuário buscou uma cidade que não existe ou não retorna
  resultados,
- **Quando** a resposta da API indica ausência de resultados,
- **Então** o sistema exibe, em um elemento com `role="alert"`, a
  mensagem "Cidade não encontrada. Verifique o nome e tente novamente.",
  sem termos técnicos ou códigos HTTP.

#### AC05.4 — Erro: falha de rede, timeout, 5xx ou 429
- **Dado** que o usuário confirmou uma busca,
- **Quando** ocorre falha de rede, timeout (ver RNF09), erro do servidor
  (5xx) ou limite de requisições (429),
- **Então** o sistema exibe, em um elemento com `role="alert"`, a
  mensagem "Não foi possível obter o clima agora. Tente novamente." e um
  botão "Tentar novamente" que repete a última busca.

#### AC05.5 — Exclusividade de estados
- **Dado** qualquer momento de uso da aplicação,
- **Quando** o sistema está em um dos estados (vazio, carregando, erro ou
  sucesso com dados),
- **Então** apenas esse estado é exibido, nunca dois estados simultâneos e
  conflitantes.

### RF06 — Desambiguação de cidades com nomes duplicados

#### AC06.1 — Múltiplos resultados
- **Dado** que a busca retorna mais de uma cidade correspondente,
- **Quando** os resultados são exibidos,
- **Então** o sistema mostra uma lista de no máximo 10 itens, ordenados
  pela relevância retornada pela API de geocoding, com nome da cidade,
  estado/região (quando aplicável) e país para cada item.

#### AC06.2 — Confirmação obrigatória antes de exibir o clima
- **Dado** que a lista de múltiplos resultados está sendo exibida,
- **Quando** o usuário ainda não selecionou nenhum item da lista,
- **Então** o clima (atual e previsão) não é exibido.

#### AC06.3 — Seleção via teclado
- **Dado** que a lista de resultados está sendo exibida,
- **Quando** o usuário navega pela lista usando o teclado (Tab/setas) e
  confirma com Enter,
- **Então** o item selecionado é escolhido e o clima correspondente é
  carregado.

#### AC06.4 — Resultado único não exige confirmação
- **Dado** que a busca retorna exatamente um resultado,
- **Quando** o resultado é processado,
- **Então** o sistema exibe o clima diretamente, sem exigir passo de
  confirmação adicional.

## 5. Non-Functional Requirements

| ID | Requisito | Critério verificável |
|---|---|---|
| RNF01 | Responsividade | Layout se adapta sem quebra visual em viewports de 360px, 768px e 1280px (ver RNF08). |
| RNF02 | Desempenho percebido | Indicador de carregamento visível é exibido em até 200ms, contados a partir da confirmação da busca (submit), com dado completo em até 2s (ver RNF06). |
| RNF03 | Acessibilidade semântica | Componentes interativos usam roles/labels/ARIA apropriados e são operáveis via teclado (Tab/Enter/Espaço). |
| RNF04 | Disponibilidade/Resiliência | Falhas da API (timeout — ver RNF09 —, 5xx, 429) resultam em mensagem de erro tratada, nunca em tela em branco ou exceção não tratada visível ao usuário. |
| RNF05 | Manutenibilidade | Código organizado em camadas (UI em `components/`, lógica de dados em `services/`, hooks em `hooks/`, tipos em `types/`), conforme convenção do projeto. |
| RNF06 | Performance mensurável | Tempo até o primeiro render do clima após busca válida ≤ 2s, medido com throttling de rede equivalente ao perfil "Fast 4G" (ex.: Chrome DevTools Protocol/Playwright network throttling). |
| RNF07 | Conformidade de acessibilidade | Interface atende WCAG 2.1 nível AA: contraste mínimo 4.5:1 para texto normal, foco visível em todos os elementos interativos, ordem do DOM igual à ordem visual e nenhum uso de `tabindex` positivo. |
| RNF08 | Breakpoints definidos | Interface testada e funcional sem perda de funcionalidade em 360px, 768px e 1280px de largura. |
| RNF09 | Timeout e fallback de API | Requisições à API expiram em até 8 segundos; ao expirar ou falhar, o usuário recebe a mensagem de erro definida em AC05.4, com opção de tentar novamente. |
| RNF10 | Compatibilidade de navegadores | Aplicação funcional nas últimas 2 versões estáveis de Chrome, Firefox, Safari e Edge; validado via projetos Playwright para os engines Chromium e WebKit (Firefox conforme disponibilidade do runner). |
| RNF11 | Segurança básica de cliente | Entrada de busca é limitada a 100 caracteres e sanitizada (remoção de tags HTML/scripts) antes de uso; todas as chamadas à API usam exclusivamente HTTPS. |
| RNF12 | Integridade de requisições concorrentes | Ao disparar uma nova busca antes da anterior concluir, apenas a resposta da requisição mais recente é aplicada ao estado da UI; respostas de requisições obsoletas são descartadas. |

## 6. Edge Cases

- Busca com campo vazio ou apenas espaços em branco: não deve disparar
  requisição nem exibir estado de erro (RF01/AC01.3).
- Busca com caracteres especiais, emojis ou scripts (ex.: tentativa de
  injeção): a entrada deve ser tratada como texto de busca sanitizado,
  sem execução ou reflexo não sanitizado na UI (RF01/AC01.4).
- Busca com mais de 100 caracteres: a entrada é truncada em 100
  caracteres antes de ser enviada à API (RNF11).
- Cidade inexistente ou nome incorreto: exibir mensagem de erro específica
  ("cidade não encontrada"), distinta de erro genérico de rede
  (RF05/AC05.3).
- Múltiplas cidades com o mesmo nome (ex.: "Springfield", "São José"):
  aplicar fluxo de desambiguação (RF06/AC06.1).
- Falha de rede (offline) durante a busca: exibir mensagem de erro de
  conectividade com opção de nova tentativa (RF05/AC05.4).
- Timeout da API (resposta lenta além do limite de 8s definido em RNF09):
  tratar como erro de indisponibilidade (RF05/AC05.4), não deixar o
  indicador de carregamento indefinidamente.
- Resposta HTTP 429 (limite de requisições excedido): exibir mensagem de
  indisponibilidade temporária, sem expor detalhes técnicos do status
  (RF05/AC05.4).
- Resposta HTTP 5xx do serviço externo: tratar como falha genérica de
  serviço, com opção de tentar novamente (RF05/AC05.4).
- Cidade encontrada mas sem dados de previsão disponíveis: tratar como
  estado de erro, não como lista vazia (RF03/AC03.3).
- Alternância de unidade de temperatura sem clima carregado ainda: o
  controle pode estar disponível, mas não deve gerar erro nem requisição
  desnecessária (RF04/AC04.1).
- Conversão de temperatura em valores de borda: 0°C, temperaturas
  negativas e valores muito altos/baixos devem converter corretamente
  (RF04/AC04.3).
- Primeira visita à aplicação (nenhuma busca realizada): exibir estado
  vazio, nunca erro ou tela em branco (RF05/AC05.1).
- Perda de conexão durante a alternância de unidade (que não depende de
  rede): a alternância deve continuar funcionando localmente com os dados
  já carregados (RF04/AC04.1).
- Buscas concorrentes/rápidas (usuário confirma uma nova busca antes da
  resposta anterior chegar): apenas o resultado da requisição mais recente
  é aplicado à UI; respostas de requisições obsoletas são descartadas
  (RNF12).
- Geocoding responde HTTP 200 com lista de resultados vazia (nenhuma
  cidade encontrada, sem erro de transporte): tratar exatamente como
  "cidade não encontrada" (RF05/AC05.3), nunca como falha de rede ou tela
  em branco.
- Resposta de previsão parcial/incompleta (API retorna menos de 5 dias, ou
  um ou mais dias sem temperatura mínima/máxima/condição): tratar como
  estado de erro (RF03/AC03.4), sem preencher os dias ausentes com valores
  fictícios (ex.: zero) nem exibir uma previsão com menos de 5 itens.
- Resposta de clima atual parcial (payload sem um ou mais campos, ex.:
  sensação térmica, umidade ou vento ausentes/nulos): exibir os campos
  disponíveis normalmente e indicar textualmente "indisponível" apenas
  para o(s) campo(s) faltante(s) (RF02/AC02.4), sem quebrar o layout nem
  disparar erro fatal para a tela inteira.
- Resposta malformada ou com schema inesperado da API (JSON inválido,
  campos renomeados/ausentes que impedem o parse): tratar como falha
  genérica de serviço (RF05/AC05.4), com opção de tentar novamente;
  detalhes técnicos do erro nunca são expostos ao usuário.

## 7. Assumptions

- A aplicação é um SPA client-side, sem backend próprio, consumindo
  diretamente a API pública Open-Meteo (geocoding + forecast), sem uso de
  chave de API.
- Não há autenticação de usuário nesta versão.
- A unidade padrão de temperatura é Celsius; Fahrenheit é alternativa via
  toggle.
- "5 dias de previsão" significa hoje + 4 dias seguintes, com granularidade
  diária (resumo mín./máx./condição por dia, sem variação horária dentro
  do dia).
- Suporte a "dispositivos móveis" significa design responsivo via
  navegador; não é um aplicativo nativo (iOS/Android).
- Não há persistência de preferências do usuário (última cidade buscada,
  unidade de temperatura selecionada) entre sessões nesta versão (MVP):
  cada sessão inicia sempre no estado vazio, com a unidade padrão Celsius.
  Caso essa decisão mude no futuro, qualquer persistência será local (ex.:
  `localStorage`), nunca em backend próprio.
- Não há cache de respostas da API nesta versão (MVP), a menos que seja
  decidido em contrário na fase de Plan.
- O idioma da interface é pt-BR; não há suporte a outros idiomas nesta
  versão.
- Suporte a PWA instalável (manifest, ícone de instalação, uso offline)
  está fora de escopo nesta versão: é inconsistente com a decisão de não
  ter cache de respostas da API (acima), já que um app instalável
  tipicamente depende de cache/service worker para funcionar offline.

## 8. Risks

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| 1 | Dependência da API externa (indisponibilidade, mudança de contrato, limites de uso) | Média | Alto | Isolar rede em `services/`; definir timeout e fallback de erro (RNF09); camada de abstração para facilitar troca de provedor. |
| 2 | Ambiguidade de cidades com nomes duplicados | Alta | Médio | Exibir país/estado nos resultados e exigir confirmação explícita (RF06). |
| 3 | Falta de definição sobre cache/offline | Baixa | Médio | Decidido: sem cache e sem persistência de preferências nesta versão (ver Assumptions). |
| 4 | UX ruim em conexões lentas (loading mal tratado) | Média | Médio | Tratar explicitamente estados de loading/erro/vazio em todos os componentes (RF05). |
| 5 | Limites de uso (rate limit) da API gratuita em picos de tráfego | Baixa | Alto | Tratamento de erro específico para status 429 (Edge Cases); considerar cache básico em fase futura. |
| 6 | Acessibilidade não atingir padrão WCAG | Média | Médio | Testar com leitores de tela e navegação por teclado desde os primeiros componentes (RNF03, RNF07). |
| 7 | Escopo de "mobile" mal interpretado (responsivo vs. PWA) | Baixa | Médio | Decidido: responsivo via navegador; PWA instalável fora de escopo nesta versão (ver Out of Scope, Assumptions). |
| 8 | Falta de métricas de sucesso definidas | Baixa | Médio | Registrado como Open Question; não bloqueia o MVP funcional. |
| 9 | Conversão de temperatura incorreta ao alternar C/F | Baixa | Alto | Critérios de aceite explícitos para valores de borda (RF04); cobertura de testes unitários dedicados na fase de Test. |
| 10 | Regressão de UI ao evoluir componentes sem testes | Média | Médio | Cobertura de testes unitários (Vitest) e E2E (Playwright) desde o início. |

## 9. Out of Scope

- Autenticação, cadastro ou perfis de usuário.
- Persistência de dados em backend próprio (qualquer persistência é local
  no navegador, se existir).
- Aplicativo nativo (iOS/Android).
- PWA instalável (manifest, ícone de instalação, uso offline/service
  worker) nesta versão (ver Assumptions).
- Autocomplete/sugestões de cidade enquanto o usuário digita; a busca só
  é disparada quando o usuário confirma (Enter ou clique), conforme RF01
  e seus critérios de aceite.
- Geolocalização automática do usuário como atalho de busca; a única
  forma de busca nesta versão é por nome de cidade digitado (RF01).
- Internacionalização/suporte a idiomas além de pt-BR.
- Cache de respostas da API nesta versão (MVP).
- Painel de métricas/analytics de uso para o negócio.
- Notificações push ou alertas proativos de clima.

## 10. Open Questions

- Quais métricas de sucesso o negócio deseja acompanhar após o lançamento
  (ex.: buscas com sucesso, taxa de erro, tempo de sessão)? Não bloqueia a
  implementação do MVP, mas deve ser decidido antes do lançamento.

## 11. Traceability Matrix

Tabela de rastreabilidade ligando cada User Story (seção 3) aos seus
Acceptance Criteria (seção 4) e aos Non-Functional Requirements (seção 5)
relevantes. Use-a como referência direta para quebrar tarefas (Tasks) e
para o mapeamento de casos de teste (unitários e E2E).

| User Story | Persona | RF(s) | Acceptance Criteria | RNF(s) relevantes |
|---|---|---|---|---|
| US01 — Consulta rápida do clima atual | Ana | RF01, RF02 | AC01.1, AC01.2, AC01.3, AC01.4, AC01.5, AC01.6, AC02.1, AC02.2, AC02.3, AC02.4 | RNF01, RNF02, RNF06, RNF09, RNF11, RNF12 |
| US02 — Planejamento com previsão de 5 dias | Marcos | RF03 | AC03.1, AC03.2, AC03.3, AC03.4 | RNF01, RNF06, RNF08 |
| US03 — Alternância de unidade de temperatura | Ana, Marcos | RF04 | AC04.1, AC04.2, AC04.3 | RNF03 |
| US04 — Acesso ao clima via tecnologia assistiva | Beatriz | RF02, RF03 | AC02.2, AC02.4, AC03.2 (diretos); AC01.5, AC04.2, AC05.2, AC05.3, AC05.4, AC06.3 (acessibilidade transversal a outros RFs) | RNF03, RNF07 |
| US05 — Desambiguação de cidades com nomes duplicados | Marcos | RF06 | AC06.1, AC06.2, AC06.3, AC06.4 | RNF01, RNF03 |
| US06 — Clareza sobre estados de carregamento, erro e vazio | Ana | RF05 | AC05.1, AC05.2, AC05.3, AC05.4, AC05.5 | RNF02, RNF04, RNF09, RNF12 |

> **Nota:** RNF05 (Manutenibilidade) e RNF10 (Compatibilidade de
> navegadores) aplicam-se transversalmente a todas as user stories e não
> são repetidos linha a linha.
