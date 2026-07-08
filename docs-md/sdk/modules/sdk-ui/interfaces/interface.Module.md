---
title: Module
---

# Interface Module <Badge type="beta" text="Beta" />`<TSchema>`

A module definition which represents a named, versioned unit of Compose SDK functionality which could be consumed separately.

A module can require other modules (`requires`), include other modules (`includes`),
contribute to the API of the modules it requires (`integrations`), and declare its own
API for other modules to contribute to (`api`).

## Example

A module that contributes a customization to the built-in `dashboard` module:
```ts
const dashboardBadgeModule: Module = {
  name: 'dashboard-badge',
  version: '1.0.0',
  requires: ['dashboard'],
  integrations: {
    dashboard: { customizations: [addBadgeToDashboardHeader] },
  },
};
```

## Type parameters

| Parameter | Default |
| :------ | :------ |
| `TSchema` | `any` |

## Properties

### api

> **api**?: `TSchema`

Producer-side API declaration; defines registries other modules contribute to.

***

### includes

> **includes**?: *readonly* [`Module`](interface.Module.md)\< `any` \>[]

Modules this one ships as part of its own feature.

***

### integrations

> **integrations**?: `Record`\< `string`, `unknown` \>

Declarative contributions to other modules, keyed by target module name.

Every target must be declared in [requires](interface.Module.md#requires); contributions to
undeclared modules throw at startup.

***

### name

> **name**: `string`

Unique module identifier, e.g. `'dashboard'`.

***

### requires

> **requires**?: *readonly* [`ModuleRequirement`](../type-aliases/type-alias.ModuleRequirement.md)[]

Modules this module integrates with.
- `'name'` → hard requirement.
- `{ name }` → hard requirement.
- `{ name, optional: true }` → soft; contributions to it are dropped if absent.
- `{ ..., requiredVersion: '^2.0.0' }` → optional semver range constraint.

***

### version

> **version**: `string`

Semver version of the module (e.g. `'1.0.0'`), validated against `requiredVersion` constraints declared by other modules.
