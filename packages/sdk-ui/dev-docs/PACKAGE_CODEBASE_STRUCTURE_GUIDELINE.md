# SDK-UI Package Codebase Structure Guidelines

This document defines a clear, scalable, and maintainable codebase organization structure for the `sdk-ui` package.
The goal is to keep the public API stable, code easy to discover, and changes localized as the codebase grows.

---

## 1) Core Principles

1. **Gateway API**: All public exports flow through a single, controlled entry point.
   - Only `public-api/` defines the package public exports.
   - Explicit named exports only; no `export *` to avoid accidental API growth.
   - Separate files by API stability: `public.ts`, `beta.ts`, `alpha.ts`, `internal.ts`, `sisense-internal.ts`.
   - Each file exports only items with matching JSDoc tag.
2. **Domain-first**: Organize by business domain first, then by technical type.
   - A feature belongs to a domain before it belongs to a folder type.
   - Domain-based grouping (e.g., `domains/dashboards/`, `domains/visualizations/`)
   - Tech-based grouping for items of the same type (e.g., `components/`, `hooks/`, `models/`, `api/`) within a domain.
3. **Colocation**: Keep related code together; promote shared code only when needed.
   - Component/hook owns its tests, types, sub-hooks, and sub-components.
   - Shared code explicitly in `shared/` folders, but only when multiple consumers exist.
4. **Separation of concerns**: Infrastructure vs domain logic vs shared code.
   - `infra/` is cross-domain plumbing (contexts, themes, app factory).
   - `shared/` is truly reusable across domains.
5. **Module isolation**: Independent modules have their own entry points and structure.
   - Each module mirrors the main package structure with its own gateway.
   - Modules should not depend on internal files of other modules.

---

## 2) Folder Types and Purpose

### Top-level folders

- `public-api/` - Gateway entry point for exports.
  - Explicit exports grouped by stability level.
- `domains/` - Business domains.
  - Dashboarding, visualizations, widgets, filters, queries, etc.
- `infra/` - Cross-domain infrastructure.
  - Contexts, themes, app factory, translation, decorators.
- `shared/` - Cross-domain reusable code.
  - Shared components, hooks, utils, types used by multiple domains.
- `modules/` - Independent sub-packages.
  - `ai`, `analytics-composer` with their own `public-api/`.

### Within a domain (e.g., `domains/visualizations/`)

- `components/` - Domain UI components (for example, `line-chart/`, `table/`).
- `hooks/` - Domain hooks (for example, `use-execute-query.ts`).
- `models/` - Domain models (for example, `dashboard-model/`).
- `api/` - Domain API layer (for example, `execute-query.ts`).
- `core/` - Domain business logic (for example, `query-cache.ts`).
- `types/` - Domain types (for example, `types.ts`).
- `shared/` - Shared only within this domain (for example, `shared/components/`, `shared/utils/`).

### Nestable folders (inside components, hooks, models, etc)

- `components/` - Internal sub-components.
- `hooks/` - Internal hooks.
- `core/` - Internal business logic.
- `utils/` - Pure utilities.
- `types/` - Local types.
- `shared/`- Shared code (group level only).

Additionally, the codebase includes internal infrastructure folders dedicated to testing, demo, and Storybook purposes:

- `__demo__/` - Local React demo app (top level only).
- `__stories__/` - Storybook stories (top level only).
- `__mocks__/` - Unit tests mocks
- `__snapshots__/` - Unit tests snapshots
- `__test-helpers__/` - Unit tests helpers

---

## 3) Public API Gateway Rules

All exports are controlled through `public-api/` with stability-level files:

```
public-api/
├── index.ts              # Combines all stability levels
├── public.ts             # @public tagged exports
├── beta.ts               # @beta tagged exports
├── alpha.ts              # @alpha tagged exports
├── internal.ts           # @internal tagged exports
└── sisense-internal.ts   # @sisenseInternal tagged exports
```

Rules:

- Each file exports only items with the matching JSDoc tag.
- Only explicit named exports; no `export *`.

```typescript
// ✅ Allowed
export { LineChart } from '../domains/visualizations/components/line-chart';
export type { LineChartProps } from '../domains/visualizations/components/line-chart';

// ❌ Forbidden
export * from '../domains/visualizations/components/line-chart';
```

Why: prevents accidental API expansion and enables automated validation.

---

## 4) Domain-First Organization Rules

1. Start with the domain: place code under `domains/<domain-name>/`.
2. Then by type: `components/`, `hooks/`, `models/`, `api/`, `core/`, `types/`.
3. Shared within domain: use `domains/<domain-name>/shared/` for reusable domain-only pieces.
4. Cross-domain reuse: promote to `shared/` only after more than one domain needs it.

---

## 5) Colocation and Promotion Path

When code grows, promote it in this order:

1. Local (component or hook only)
   ```
   domains/visualizations/components/line-chart/utils/line-data.ts
   ```
2. Domain shared (used across multiple items in one domain)
   ```
   domains/visualizations/shared/utils/chart-data.ts
   ```
3. Cross-domain shared (used in multiple domains)
   ```
   shared/utils/data/data-processing.ts
   ```

Rule: Always start at the lowest level; promote only when multiple consumers exist.

---

## 6) Component and Hook Placement Patterns

### Component organization

```
components/
├── simple-component-name.ts      # Simple component as file
└── complex-component-name/       # Complex component as folder
    ├── component-name.tsx        # Main implementation
    ├── component-name.test.tsx   # Tests
    ├── types.ts                  # Local types
    ├── index.ts                  # Public exports
    ├── hooks/                    # Internal component-specific hooks
    ├── components/               # Internal sub-components
    ├── utils/                    # Internal component-specific utilities
    └── core/                     # Internal business logic
```

### Hook organization

```
hooks/
├── use-simple-hook.ts            # Simple hook as file
└── use-complex-hook/             # Complex hook as folder
    ├── use-complex-hook.ts       # Main implementation
    ├── use-complex-hook.test.ts  # Tests
    ├── hooks/                    # Internal helper hooks
    ├── types.ts                  # Local types
    └── core/                     # Internal business logic
```

---

## 7) Module Structure

Each module under `modules/` follows the same structure and has its own gateway:

```
modules/ai/
├── public-api/
├── domains/
├── infra/
├── shared/
└── index.ts
```

---

## 8) Example Structure

```
packages/sdk-ui/src/
│
├── public-api/                                    # ✅ Gateway: All public exports
│   ├── index.ts                                   # Combines all stability levels
│   ├── public.ts                                  # @public only
│   ├── beta.ts                                    # @beta only
│   ├── alpha.ts                                   # @alpha only
│   ├── internal.ts                                # @internal only
│   └── sisense-internal.ts                        # @sisenseInternal only
│
├── domains/                                       # ✅ Domain-based organization
│   │
│   ├── dashboarding/                              # Dashboarding domain
│   │   ├── components/                            # Grouped components
│   │   │   ├── dashboard-by-id/
│   │   │   └── dashboard/
│   │   ├── use-composed-dashboard/                # Single ungrouped hook
│   │   │   ├── use-composed-dashboard.ts
│   │   │   └── hooks/                             # Grouped internal hooks
│   │   ├── models/                                # Grouped models
│   │   │   ├── dashboard-model/
│   │   │   |   ├── dashboard-model.ts
│   │   │   │   ├── api/                           # Specific model APIs
│   │   │   │   │   └── get-dashboard-model.ts
│   │   │   |   └── core/                          # Internal business logic
│   │   │   │       └── translate-dashboard-utils.ts
│   │   │   └── hierarchy-model/
│   │   ├── types.ts                               # Domain types
│   │   └── index.ts                               # Domain exports
│   │
│   ├── visualizations/                            # Visualization domain
│   │   ├── components/                            # Chart components
│   │   │   ├── line-chart/
│   │   │   │   ├── line-chart.tsx                 # Main component
│   │   │   │   ├── line-chart.test.tsx
│   │   │   │   ├── types.ts                       # Local types
│   │   │   │   ├── hooks/                         # Component-specific hooks
│   │   │   │   │   └── use-line-data.ts
│   │   │   │   └── index.ts
│   │   │   ├── table/                             # Complex component
│   │   │   │   ├── table.tsx
│   │   │   │   ├── types.ts
│   │   │   │   ├── components/                    # Sub-components
│   │   │   │   │   ├── table-header.tsx
│   │   │   │   │   └── table-row.tsx
│   │   │   │   ├── utils/                         # Component-specific utils
│   │   │   │   │   └── calc-widths.ts
│   │   │   │   └── index.ts
│   │   │   └── pie-chart/
│   │   ├── core/                                  # Visualization engine
│   │   │   ├── renderers/
│   │   │   │   └── highcharts-renderer.tsx
│   │   │   └── engine/
│   │   │       ├── highcharts/
│   │   │       └── builders/
│   │   │           ├── cartesian/
│   │   │           ├── categorical/
│   │   │           └── chart-builder-factory.ts
│   │   ├── shared/                                # Shared within domain
│   │   │   ├── components/
│   │   │   │   └── no-results-overlay.tsx
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   ├── types.ts                               # Domain types
│   │   └── index.ts                               # Domain exports
│   │
│   ├── widgets/                                   # Widget domain
│   │   ├── components/                            #
│   │   │   ├── chart-widget/
│   │   │   │   ├── chart-widget.tsx
│   │   │   │   ├── chart-widget.test.tsx
│   │   │   │   ├── types.ts
│   │   │   │   ├── hooks/                         # Component-specific hooks
│   │   │   │   │   ├── use-chart-widget-drilldown.tsx
│   │   │   │   │   └── use-chart-widget-state.ts
│   │   │   │   ├── components/                    # Sub-components
│   │   │   │   │   ├── chart-widget-header.tsx
│   │   │   │   │   └── chart-widget-footer.tsx
│   │   │   │   ├── core/                          # Component business logic
│   │   │   │   │   └── widget-logic.ts
│   │   │   │   └── index.ts
│   │   │   └── table-widget/
│   │   ├── hooks/                                 # Widget hooks
│   │   ├── models/                                # Widget models
│   │   ├── shared/                                # Shared within domain
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── filters/                                   # Filter domain
│   │   ├── components/
│   │   │   ├── member-filter-tile/
│   │   │   └── date-filter-tile/
│   │   ├── hooks/
│   │   │   └── use-synchronized-filter.ts
│   │   ├── shared/
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── queries/                                   # Query domain
│       ├── hooks/
│       │   ├── use-execute-query.ts
│       |   ├── api/
│       |   │   └── execute-query.ts
│       │   └── types.ts
│       ├── core/                                  # Query business logic
│       │   ├── query-cache.ts
│       │   └── query-params-comparator.ts
│       ├── types.ts
│       └── index.ts
│
├── infra/                                         # ✅ Cross-domain infrastructure
│   ├── api/                                       # Cross-domain API layer
│   ├── contexts/                                  # Infra context providers
│   │   ├── sisense-context/
│   │   │   ├── sisense-context-provider.tsx
│   │   │   ├── use-sisense-context.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── theme-context/
│   ├── app/                                       # Application factory
│   ├── translation/                               # i18n
│   ├── themes/                                    # Theme system
│   └── decorators/                                # Component/hook decorators
│
├── shared/                                        # ✅ Truly cross-domain shared code
│   ├── components/                                # Cross-domain components
│   │   ├── primitives/                            # Buttons, loaders, etc.
│   │   └── icons/
│   ├── hooks/                                     # Cross-domain hooks
│   │   ├── use-fetch.ts
│   │   └── data-load-state-reducer.ts
│   ├── utils/                                     # Cross-domain utilities
│   │   ├── colors/
│   │   │   ├── gradient.ts
│   │   │   └── color-interpolation.ts
│   │   ├── data/
│   │   │   └── measures-comparator.ts
│   │   └── array-utils.ts
│   └── types/                                     # Cross-domain types
│       ├── index.ts
│       └── utility-types/
│           ├── distributive-omit.ts
│           └── transformer.ts
│
├── modules/                                        # ✅ Independent modules
│   ├── ai/                                        # @sisense/sdk-ui/ai
│   │   ├── public-api/                            # Separate gateway
│   │   │   ├── index.ts
│   │   │   ├── public.ts
│   │   │   └── beta.ts
│   │   ├── domains/                               # Module follows same structure
│   │   │   └── chatbot/
│   │   ├── infra/
│   │   ├── shared/
│   │   └── index.ts
│   │
│   └── analytics-composer/                        # @sisense/sdk-ui/analytics-composer
│       └── public-api/
│
├── __test-helpers__/                              # Test utilities
├── __stories__/                                   # Storybook stories
├── __demo__/                                      # Demo applications
└── __mocks__/                                     # Global mocks
```

---

## 9) Entry Points

### Main entry

```typescript
// src/index.ts
export * from './public-api';
```

### Module entries

```typescript
// src/modules/ai/index.ts
export * from './public-api';
```

---

## 10) Quick Placement Checklist

1. Is it domain-specific? Place it in `domains/<domain>/`.
2. Is it cross-domain infrastructure? Put it in `infra/`.
3. Is it shared by multiple domains? Put it in `shared/`.
4. Is it module-specific? Put it under `modules/<module>/`.
5. Is it user-facing public API? Reexport it from `public-api/`.
