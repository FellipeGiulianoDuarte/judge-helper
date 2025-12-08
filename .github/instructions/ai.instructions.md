---
applyTo: '**'
---

# Pokemon TCG Judge Helper - Instruções para IA

**Stack**: React + TypeScript + Vite + Mantine | Bun

- **Frontend-only**: Sem backend, sem banco de dados, sem Docker
- **Persistência**: localStorage para salvar estado da sessão
- **Evitar Travamento do Terminal**: NÃO use `isBackground=false` para processos de longa duração. Sempre use `isBackground=true` para servidor dev e processos que não devem bloquear o terminal.

---

## 1. REGRAS INEGOCIÁVEIS

### 1.1 Design Mobile First
- **OBRIGATÓRIO**: Todo novo componente/página deve ser pensado para mobile PRIMEIRO
- Viewport padrão de teste: 375px (iPhone SE)
- Layout responsivo: mobile → tablet (768px) → desktop (1024px+)
- Testar sempre em dispositivos mobile antes de enviar

### 1.2 TDD - Workflow Obrigatório (Red-Green-Refactor)

### Frontend
1. **RED**: Escrever teste E2E PRIMEIRO em `playwright/tests/` (deve falhar)
2. **GREEN**: Implementar componente/funcionalidade para passar no teste
3. **REFACTOR**: Melhorar código mantendo testes passando
4. **CONFIRMAR**: `cd client && bun exec playwright test`

**Tipos de Testes por Feature**: Happy Path (funciona) | Edge Cases | Estados

### E2E TEST
5. **RUN E2E**: Executar teste E2E específico para validar funcionalidade
6. **CONFIRMAR**: Aguardar "Funcionou" → Marcar `[x]` em `docs/tarefas/`

**Comandos**:
- E2E: `cd client && bun exec playwright test playwright/tests/nome-do-teste.spec.ts`

---

## 2. Regras de Implementação

- Implemente APENAS o solicitado (sem extras)
- Código completo (sem placeholders)
- Sem emojis em código/logs
- NÃO É PERMITIDO CRIAR ARQUIVOS `.md`
- Atualizar checkboxes só após confirmação

---

## 3. Como Iniciar

```bash
cd client
bun install  # Primeira vez
bun run dev  # Frontend:5173
```

---

## 4. Comandos Úteis

```bash
# Desenvolvimento
cd client
bun run dev  # Iniciar servidor dev em localhost:5173

# Testes
cd client
bun install  # Instalar dependências (primeira vez)
bun test  # Rodar todos os testes E2E
bun exec playwright test playwright/tests/nome-do-teste.spec.ts  # Teste E2E específico
bun exec playwright test --headed  # Rodar com browser visível
bun exec playwright test --ui  # Modo interativo

# Build
bun run build  # Build para produção
bun run preview  # Visualizar build localmente
```

---

## 5. Padrões

**React**: Componentes `PascalCase` | Funções `camelCase` | Sem `any` | Props tipadas  
**TypeScript**: `camelCase` (variáveis/funções) | `PascalCase` (classes/interfaces) | Tipagem forte

---

## Checklist

### Frontend
- [ ] Teste E2E criado para a feature?
- [ ] Teste E2E executado e passando?
- [ ] Comando fornecido para rodar E2E?
- [ ] Código completo (sem placeholders)?
- [ ] Design mobile-first implementado?

### Geral
- [ ] Aguardando confirmação "Funcionou"?