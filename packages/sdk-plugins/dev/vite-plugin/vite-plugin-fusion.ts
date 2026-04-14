import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { type CSSOptions, type Plugin, build as viteBuild } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import zipPack from 'vite-plugin-zip-pack';

import {
  bundlePluginFileName,
  distFolder,
  pluginConfigFileName,
  zippedFileName,
} from '../scripts/consts.js';

/* eslint-disable sonarjs/no-duplicate-string */
/**
 * Reads top-level fields from a manifest file (e.g. `src/index.tsx`).
 * For `name`, searches only before the `customWidget` block to avoid matching the nested
 * `customWidget.name` field. For `version`, searches the full content because `customWidget`
 * has no nested `version` field, so the cutoff is unnecessary and would silently fall back
 * to `1.0.0` if `version` is declared after `customWidget`.
 */
function readManifestFields(manifestPath: string): { name: string; version: string } {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = readFileSync(manifestPath, 'utf-8');
  const nameScope = content.includes('customWidget')
    ? content.slice(0, content.indexOf('customWidget'))
    : content;
  const nameMatch = nameScope.match(/\bname\s*:\s*['"`]([^'"`\n]+)['"`]/);
  if (!nameMatch?.[1]) {
    throw new Error(
      `Sisense Fusion plugin: could not extract "name" from manifest "${manifestPath}". ` +
        `Ensure the manifest exports a WidgetPlugin object with a top-level "name" property.`,
    );
  }
  const versionMatch = content.match(/\bversion\s*:\s*['"`]([^'"`\n]+)['"`]/);
  return { name: nameMatch[1], version: versionMatch?.[1] ?? '1.0.0' };
}

/** `--react` or no flag → react+preact; `--preact` → preact only; `--fusion` → fusion */
type BuildMode = 'react' | 'preact' | 'both' | 'fusion';

function detectMode(): BuildMode {
  if (process.argv.includes('--fusion')) return 'fusion';
  if (process.argv.includes('--preact')) return 'preact';
  if (process.argv.includes('--react')) return 'react';
  return 'both';
}

const suppressModuleLevelDirective = (
  warning: { code: string },
  warn: (warning: unknown) => void,
) => {
  if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning);
};

const REACT_OUT_DIR = 'dist/react';
const PREACT_OUT_DIR = 'dist/preact';
const TYPES_OUT_DIR = 'dist/types';

const PREACT_ALIASES: Record<string, string> = {
  'react/jsx-runtime': '@sisense/sdk-ui-preact/preact/jsx-runtime',
  'react-dom/test-utils': '@sisense/sdk-ui-preact/preact/compat',
  'react-dom/client': '@sisense/sdk-ui-preact/preact/compat',
  'react-dom/server': '@sisense/sdk-ui-preact/preact/compat',
  'react-dom': '@sisense/sdk-ui-preact/preact/compat',
  react: '@sisense/sdk-ui-preact/preact/compat',
  '@sisense/sdk-ui': '@sisense/sdk-ui-preact',
};

function reactBuildConfig(entry: string, pluginIdentifier: string) {
  return {
    build: {
      outDir: REACT_OUT_DIR,
      lib: {
        entry,
        name: pluginIdentifier,
        formats: ['es'],
        fileName: () => bundlePluginFileName,
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          '@sisense/sdk-ui',
          '@sbi/react',
          '@sbi/react-dom',
        ],
        output: {
          globals: {
            react: 'react',
            'react-dom': 'react-dom',
            'react/jsx-runtime': 'react/jsx-runtime',
            'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
            '@sisense/sdk-ui': '@sisense/sdk-ui',
          },
        },
        onwarn: suppressModuleLevelDirective,
      },
    },
  };
}

function preactBuildConfig(entry: string, pluginIdentifier: string) {
  return {
    esbuild: {
      jsxImportSource: '@sisense/sdk-ui-preact/preact',
    },
    build: {
      outDir: PREACT_OUT_DIR,
      lib: {
        entry,
        name: pluginIdentifier,
        formats: ['es'],
        fileName: () => bundlePluginFileName,
      },
      rollupOptions: {
        external: [/^@sisense\/sdk-ui-preact/, '@sisense/sdk-data'],
        onwarn: suppressModuleLevelDirective,
      },
    },
    resolve: {
      alias: PREACT_ALIASES,
    },
  };
}

function fusionBuildConfig(entry: string, pluginIdentifier: string) {
  return {
    build: {
      lib: {
        entry,
        name: pluginIdentifier,
        formats: ['iife'],
        fileName: () => bundlePluginFileName,
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          '@sisense/sdk-ui',
          '@sbi/react',
          '@sbi/react-dom',
        ],
        output: {
          globals: {
            react: "window['@sbi/react']",
            '@sbi/react': "window['@sbi/react']",
            'react-dom': "window['@sbi/react'].ReactDom",
            '@sbi/react-dom': "window['@sbi/react'].ReactDom",
            'react/jsx-runtime': "window['@sbi/react']",
            'react/jsx-dev-runtime': "window['@sbi/react']",
            '@sisense/sdk-ui': "window['@sisense/sdk-ui']",
          },
          // After the IIFE assigns globalThis[pluginName] = fn,
          // expose it as module.exports for webpack (spa-plugins-loader).
          footer: `typeof module!='undefined'&&(Object.getPrototypeOf(module).exports=${pluginIdentifier});`,
        },
        onwarn: suppressModuleLevelDirective,
      },
    },
  };
}

export interface SisenseFusionPluginOptions {
  /** path to plugin manifest */
  manifest: string;
}

/**
 * Vite plugin for Sisense plugin builds. Supports four modes via CLI flag:
 *   (no flag)   → both react + preact library builds
 *   --react     → react library build only  (dist/react/)
 *   --preact    → preact library build only (dist/preact/)
 *   --fusion    → Fusion IIFE bundle + plugin.json + zip
 */
export function sisenseFusionPlugin(options: SisenseFusionPluginOptions): Plugin[] {
  const manifestPathResolved = resolve(process.cwd(), options.manifest);
  if (!existsSync(manifestPathResolved)) {
    throw new Error(
      `Sisense Fusion plugin: manifest file not found at "${manifestPathResolved}" (manifest: "${options.manifest}").`,
    );
  }

  const mode = detectMode();
  const { name: pluginName, version: pluginVersion } = readManifestFields(manifestPathResolved);
  const pluginIdentifier = `plugin_${pluginName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  const manifestPath = `./${options.manifest}`;
  const srcRoot = dirname(manifestPathResolved);

  // ── Per-mode vite build configs ───────────────────────────────────────────
  const configBuilders: Record<BuildMode, () => object> = {
    react: () => reactBuildConfig(manifestPath, pluginIdentifier),
    preact: () => preactBuildConfig(manifestPath, pluginIdentifier),
    both: () => reactBuildConfig(manifestPath, pluginIdentifier), // first pass is react
    fusion: () => fusionBuildConfig(manifestPath, pluginIdentifier),
  };

  // ── Per-mode closeBundle handlers ─────────────────────────────────────────
  // Captured from configResolved so the second vite pass inherits css options (e.g. api: 'modern-compiler').
  let resolvedCss: CSSOptions | undefined;

  const modeCloseBundle: Record<BuildMode, () => Promise<void>> = {
    react: async () => {},
    preact: async () => {},
    both: async () => {
      // Second pass: preact build. Types from the first (react) pass are reused.
      await viteBuild({
        configFile: false,
        logLevel: 'info',
        plugins: [cssInjectedByJsPlugin()],
        css: resolvedCss,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(preactBuildConfig(manifestPath, pluginIdentifier) as any),
      });
    },
    fusion: async () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      writeFileSync(
        resolve(process.cwd(), distFolder, pluginConfigFileName),
        JSON.stringify(
          {
            name: pluginName,
            folderName: pluginName,
            isEnabled: true,
            pluginInfraVersion: 3,
            csdk: true,
            main: bundlePluginFileName,
            version: pluginVersion,
            skipCompilation: true,
          },
          null,
          2,
        ),
      );
    },
  };

  // ── Per-mode extra plugins (dts for library modes, zip for fusion) ────────
  const testFilePattern = `${srcRoot}/**/*.{test,spec}.{ts,tsx}`;
  const modeExtraPlugins: Record<BuildMode, Plugin[]> = {
    react: [
      dts({
        outDir: TYPES_OUT_DIR,
        entryRoot: srcRoot,
        include: [srcRoot],
        exclude: [testFilePattern],
      }),
    ],
    preact: [
      dts({
        outDir: TYPES_OUT_DIR,
        entryRoot: srcRoot,
        include: [srcRoot],
        exclude: [testFilePattern],
        aliasesExclude: [/@sisense\/sdk-ui$/, /^react/, /^react-dom/],
      }),
    ],
    both: [
      dts({
        outDir: TYPES_OUT_DIR,
        entryRoot: srcRoot,
        include: [srcRoot],
        exclude: [testFilePattern],
      }),
    ],
    fusion: [
      zipPack({
        pathPrefix: pluginName,
        outFileName: zippedFileName,
        outDir: distFolder,
      }) as Plugin,
    ],
  };

  const fusionFilesPlugin: Plugin = {
    name: 'sisense-fusion-vite-plugin',
    apply: 'build' as const,

    config(_config: unknown, { command }: { command: string; mode: string }) {
      if (command !== 'build') return null;
      return configBuilders[mode]();
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configResolved(config: any) {
      resolvedCss = config.css;
    },

    closeBundle: modeCloseBundle[mode],
  };

  const cleanDistPlugin: Plugin = {
    name: 'sisense-clean-dist',
    apply: 'build' as const,
    buildStart() {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      rmSync(resolve(process.cwd(), 'dist'), { recursive: true, force: true });
    },
  };

  const cssInjected = cssInjectedByJsPlugin();
  const cssPlugins: Plugin[] = Array.isArray(cssInjected) ? cssInjected : [cssInjected as Plugin];

  return [cleanDistPlugin, ...cssPlugins, fusionFilesPlugin, ...modeExtraPlugins[mode]];
}
