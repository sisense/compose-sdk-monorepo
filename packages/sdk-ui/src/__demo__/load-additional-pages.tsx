import { lazy } from 'react';

const { VITE_APP_DEMO_DYNAMIC_IMPORTS } = import.meta.env;

const ModuleNotFound = () => (
  <div>
    {'Module not found, check the value of VITE_APP_DEMO_DYNAMIC_IMPORTS in your .env.local file.'}
  </div>
);

type DynamicImportType = Promise<{ default: React.ComponentType }>;
export const loadAdditionalPages = () => {
  if (!VITE_APP_DEMO_DYNAMIC_IMPORTS) {
    return [];
  }

  try {
    const maybeArrayOfPaths: unknown = JSON.parse(VITE_APP_DEMO_DYNAMIC_IMPORTS);
    if (!Array.isArray(maybeArrayOfPaths)) {
      throw Error('Value of VITE_APP_DEMO_DYNAMIC_IMPORTS is not an array');
    }

    return maybeArrayOfPaths.map((path) =>
      lazy(
        () =>
          import(
            // Vite warns about dynamic imports that do not follow specific
            // rules. This hides that console warning.
            /* @vite-ignore */
            path
          ).catch(() => ({
            default: ModuleNotFound,
          })) as DynamicImportType,
      ),
    );
  } catch (e) {
    console.log('Failed to parse value from VITE_APP_DEMO_DYNAMIC_IMPORTS', e);
  }

  return [];
};
