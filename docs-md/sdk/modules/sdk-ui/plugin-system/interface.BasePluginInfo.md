---
title: BasePluginInfo
---

# Interface BasePluginInfo <Badge type="beta" text="Beta" />

Defines base information shared by all plugin types.

## Example

```ts
const info: BasePluginInfo = {
  name: 'my-widget-plugin',
  version: '1.0.0',
  requiredApiVersion: '^2.9.0',
};
```

## Properties

### name

> **name**: `string`

Unique name identifier for the plugin

***

### requiredApiVersion

> **requiredApiVersion**: `string`

Required SDK API version range using simplified semver with standard AND/OR logic.
- **OR**: `||` separates alternative ranges (version must match at least one).
- **AND**: space-separated comparators (version must match all in that group).

Supported comparators: `^x.y.z`, `~x.y.z`, `x.y.z`, `>=x.y.z`, `>x.y.z`, `<=x.y.z`, `<x.y.z`

#### Example

```ts
"^2.9.0" — any 2.x from 2.9.0 up (same major)
```

#### Example

```ts
"2.20.0" — exact version only
```

#### Example

```ts
"~2.9.0" — 2.9.x only (same major and minor)
```

#### Example

```ts
">=2.0.0" — minimum version
```

#### Example

```ts
"^2.0.0 || ^3.0.0" — 2.x from 2.0.0 or 3.x from 3.0.0 (OR)
```

#### Example

```ts
">1.2.3 <=2.3.1" — between 1.2.3 and 2.3.1 inclusive (AND)
```

#### Example

```ts
">1.2.3 <=2.3.1 || ^3.0.0" — that range or any 3.x (AND + OR)
```

***

### version

> **version**: `string`

Semantic version of the plugin
