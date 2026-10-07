# Budgemmy

[![CI](https://github.com/Bejazs/react-expenses/actions/workflows/ci.yml/badge.svg)](https://github.com/Bejazs/react-expenses/actions/workflows/ci.yml)

App móvel de finanças pessoais que ajuda a controlar as despesas fixas e momentâneas de cada mês, a saber quanto vai sobrar no fim do mês e, com a ajuda de IA, a poupar mais.

O caminho até lá está no roadmap: [#25](https://github.com/Bejazs/react-expenses/issues/25).

## Visão

1. Registar as **despesas fixas** (renda, subscrições, seguros) uma vez e vê-las aparecer sozinhas em cada ciclo, ao lado das **despesas momentâneas** do dia a dia.
2. Calcular o **saldo no fim do mês**, o atual e o **previsto**, tendo em conta o salário e o que ainda falta pagar.
3. Usar **IA** para sugerir um plano de poupança concreto a partir dos dados do utilizador e acompanhar metas.

## Funcionalidades atuais

- Registo, edição e eliminação de despesas e categorias (com ícones ou imagens).
- Rendimentos extra e salário base adicionado automaticamente no dia de pagamento.
- Ciclo de cálculo por mês civil ou de salário a salário.
- Dashboard com gráficos de gastos por categoria.
- Importação de extratos (PDF ou CSV) com IA (OpenAI, Anthropic ou Gemini), que categoriza as despesas automaticamente.
- Interface em português e inglês.
- Dados guardados localmente no dispositivo.

## Tecnologias

- [Expo](https://expo.dev) SDK 57 e React Native
- TypeScript
- React Navigation, i18next, react-native-chart-kit
- Jest (`jest-expo`) para testes

## Como correr

### Requisitos

- Node.js 20 LTS ou mais recente.
- A app **Expo Go** atualizada no telemóvel (compatível com o SDK 57), ou um emulador Android / simulador iOS.

### Instalação

```bash
git clone https://github.com/Bejazs/react-expenses.git
cd react-expenses
npm install --legacy-peer-deps
```

O `--legacy-peer-deps` é necessário por causa de dependências *peer* das versões recentes do React Native.

### Arrancar a app

```bash
npx expo start -c
```

- **Telemóvel:** abra o Expo Go e leia o código QR que aparece no terminal (no iPhone, com a câmara).
- **Emulador Android:** carregue em `a` no terminal.
- **Simulador iOS (só macOS):** carregue em `i` no terminal.
- **Web:** carregue em `w` no terminal.

Se o telemóvel não ligar, confirme que está na mesma rede Wi-Fi que o computador ou use `npx expo start --tunnel`.

### Verificações

```bash
npm run typecheck   # TypeScript
npm test            # testes (termina sozinho)
npm run test:watch  # testes em modo watch
```

### Importação de extratos com IA

1. Na aba **Configurações**, escolha o fornecedor de IA e introduza a sua chave de API.
2. Na aba **Despesas**, toque em "Importar Extrato (AI)" e escolha um PDF ou CSV.
3. As despesas válidas são categorizadas e gravadas; a app indica quantas foram importadas e quantas foram ignoradas.

## Estrutura (MVVM)

```
src/
  models/       tipos de dados (Expense, Category, Income, Settings)
  services/     persistência local e regras de negócio
    ai/         integração com a IA e leitura de PDF/CSV
  viewmodels/   hooks com o estado e as ações de cada ecrã
  views/        ecrãs
  components/   componentes reutilizáveis (modais, ícones)
  utils/        funções auxiliares (datas, IDs, validação)
  i18n/         traduções PT/EN
scripts/        utilitários de desenvolvimento (capturas de ecrã)
screenshots/    capturas da app
```

## Contribuir

O trabalho é organizado por issues ligadas ao roadmap [#25](https://github.com/Bejazs/react-expenses/issues/25). Abra um PR por issue, a referir o número da issue. Cada PR corre automaticamente o typecheck e os testes no GitHub Actions.
