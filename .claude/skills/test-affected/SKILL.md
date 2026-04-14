---
name: test-affected
description: Run unit tests for packages affected by current branch changes. Use when verifying tests pass before submitting an MR.
argument-hint: [package-name]
allowed-tools: Bash(yarn nx:test:af) Bash(yarn nx:test:coverage:af) Bash(yarn nx:build:af) Bash(npx nx *) Bash(yarn workspace *)  Bash(yarn test:watch)
---

# Run Tests for Affected Packages

$ARGUMENTS

---

## Default: affected tests

```bash
yarn nx:test:af
```

Expands to: `nx affected --base=origin/master --head=HEAD --exclude @sisense/root -t test`

NX uses the dependency graph to determine which packages are affected and only tests those.
`test` depends on `^build` in `nx.json` — upstream packages are built automatically.

## Coverage (use before submitting an MR)

```bash
yarn nx:test:coverage:af
```

`test:coverage` depends on `^build:prod`, so production builds run first. This takes longer.

## Single package

If `$ARGUMENTS` is a package name (e.g., `sdk-ui`):

```bash
npx nx run @sisense/$ARGUMENTS:test
npx nx run @sisense/$ARGUMENTS:test:coverage
```

## Debug: see which packages are affected

```bash
npx nx affected --base=origin/master --head=HEAD --exclude @sisense/root -t test --dry-run
```

## Fast iteration: single file or watch mode

```bash
# Run one file
yarn workspace @sisense/$ARGUMENTS test --run src/path/to/file.test.ts

# Watch mode (runs `nx run-many -t test:watch` for each workspace that defines it)
yarn test:watch
```

---

## Troubleshooting

**Module resolution / import errors** — upstream packages are not built:

```bash
yarn nx:build:af
# then retry
yarn nx:test:af
```

**Unexpected packages in the affected set** — inspect the NX graph:

```bash
npx nx graph
```
