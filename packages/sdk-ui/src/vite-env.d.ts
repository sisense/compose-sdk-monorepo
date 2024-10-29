/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_APP_SISENSE_URL?: string;
  VITE_APP_SISENSE_TOKEN?: string;
  VITE_APP_DEMO_DYNAMIC_IMPORTS?: string;
  VITE_APP_DISABLE_ANIMATION?: string;
  VITE_APP_DISABLE_STRICT_MODE?: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}

/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Vite will provide this global constant during development but will
 * replace all references with a static value at build time.
 *
 * https://vitejs.dev/config/shared-options.html#define
 */
declare const __PACKAGE_VERSION__: string;
