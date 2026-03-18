# public-api-check

`public-api-check` validates tag-specific public api root files (barrels) in `@sisense/sdk-ui`.

## Need

- Keep export-policy validation in one dedicated place.
- Ensure tag-scoped entry files (for example `sisense-internal.ts`) export only declarations with the required tag.
- Forbid wildcard exports in these entry files (`export *` and `export * as`).

## Result

Running the script:

- passes when all named exports in configured entry files resolve to declarations with required tags;
- fails with detailed violations (export name, reason, file, line) when:
  - wildcard exports are used,
  - an export declaration cannot be resolved,
  - required tag is missing.

## Structure

- `index.cjs` - script entry point with `PUBLIC_API_ENTRIES` and `validatePublicApiEntries(...)` call.
- `validate-export-entries.cjs` - reusable validation logic.

## Configuration

Edit `PUBLIC_API_ENTRIES` in `index.cjs` to add more entry files and tags in future.
