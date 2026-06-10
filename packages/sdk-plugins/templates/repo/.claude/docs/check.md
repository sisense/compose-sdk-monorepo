Run TypeScript type checking and ESLint to catch errors in the plugin source. Fix any issues found.

---

## Step 1 — TypeScript type check

```bash
npx tsc --noEmit
```

If this exits with errors, list each one with file and line number. TypeScript errors must be fixed before continuing — they indicate type contract violations that will likely cause runtime failures.

Common TypeScript errors and fixes are in `.claude/docs/errors.md` under "TypeScript errors".

**If you see `TS1139` or `TS1005` errors whose path is inside `node_modules/@types/`**, this is a known pattern — do not attempt to fix the type declaration files directly. See `.claude/docs/errors.md` → TypeScript errors → `TS1139 / TS1005 errors inside node_modules/@types/` for the exact fix (pin the offending package via `overrides` in `package.json`).

---

## Step 2 — Lint check

```bash
npm run lint
```

If lint errors are found, attempt auto-fix:

```bash
npm run lint:fix
```

`lint:fix` can resolve most formatting and import-order issues automatically. Any remaining errors after auto-fix must be corrected manually.

---

## Step 3 — Format check

```bash
npm run format:check
```

If formatting issues are found, fix them:

```bash
npm run format
```

---

## Step 4 — Re-check after fixes

After fixing any issues, re-run:

```bash
npx tsc --noEmit && npm run lint
```

Report success ("✓ No type errors. ✓ No lint errors.") or list remaining issues.

---

## Step 5 — Runtime library placement

Read `package.json` and verify that any installed runtime charting or visualization libraries (`d3`, `recharts`, `highcharts`, `highcharts-react-official`, `plotly.js-dist-min`, `echarts`) appear in `dependencies`, not `devDependencies`. Vite bundles regardless of placement so this does not break the build — but a misplaced library violates the package contract and can break installations when the plugin is consumed as an npm package.

`@types/*` packages always belong in `devDependencies` — only check the runtime packages, not their type definitions.

If any runtime library is misplaced, move it:

```bash
npm install <library-name>         # adds to dependencies
npm uninstall --save-dev <library-name>  # removes from devDependencies if it was added there
```

---

## When to run `/check`

- Before running `/deploy` — catches issues that would silently break the deployed plugin
- After any significant code change — type errors are much easier to fix immediately than after several changes
- When the dev server shows a blank widget unexpectedly — often a runtime type issue missed during editing
