# Dependency Version Troubleshooting

This troubleshooting guide provides possible answers to potential dependency version conflicts that may arise when using Compose SDK, especially when your application and `@sisense/sdk-ui` depend on different versions of the same library.

## MUI version conflicts when using `@sisense/sdk-ui`

**Issue:**

After installing `@sisense/sdk-ui` (and related packages such as `@sisense/sdk-shared-ui`), you see one or more of the following:

- TypeScript errors mentioning incompatible types coming from different `@mui/*` packages.
- Build-time bundler errors about missing or renamed exports from `@mui/material` or related packages.
- Multiple copies of the same `@mui/*` package appearing in your dependency tree (for example, different versions used by your app and by `@sisense/sdk-ui`).

**Cause:**

`@sisense/sdk-ui` currently declares a concrete dependency on specific `@mui/*` versions. If your application uses a different major version of MUI (for example, your app uses MUI v5 or v7 while `@sisense/sdk-ui` depends on MUI v6), your package manager may install multiple copies of `@mui/*` or create a type mismatch between the versions used by your app and by `@sisense/sdk-ui`. This can result in type errors, build failures, or runtime issues.

**Solution:**

Use your package manager's capability to **override** or **force-resolve** dependency versions so that **all** packages in your project (including `@sisense/sdk-ui` and `@sisense/sdk-shared-ui`) use a **single, consistent MUI version**.

The exact configuration depends on whether you use `npm`, `yarn`, or `pnpm`. The examples below assume you want to standardize on MUI v5.17.1, but you can replace these versions with the MUI version used in your application.

## Using npm `overrides`

If you are using **npm 8+**, you can use the `overrides` field in your root `package.json` to force all dependencies that depend on `@mui/*` packages (including `@sisense/sdk-ui`) to use the same MUI versions.

In your root `package.json`:

```json
{
  "overrides": {
    "@mui/material": "5.17.1",
    "@mui/system": "5.17.1",
    "@mui/utils": "5.17.1",
    "@mui/icons-material": "5.17.1"
  }
}
```

Then:

1. Delete your lockfile (`package-lock.json`) and MUI-related folders from `node_modules` if necessary.
2. Run `npm install` again.
3. Verify that only the desired MUI package version is installed by checking the application’s dependencies via:

   ```bash
   npm ls <package name>
   ```

All dependencies that depend on `@mui/*` packages (including `@sisense/sdk-ui`) should resolve to the same version.

## Using Yarn `resolutions`

If you use **Yarn** (classic v1 or modern v2+), you can use the `resolutions` field in your root `package.json` to force a single MUI version.

In your root `package.json`:

```json
{
  "resolutions": {
    "@mui/material": "5.17.1",
    "@mui/system": "5.17.1",
    "@mui/icons-material": "5.17.1",
    "@mui/utils": "5.17.1"
  }
}
```

Then:

1. Delete your lockfile (`yarn.lock`) and MUI-related folders from `.yarn/cache` or `node_modules` if applicable.
2. Run `yarn install` again.
3. Verify that only the desired MUI package version is installed by checking the application’s dependencies via:

   ```bash
   yarn why <package name>
   ```

All dependencies that depend on `@mui/*` packages (including `@sisense/sdk-ui`) should resolve to the same version.

## Using `pnpm.overrides`

If you use **pnpm**, you can configure the `pnpm.overrides` field in your root `package.json` (or `pnpm-workspace.yaml`) to enforce a single MUI version.

In your root `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "@mui/material": "5.17.1",
      "@mui/system": "5.17.1",
      "@mui/icons-material": "5.17.1",
      "@mui/utils": "5.17.1"
    }
  }
}
```

Then:

1. Delete your lockfile (`pnpm-lock.yaml`) if necessary.
2. Run `pnpm install` again.
3. Verify that only the desired MUI package version is installed by checking the application’s dependencies via:

   ```bash
   pnpm list <package name>
   ```

All dependencies that depend on `@mui/*` packages (including `@sisense/sdk-ui`) should resolve to the same version.

::: tip Note
Most package managers also support **package-scoped overrides/resolutions**, which let you change the MUI version only for specific dependencies (for example, just for `@sisense/sdk-ui` and related Compose SDK packages) instead of globally for the entire application.
The examples above demonstrate how to change the version **globally** at the application level. For package-scoped configuration, please refer to your package manager’s documentation.
:::

## Verifying that the conflict is resolved

After applying overrides with your package manager:

1. **Inspect the dependency tree** using the commands shown above to confirm that all `@mui/*` packages resolve to your chosen version.
2. **Rebuild and type-check** your application.
3. **Manually test** the application to ensure that no runtime issues occur.

If issues persist after enforcing a single MUI version, collect:

- The versions of `@sisense/sdk-ui` and the `@mui/*` packages you are using.
- The output of your dependency tree inspection (for example, `npm ls @mui/material`).
- Any build or runtime error messages.

Then contact Sisense Support and include this information to aid further investigation.
