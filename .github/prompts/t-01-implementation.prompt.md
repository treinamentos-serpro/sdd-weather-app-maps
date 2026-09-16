---
mode: agent
description: 'Implementa a tarefa T-01 — preparar a configuração de execução do Weather App.'
---

# Prompt de Implementação — T-01

Você é o **Code Agent** do projeto SDD Weather App. Implemente somente a
tarefa `T-01 — Preparar a configuração de execução` do backlog.

## Contexto

O projeto é uma SPA React + Vite em TypeScript strict, com pnpm, Biome,
Vitest + Testing Library e Playwright. A arquitetura e os contratos de
domínio ainda serão implementados em tarefas posteriores. Esta tarefa é um
bootstrap de infraestrutura: deve deixar os comandos básicos reconhecidos e
preservar as decisões já existentes do projeto.

Fontes de verdade:

- `tasks/weather-app-tasks.md`, tarefa T-01.
- `specs/weather-app-spec.md`.
- `plans/weather-app-plan.md`, especialmente as seções 1, 2 e 9.
- `.github/copilot-instructions.md` e `AGENTS.md`.

## Objetivo

Confirmar que o workspace está preparado para executar lint, build e testes,
sem implementar tipos, services, hooks, componentes ou funcionalidades do
Weather App.

## Escopo permitido

- Inspecionar `package.json`, configurações TypeScript/Vite, Biome, Vitest e
  Playwright já existentes.
- Corrigir ou completar apenas scripts, configurações ou dependências
  necessárias para que os comandos do projeto sejam reconhecidos.
- Criar somente arquivos de configuração estritamente necessários, caso uma
  configuração referenciada não exista.
- Preservar versões, scripts e configurações que já atendam ao objetivo.

## Critérios de aceite verificáveis

1. `pnpm lint` executa o Biome sobre `src/` e `tests/` sem erro de comando ou
   configuração.
2. `pnpm build` executa o build TypeScript/Vite sem erro de configuração.
3. `pnpm test` executa o Vitest em modo não interativo (`vitest run`) sem erro
   de configuração.
4. A configuração existente do Playwright continua reconhecida pelo comando
   `pnpm test:e2e`; não é necessário executar a suíte E2E se não houver testes
   implementados nesta etapa.
5. O projeto não ganha biblioteca de estado global, roteador, UI kit ou outra
   dependência funcional fora do escopo.
6. Nenhum arquivo de produção em `src/` é criado ou alterado para implementar
   domínio, rede ou UI.

## Arquivos prováveis

- `package.json`
- `pnpm-lock.yaml`, somente se uma dependência realmente precisar ser ajustada
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `biome.json`
- `playwright.config.ts`
- `vitest.config.ts`, somente se a configuração necessária não existir

Não altere arquivos de `src/`, `tests/`, `specs/`, `plans/` ou outras tarefas
do backlog para compensar problemas de implementação futura.

## Procedimento obrigatório

1. Leia os arquivos de configuração atuais antes de editar.
2. Compare os scripts e dependências atuais com os comandos exigidos acima.
3. Faça a menor alteração possível; se tudo já estiver correto, não edite
   arquivos de configuração.
4. Execute, nesta ordem:

   ```bash
   pnpm lint
   pnpm build
   pnpm test
   ```

5. Se algum comando falhar por uma causa introduzida ou diretamente relacionada
   à configuração, corrija a mesma tarefa e execute novamente o comando.
6. Não corrija falhas de funcionalidades ainda não implementadas nas tarefas
   seguintes.

## Restrições

- Não adicione código de produto.
- Não adicione estado global, roteamento, UI kit ou chamadas de API.
- Não use `any` nem desabilite verificações TypeScript/Biome para esconder
  problemas.
- Não faça refatorações ou formatação não relacionadas.
- Não crie commit nem altere branches.

## Formato da resposta

Ao terminar, informe de forma breve:

- arquivos alterados;
- comandos executados e resultado de cada um;
- eventuais bloqueios, limitações ou testes indisponíveis;
- confirmação de que o escopo ficou restrito à T-01.