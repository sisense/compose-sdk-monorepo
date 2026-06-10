Deploy this plugin to Sisense Fusion.

## Pre-flight checks

Before building or deploying, run these checks. Fix any failures before continuing.

### 1. Verify `.env.local` exists and is configured

```bash
[ -f .env.local ] && echo "✓ .env.local exists" || echo "✗ .env.local missing — copy from .env.local.example"
grep -q "VITE_APP_SISENSE_URL=https" .env.local && echo "✓ URL set" || echo "✗ VITE_APP_SISENSE_URL not set"
grep -qE "^VITE_APP_SISENSE_TOKEN=.+" .env.local && echo "✓ token field present" || echo "✗ VITE_APP_SISENSE_TOKEN not set"
```

### 2. Run type check and lint

```bash
npx tsc --noEmit && npm run lint
```

Fix any errors before proceeding — they will cause runtime failures in the deployed plugin.

### 3. Verify plugin name is set

```bash
grep -E "^\s*name\s*:" src/index.tsx | head -1
```

Confirm the `name` field is not the placeholder `'PLUGIN_NAME'` and is unique within your Sisense instance.

---

## Prerequisites

### 1. Configure `.env.local`

Copy the example file if you haven't already:

```bash
cp .env.local.example .env.local
```

Fill in your values:

```env
VITE_APP_SISENSE_URL=https://your-sisense-instance.com
VITE_APP_SISENSE_TOKEN=your-api-token-here
```

The API token must belong to a user with the **Admin** role. To generate one:

```bash
npx @sisense/sdk-cli get-api-token
```

### 2. Configure CORS (first-time setup only)

The Sisense instance must allow requests from your local dev server origin.

An Admin must add the following entry in the Sisense Admin panel under **Admin → Security → CORS**:

```text
http://localhost:3000
```

If you changed the dev server port in `vite.config.ts`, use that port instead of `3000`.

## Deploy

```bash
npm run deploy
```

This command:

1. Runs `npm run build:fusion` to produce `dist-fusion/plugin.zip`
2. Uploads the zip to the configured Sisense instance
3. Registers the plugin under the `name` declared in `src/index.tsx`

## Verify the deployment

1. Open your Sisense Fusion instance in a browser.
2. Open or create a dashboard.
3. Add a new widget — your plugin's `displayName` (from `src/index.tsx`) should appear in the widget type list.

## Re-deploying after changes

Run `npm run deploy` again. The plugin is updated in place — existing widgets using this plugin will pick up the new version on next load.

## Troubleshooting

- **401 / Unauthorized** — Token is missing or the user lacks Admin role.
- **CORS error** — Add `http://localhost:3000` to Sisense's allowed origins.
- **Plugin not appearing in widget list** — Check the browser console for validation errors; the most common cause is a version mismatch (`requiredApiVersion` in `src/index.tsx` vs the SDK version running on the server).
