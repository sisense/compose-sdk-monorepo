# Common Errors & Fixes

---

## Runtime errors

### Plugin widget not appearing in the widget picker

**Symptoms:** The plugin's `displayName` is absent from the Fusion widget selector list.

**Causes & fixes:**

1. **Plugin not registered in the host app.**

   ```tsx
   // In your host app (React):
   <SisenseContextProvider plugins={[myPlugin]} ...>
   ```

   Angular/Vue: pass via the framework wrapper's `plugins` prop.

2. **`requiredApiVersion` is incompatible** with the installed SDK version.
   The SDK silently skips plugins whose semver range does not match. Check the browser console for a validation warning.

3. **Plugin name collision.** Two plugins with the same `name` — the second is silently dropped. `name` must be globally unique in the instance.

4. **Build not deployed.** Run `npm run build:fusion` then `npm run deploy` and hard-refresh the browser.

---

### Widget renders blank / nothing appears

**Causes & fixes:**

1. **`styleOptions` accessed without defaults.** `styleOptions` is `{}` on the first render.

   ```ts
   // BAD — crashes if styleOptions is undefined
   const color = props.styleOptions.color;

   // GOOD
   const color = props.styleOptions?.color ?? '#333';
   ```

2. **Required data inputs not yet assigned.** The host app may not have wired up dimensions/measures yet. Guard:

   ```ts
   const { dimensions, measures } = extractDimensionsAndMeasures(
     props.dataOptions
   );

   const { data, isLoading } = useExecuteQuery({
     dataSource: props.dataSource,
     dimensions,
     measures,
     filters: props.filters,
     highlights: props.highlights,
     enabled: dimensions.length > 0,
   });
   ```

3. **Data query is disabled or erroring silently.** Check `isError` and render a fallback; check the Network tab for a failed `/api/datasources/` request.

4. **Container has zero height.** The widget container relies on its parent having an explicit height. Ensure your root element uses `height: '100%'`.

---

### Cross-filtering does nothing when clicking a data point

**Cause:** `attribute` is missing from dimension entries in the data point object.

```ts
// BAD — SDK can't build a member filter without the Attribute
entries: {
  category: [{ dataOption: col, value: 'foo', displayValue: 'foo' }]; // ❌
}

// GOOD
entries: {
  category: [
    {
      dataOption: col,
      value: 'foo',
      displayValue: 'foo',
      attribute: col.column as Attribute, // ✓ required
    },
  ];
}
```

Also check that you pass `e.nativeEvent` (not the React `SyntheticEvent`):

```ts
onClick={(e) => onDataPointClick?.(buildDataPoint(i), e.nativeEvent)}  // ✓
```

---

### Highlights (cross-filtering from other widgets) ignored

**Cause:** `highlights` prop not passed to `useExecuteQuery`.

```ts
// WRONG — widget stays unfiltered when other widgets cross-filter
useExecuteQuery({ dataSource, dimensions, measures, filters });

// CORRECT
useExecuteQuery({ dataSource, dimensions, measures, filters, highlights });
```

---

### Number formatting not appearing — `cell.text` is empty

**Cause:** `numberFormatConfig` is set on a measure column, but `formatDataSet` was never called to apply it. `useExecuteQuery` returns raw cells — `cell.text` stays empty until you format.

**Fix:** call `formatDataSet(data, dataOptions)` after the query:

```ts
import { useMemo } from 'react';
import { formatDataSet } from '@sisense/sdk-ui';

const { data: rawData } = useExecuteQuery({ ... });

const data = useMemo(
  () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
  [rawData, props.dataOptions],
);

// data.rows[i][j].text is now populated for every column with a formatter declared
```

---

### `TypeError: HighchartsXxx is not a function` at runtime

**Symptom:** A Highcharts add-on module (e.g. `highcharts-3d`, `highcharts-more`, `modules/heatmap`) throws at module load time. The error message is like `TypeError: Highcharts3DModule is not a function` or `TypeError: _init3D is not a function`. `tsc` reports no errors.

**Cause:** Highcharts v12 changed how add-on modules work. In v9/v10 they exported an initializer function and you called it. In v12 they are UMD bundles that self-register by reading `window._Highcharts` (set as a side effect by the main `highcharts` import). Calling them throws.

**Old pattern (v9/v10 — do not use):**

```ts
import HighchartsMore from 'highcharts/highcharts-more';

HighchartsMore(Highcharts); // throws in v12
```

**Correct pattern (v12+):**

```ts
import Highcharts from 'highcharts';
// side-effect import — self-registers, no call needed
import 'highcharts/highcharts-3d';
// must come first — sets window._Highcharts
import 'highcharts/highcharts-more';
import 'highcharts/modules/heatmap';
```

This applies to **all** Highcharts add-on modules in v12.

---

## TypeScript errors

### `TS1139` / `TS1005` errors inside `node_modules/@types/...`

**Symptom:** TypeScript reports a parse error like `Type parameter declaration expected (TS1139)` or `',' expected (TS1005)` pointing at a file inside `node_modules/@types/`. `skipLibCheck: true` does **not** suppress these — they are parse errors, not type errors.

**Cause:** A `@types/*` package was published using TypeScript 5 syntax (e.g. `const` type parameters: `function foo<const T>(...)`). The scaffold is pinned to TypeScript 4.9, which cannot parse TS5 syntax even with `skipLibCheck`.

**Fix:** Add an `overrides` block to `package.json` to pin the offending package to an older, TS4-compatible version:

```json
"overrides": {
  "@types/d3-dispatch": "3.0.6"
}
```

Then run `npm install` to apply the override.

To find which package is responsible: the error path will be something like `node_modules/@types/d3-dispatch/index.d.ts` — pin that package.

---

### `Type 'StyledColumn' is not assignable to type 'Attribute'`

You're passing the wrapper instead of the inner value. Use `.column`:

```ts
const attr = dataOptions.category[0].column as Attribute;
```

Or use the utility:

```ts
const { dimensions } = extractDimensionsAndMeasures(dataOptions);
```

---

### `Property 'X' does not exist on type 'DataOptions'`

The key in `DataOptions` (src/types.ts) doesn't match the `name` in `dataPanel.config.inputs` (src/index.tsx). Both must be identical strings.

---

### `Object is possibly 'undefined'` on `dataOptions.X[0]`

An input with `minItems: 0` or no `minItems` may have zero columns assigned. Guard before accessing:

```ts
const firstCategory = dataOptions.category?.[0];
if (!firstCategory) return null;
```

---

## Build errors

### `Cannot find module 'highcharts'` (or any external library)

Add the library as a `dependency` (not `devDependency`) in `package.json`, then run `npm install`:

```json
"dependencies": {
  "highcharts": "^10.0.0",
  "highcharts-react-official": "^3.2.1"
}
```

---

### Angular/Vue host throws at runtime after importing a React-only library

Some npm packages use React-specific APIs (e.g. React Context, React DOM) that are incompatible with the Preact bridge used by Angular and Vue hosts.

**Rule:** Only import packages that work with Preact or are framework-agnostic. Avoid libraries that import directly from `react-dom`.

The cross-framework bundle (`dist/cross-framework/main.js`) aliases `react` → `preact/compat`. Any React-only API that has no Preact equivalent will throw at runtime in Angular/Vue hosts.

---

## Deployment errors

### `401 Unauthorized` when running `npm run deploy`

The `VITE_APP_SISENSE_TOKEN` in `.env.local` is incorrect or belongs to a non-Admin user. Regenerate:

```bash
npx @sisense/sdk-cli get-api-token --url https://your-instance.sisense.com
```

### CORS error during `npm run dev`

Add `http://localhost:3000` to the Sisense Admin → Security → CORS allowed origins list.

### `Plugin not found after deploy`

1. Hard-refresh the browser (Cmd+Shift+R / Ctrl+Shift+R).
2. Check `dist-fusion/plugin.json` — `name` must match what's registered in the dashboard.
3. Check browser console for plugin validation warnings.
