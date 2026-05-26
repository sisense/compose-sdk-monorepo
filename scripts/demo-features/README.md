# Demo features

Framework-agnostic UI tools/widgets injected into the CSDK demo apps at build time.
Each feature lives in its own subdirectory and is the **single source of truth** —
never duplicate this code in framework-specific files.

---

## Shared toolbar

All floating buttons share a single fixed container — `#csdk-demo-toolbar` — anchored at
`bottom:1rem; right:1rem` and laid out as a **reverse-direction flex row**
(first DOM child = rightmost button).

Each feature self-registers via an `addToToolbar(element, priority)` helper that is
included verbatim inside every feature file. The helper lazy-creates the container on
first call, so features are **injection-order independent**.

### Priority values

| Priority | Feature      | Position  |
| -------- | ------------ | --------- |
| 10       | env-switcher | rightmost |
| 20       | source-link  | middle    |
| 30       | back-nav     | leftmost  |

Lower number = closer to the right edge. When adding a new feature, pick a value in the
appropriate gap and document it here.

### Adding a new feature to the toolbar

1. Copy the `addToToolbar` helper verbatim from any existing feature file.
2. Declare `var PRIORITY = <value>;` at the top of your IIFE.
3. Call `addToToolbar(yourElement, PRIORITY)` instead of `document.body.appendChild`.
4. Register the priority in the table above.

---

## env-switcher

**Files:** `env-switcher/env-switcher.js` · `env-switcher/vite-plugin.mjs`

Floating **⚙ Env** button (bottom-right corner). Lets users override the
Sisense URL and API token at runtime via `localStorage` without rebuilding.
Useful both in local dev mode and in deployed GitLab Pages previews.

```
localStorage['csdk_demo_active_env'] = { url: string, token: string } | (absent)
  Active override — read by all apps to replace built-in credentials.
  Written/removed by the widget when the user selects an environment.

localStorage['csdk_demo_envs'] = [{ id, label, url, token }]
  Saved custom environments — managed by the widget, never read by app code.
```

### Disabling in visual regression tests

Set `VITE_APP_DISABLE_DEMO_BAR=true` in the test environment to suppress the widget:

| Framework   | Mechanism                                                                                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React / Vue | `vite-plugin.mjs` skips injection when the env var is set                                                                                                                                                       |
| Angular     | `configure-angular-demo-env.cjs` writes `APP_DISABLE_DEMO_BAR: true` into `environment.development.ts`; `main.ts` sets `window.__CSDK_DISABLE_DEMO_BAR__ = true`; `env-switcher.js` returns early from `init()` |

`e2e/visual-tests/appsConfig.ts` already passes this flag to all demo servers via `normalizeAppConfig`.

The button is **black** when the built-in default is active, **green** (with env label) when a custom env is active.

Credential read-side: `demo-app-config.ts` · `App.vue` · `app.module.ts` · `react-ts-demo/src/main.tsx`

### How it's injected

| Framework               | Mechanism                       | Config file                                                                 |
| ----------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| React (`sdk-ui`)        | `csdkEnvSwitcher()` Vite plugin | `packages/sdk-ui/vite.config.ts` (dev) · `vite.demo.config.ts` (build)      |
| React (`react-ts-demo`) | `csdkEnvSwitcher()` Vite plugin | `examples/react-ts-demo/vite.config.ts`                                     |
| Vue                     | `csdkEnvSwitcher()` Vite plugin | `examples/vue-ts-demo/vite.config.ts` (dev) · `vite.demo.config.ts` (build) |
| Angular                 | `"scripts"` array               | `examples/angular-demo/angular.json`                                        |

The Vite plugin (`env-switcher/vite-plugin.mjs`) reads `env-switcher.js` and
injects it **inline** before `</body>` via Vite's `transformIndexHtml` hook.
This means no extra HTTP request and the widget works identically in dev and
production builds.

### Updating

Edit `env-switcher/env-switcher.js`. No other files need touching — the next
`yarn dev` or `yarn review-app:build` picks up the change automatically.

---

## back-nav

**File:** `back-nav.js`

**← All demos** link registered into `#csdk-demo-toolbar` via `addToToolbar`.
Only meaningful in the **GitLab Pages review app** where `../` navigates back to the home page.

### How it's injected

Injected **post-build only** by `scripts/build-review-app.mjs` into each
app's built `index.html` after copying outputs to `public/react|vue|angular/`.
It is **never** present in source HTML files.

### Updating

Edit `back-nav.js`. The next `yarn review-app:build` picks
it up automatically.

---

## source-link

**File:** `source-link.js`

Fixed badge in the **bottom-left corner** that links to the originating source
for the current deployment:

| Deployment    | Badge colour | Label      | Destination          |
| ------------- | ------------ | ---------- | -------------------- |
| MR review app | Orange       | `MR !<id>` | GitLab MR page       |
| Staging       | Green        | `master`   | GitLab master branch |

Mode is detected by scanning every segment of `window.location.pathname` for
`/mr-<digits>/` or `/staging/`, so the script works identically at any URL
depth (home page, `react/`, `vue/`, `angular/`).

### How it's injected

| Page                            | Mechanism                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `react/` · `vue/` · `angular/`  | Injected inline before `</body>` by `scripts/build-review-app.mjs`                                       |
| home page (`public/index.html`) | Loaded via `<script src="./source-link.js">` — the file is copied to `public/` by `build-review-app.mjs` |

`source-link.js` does its own URL-segment detection so the identical file works
at any depth (home page, `react/`, `vue/`, `angular/`).

### Updating

Edit `source-link.js` only. The next `yarn review-app:build` picks it up for
all pages — sub-apps (inlined) and the home page (copied as a static asset).

---

## Source HTML files

All three source `index.html` files are intentionally clean — they contain no
feature code. Features are always injected at build/serve time by the framework
mechanisms listed above.
