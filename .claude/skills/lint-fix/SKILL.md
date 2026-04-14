---
name: lint-fix
description: Run ESLint with auto-fix on SDK packages. Use when fixing lint errors, cleaning up imports, or checking code style before committing.
argument-hint: [package-name]
allowed-tools: Bash(yarn workspace *) Bash(yarn lint:fix) Bash(yarn lint:changed) Bash(yarn nx:lint:af) Bash(npx nx *)
---

# Lint and Auto-Fix

$ARGUMENTS

---

## Single package

```bash
yarn workspace @sisense/$ARGUMENTS lint:fix
```

## All packages (parallel)

```bash
yarn lint:fix
```

## Only changed files (since last commit)

```bash
yarn lint:changed
```

## Affected packages (since master, NX-based)

```bash
yarn nx:lint:af
```

---

## Notes

- `lint` depends on `^build` — NX builds upstream packages first if needed
- ESLint runs with `--quiet` by default (warnings suppressed, errors only)
- `lint:fix` corrects safe violations automatically; some errors need manual fixes

---

## Common errors and fixes

**Barrel imports** (`@sisense/no-lodash-barrel-import`, `@sisense/no-mui-barrel-import`):

```ts
// Before — invalid
import { debounce } from 'lodash-es';
import { Button } from '@mui/material';

// After — correct
import debounce from 'lodash-es/debounce';
import Button from '@mui/material/Button';
```

**`@typescript-eslint/no-explicit-any`** — replace with a proper type, type guard, or generic.
If truly unavoidable, add a disable comment with justification:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>
```

**Verify after fixing:**

```bash
yarn workspace @sisense/$ARGUMENTS lint
```
