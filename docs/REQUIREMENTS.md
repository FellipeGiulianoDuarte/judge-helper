# Pokemon TCG Judge Helper - Requisitos

## Visão Geral

Aplicativo web mobile-first para auxiliar juízes de Pokemon TCG durante torneios.

---

## Requisitos Globais

### Navegação
- 3 tabs fixas no topo da tela: **Table Judge** | **Deck Check** | **Documentos** 
- URL reflete a aba selecionada (`/docs`, `/deck-check`, `/table-judge`)
- Navegação instantânea entre abas (SPA)

### Persistência Local
- Salvar estado da sessão no `localStorage`
- Ao recarregar, restaurar última aba e dados (contadores, timers, etc.)

### Internacionalização (i18n)
- Idiomas suportados: Inglês (padrão), Português, Espanhol
- Seletor de idioma acessível em todas as telas
- Usar biblioteca de i18n (ex: `react-i18next`)
- Persistir idioma escolhido no `localStorage`

---

## Tela 1: Documentos (`/docs`)

### Descrição
Lista de links rápidos para documentação oficial de Pokemon TCG.

### Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| DOC-01 | Exibir lista de documentos com nome clicável |
| DOC-02 | Abrir documento em nova aba ao clicar |
| DOC-03 | Documentos organizados em ordem lógica |

### Documentos Obrigatórios
1. BW Compendium (mobile)
2. Tournament Rules Handbook
3. Roadmap to TCG Attack Steps
4. TCG Banned Card List
5. TCG Errata (PDF - pCom)
6. Promo Card Legality Status
7. TCG Rulebook (PDF - pCom)
**LINKS REAIS SERÃO FORNECIDO PELO USUÁRIO. ENQUANTO NÃO FOR FORNECIDO, PERMANECER COMO MOCK.**

### UI/UX
- Lista simples e limpa
- Itens com altura suficiente para toque mobile (~56px)
- Separadores visuais entre itens

---

## Tela 2: Deck Check (`/deck-check`)

### Descrição
Ferramenta para contagem rápida de cartas durante deck check.

### Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| DC-01 | Exibir 3 contadores: **Creatures**, **Trainer**, **Energy** |
| DC-02 | Cada contador exibe valor atual |
| DC-03 | Botões de incremento rápido: +1, +2, +3, +4 |
| DC-04 | Incremento aplica ao contador selecionado |
| DC-05 | Exibir **Total** (soma dos 3 contadores) |
| DC-06 | Botão **UNDO** - desfaz última ação |
| DC-07 | Botão **RESET** - zera todos os contadores |
| DC-08 | Botão **LOOKUP CARD** - abre busca de carta (futuro) |
| DC-09 | Persistir contadores no localStorage |

### UI/UX
- Contadores com cores distintas:
  - Creatures: Vermelho/Laranja
  - Trainer: Verde
  - Energy: Azul
- Botões +1/+2/+3/+4 em grid 2x2
- Botões UNDO (azul) e RESET (laranja) no rodapé
- Contador selecionado deve ter destaque visual (borda)

### Estados
- Estado inicial: todos contadores em 0
- Histórico de ações para UNDO

---

## Tela 3: Table Judge (`/table-judge`)

### Descrição
Ferramenta para acompanhamento de mesa durante partida.

### Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| TJ-01 | Contadores de ações: **Supporter**, **Energy**, **Stadium**, **Retreat**, **Other Game Action** |
| TJ-02 | Cada botão incrementa seu respectivo contador |
| TJ-03 | Exibir **Action Total** (soma de todas as ações) |
| TJ-04 | Timer com display **Time: X** (em segundos) |
| TJ-05 | Botão **START** - inicia/continua timer |
| TJ-06 | Botão **STOP** - pausa timer |
| TJ-07 | Botão **NEXT TURN** - reseta contadores e timer para novo turno |
| TJ-08 | Persistir estado no localStorage |

### UI/UX
- Botões de ação empilhados verticalmente
- Timer em destaque grande
- Botões START/STOP lado a lado
- Botão NEXT TURN em destaque (laranja) no rodapé

### Estados
- Estado inicial: todos contadores em 0, timer em 0
- Timer conta em segundos

---

## Estrutura de Dados (localStorage)

```typescript
interface AppState {
  locale: 'en' | 'pt' | 'es';
  lastTab: '/docs' | '/deck-check' | '/table-judge';
  
  deckCheck: {
    creatures: number;
    trainer: number;
    energy: number;
    history: Action[];
  };
  
  tableJudge: {
    supporter: number;
    energy: number;
    stadium: number;
    retreat: number;
    otherAction: number;
    timerSeconds: number;
  };
}
```

---

## Critérios de Aceite

- [ ] Navegação por tabs funcional com URL correta
- [ ] Persistência de dados ao recarregar página
- [ ] Troca de idioma funcionando (EN/PT/ES)
- [ ] Tela Documentos com todos os links
- [ ] Deck Check com contagem e undo/reset
- [ ] Table Judge com timer
- [ ] Layout responsivo mobile-first
- [ ] Testes E2E para cada tela
