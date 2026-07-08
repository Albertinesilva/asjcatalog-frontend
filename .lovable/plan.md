# Fase 4 — Planejamento Arquitetural do Módulo Produtos

Migração do módulo `Produtos` para o padrão consolidado no módulo `Users` (Architecture Freeze v1). **Sem implementação nesta etapa.**

---

## 1. Estrutura final de pastas

```text
src/pages/admin/products/
├── ProductListPage.tsx        # Orquestradora (toolbar + filtros + tabela + paginação + diálogo)
├── ProductForm.tsx            # Formulário de criação/edição (mantido, revisado se necessário)
├── types.ts                   # ProductFilters { name: string; categoryId: string }
└── components/
    ├── index.ts               # barrel do módulo
    ├── ProductTable.tsx
    ├── ProductTableRow.tsx
    ├── ProductActions.tsx
    ├── ProductCategoryBadge.tsx
    └── ProductPrice.tsx
```

Somente `ProductForm.tsx` permanece fora do fluxo de listagem. Tudo em `components/` é **específico do domínio Produtos** e não vaza para `src/components/shared/`.

---

## 2. Componentes compartilhados reutilizados (`src/components`)

Todos consumidos **sem modificação** via barrel `@/components`:

- `Pagination`
- `TableToolbar`
- `SearchInput`
- `ConfirmDialog`
- `LoadingState`
- `ErrorState`
- `EmptyState`
- `Authorization`

Nenhum wrapper local será criado.

---

## 3. Componentes específicos do módulo Produtos

| Componente             | Responsabilidade                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `ProductTable`         | Renderiza `<table>` responsiva; recebe `items`, `onEdit`, `onDelete`. Sem lógica de fetch.           |
| `ProductTableRow`      | Apenas renderização de dados de uma linha (imagem, nome, categorias, preço, data).                   |
| `ProductActions`       | Botões Editar/Excluir da linha, com `<Authorization>` nos destrutivos. Isolado de `ProductTableRow`. |
| `ProductCategoryBadge` | Badge de categoria (várias por produto) — apresentação pura.                                         |
| `ProductPrice`         | Formatação monetária BRL centralizada.                                                               |

Justificativa: cada componente tem responsabilidade única, permitindo evolução independente e reuso interno em futura tela de detalhes admin.

---

## 4. Hooks

- **`usePagedQuery`** (global, genérico): orquestra fetch + `SpringPage` + reset de página ao mudar filtros. `queryFn` recebe `{ page, size, ...ProductFilters }` e chama `productService.findAll`.
- **`usePagination`** (global): utilizado **internamente** por `usePagedQuery` — não instanciado diretamente na página.
- **`useDebouncedValue`** (global): aplicado ao input de busca (`name`) com 350ms.

**Nenhum hook específico do domínio Produtos será criado.**

---

## 5. Fluxo de listagem

```text
SearchInput (name) ──► useDebouncedValue ──┐
Select categoria ──────────────────────────┼──► ProductFilters
                                           │
                            usePagedQuery(queryFn=productService.findAll, filters)
                                           │
                                           ▼
                                  SpringPage<ProductResponse>
                                           │
                                           ▼
                                     ProductTable
                                           │
                                           ▼
                                      Pagination
```

Mudança em qualquer filtro → `usePagedQuery` reseta `page=0` automaticamente.

---

## 6. Estados de interface

| Estado                       | Componente compartilhado                                  |
| ---------------------------- | --------------------------------------------------------- |
| Carregando                   | `LoadingState`                                            |
| Erro de fetch                | `ErrorState` (com `retry` → `refetch` de `usePagedQuery`) |
| Lista vazia (com/sem filtro) | `EmptyState`                                              |
| Confirmação de exclusão      | `ConfirmDialog` (`confirmingLabel="Excluindo..."`)        |

Toda mensagem via `getApiErrorMessage` de `@/utils/api-errors`.

---

## 7. Authorization

Regras alinhadas ao backend Spring Boot:

| Ação                         | Guard                                                     |
| ---------------------------- | --------------------------------------------------------- |
| Listar / visualizar produtos | Rota já protegida por `RoleRoute` (`OPERATOR` ou `ADMIN`) |
| Botão "ADICIONAR"            | `<Authorization roles={["ROLE_OPERATOR","ROLE_ADMIN"]}>`  |
| Botão "Editar" (linha)       | `<Authorization roles={["ROLE_OPERATOR","ROLE_ADMIN"]}>`  |
| Botão "Excluir" (linha)      | `<Authorization roles={["ROLE_ADMIN"]}>`                  |

Compatível com o padrão adotado em `UserActions`.

---

## 8. Critérios de sucesso

- `ProductListPage` é **puramente orquestradora** (sem JSX de tabela, filtro ou paginação inline).
- Zero modificações em `src/components/shared/*` ou em qualquer hook global.
- Zero duplicação: nada de `catalog.module.css` reaproveitado como paginação/busca — usa componentes compartilhados.
- Estrutura, tipagem e padrão de imports idênticos ao módulo `Users`.
- Módulo Produtos vira o **segundo caso de uso validado** do template, servindo de referência para Categorias e Dashboard.

---

## Fora do escopo

Não altera: infraestrutura compartilhada, `AuthContext`, rotas, APIs, Design System, `ProductForm` (salvo ajustes triviais de import).

---

**Aguardando aprovação para iniciar a implementação da Fase 4.**
