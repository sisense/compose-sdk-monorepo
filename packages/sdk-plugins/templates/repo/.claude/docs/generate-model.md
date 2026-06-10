Generate a TypeScript data model from a Sisense data source and wire it into this plugin's dev preview.

The user will specify (or you will ask for): Sisense instance URL, data source name, and authentication credentials.

## 1. Collect required information

Ask the user for any missing values:

- **Sisense URL** — the base URL of their instance (e.g. `https://domain.sisense.com`)
- **Data source name** — the exact name as it appears in Sisense (e.g. `"Sample ECommerce"`)
- **Authentication** — one of:
  - Username + password (password will be prompted interactively by the CLI if omitted)
  - API token (`--token`)
  - Web Access Token (`--wat`)

## 2. Derive the output filename

Convert the data source name to a kebab-case filename and place it under `dev/models/`:

```text
"Sample ECommerce"  →  dev/models/sample-ecommerce.ts
"My Sales Data"     →  dev/models/my-sales-data.ts
```

This path maps to the `@models/<name>` alias already configured in `tsconfig.json` and `vite.config.ts`.

## 3. Run the CLI

Choose the command matching the auth method the user provided:

**Username / password:**

```bash
npx @sisense/sdk-cli get-data-model \
  --url <sisense-url> \
  --dataSource "<data-source-name>" \
  --username "<username>" \
  --output dev/models/<kebab-name>.ts
```

(The CLI will prompt for the password interactively.)

**API token:**

```bash
npx @sisense/sdk-cli get-data-model \
  --url <sisense-url> \
  --dataSource "<data-source-name>" \
  --token <token> \
  --output dev/models/<kebab-name>.ts
```

**Web Access Token:**

```bash
npx @sisense/sdk-cli get-data-model \
  --url <sisense-url> \
  --dataSource "<data-source-name>" \
  --wat <wat> \
  --output dev/models/<kebab-name>.ts
```

## 4. Read the generated model

After the command completes, read `dev/models/<kebab-name>.ts` to understand what's available:

- Which tables and columns exist
- Which columns are plain attributes (text / numeric) — safe to use directly as dimensions
- Which columns are `DateDimension` — require a granularity level (`.Years`, `.Months`, `.Days`, etc.)
- Which numeric columns are good candidates for `measureFactory` aggregations

## 5. Update `src/dev-preview-props.ts`

Replace the old model import with the new one, then update `dataOptions` to use real columns from the generated model:

```ts
// Before
import * as DM from '@models/sample-ecommerce';

// After
import * as DM from '@models/<kebab-name>';
```

For each existing `dataOptions` key:

- **Dimension input** (`StyledColumn[]`) — assign a plain text or numeric column, or a date granularity level if the input is date-oriented:
  ```ts
  category: [{ column: DM.SomeTable.SomeTextColumn }],
  date:     [{ column: DM.SomeTable.SomeDateColumn.Months }],
  ```
- **Measure input** (`StyledMeasureColumn[]`) — wrap a numeric column with `measureFactory`:
  ```ts
  value: [{ column: measureFactory.sum(DM.SomeTable.SomeNumericColumn) }],
  ```

Also update `dataSource`:

```ts
dataSource: DM.DataSource,
```

Pick columns that make semantic sense for the input name. If no perfect match exists, pick any available column of the correct type — the dev preview is local-only and does not affect Fusion.

## 6. Verify

Start the dev server to confirm the preview loads data without errors:

```bash
npm run dev
```

If the preview shows "No data" or an error, check:

- The data source name matches exactly (the CLI uses fuzzy matching; the generated `DataSource` string is the canonical name to use)
- The Sisense URL and credentials are valid for the dev server's data fetching (configured in `.env.local` — see `/deploy`)
- No `DateDimension` was passed directly without a granularity level
