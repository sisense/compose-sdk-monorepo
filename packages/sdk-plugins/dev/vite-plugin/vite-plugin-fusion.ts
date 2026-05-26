import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { type CSSOptions, type Plugin, build as viteBuild } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import zipPack from 'vite-plugin-zip-pack';

import {
  bundlePluginFileName,
  distFolder,
  distFusionFolder,
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

/** no flag → csdk react + cross-framework; `--fusion` → fusion only */
type BuildMode = 'csdk' | 'fusion';

function detectMode(): BuildMode {
  if (process.argv.includes('--fusion')) return 'fusion';
  return 'csdk';
}

const suppressModuleLevelDirective = (
  warning: { code: string },
  warn: (warning: unknown) => void,
) => {
  if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning);
};

const REACT_OUT_DIR = 'dist/react';
const CROSS_FRAMEWORK_OUT_DIR = 'dist/cross-framework';
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
      outDir: CROSS_FRAMEWORK_OUT_DIR,
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
      outDir: distFusionFolder,
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
          footer: `typeof module!='undefined'&&(module.exports=${pluginIdentifier});`,
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
 * Vite plugin for Sisense plugin builds. Supports two modes via CLI flag:
 *   (no flag)   → csdk react + cross-framework library builds
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
    csdk: () => reactBuildConfig(manifestPath, pluginIdentifier), // first pass is react
    fusion: () => fusionBuildConfig(manifestPath, pluginIdentifier),
  };

  // ── Per-mode closeBundle handlers ─────────────────────────────────────────
  // Captured from configResolved so the second vite pass inherits css options (e.g. api: 'modern-compiler').
  let resolvedCss: CSSOptions | undefined;

  const modeCloseBundle: Record<BuildMode, () => Promise<void>> = {
    csdk: async () => {
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
        resolve(process.cwd(), distFusionFolder, pluginConfigFileName),
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
    csdk: [
      dts({
        outDirs: TYPES_OUT_DIR,
        entryRoot: srcRoot,
        include: [srcRoot],
        exclude: [testFilePattern],
      }),
    ],
    fusion: [
      zipPack({
        pathPrefix: pluginName,
        outFileName: zippedFileName,
        inDir: distFusionFolder,
        outDir: distFusionFolder,
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
      const folderToClean = mode === 'fusion' ? distFusionFolder : distFolder;
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      rmSync(resolve(process.cwd(), folderToClean), { recursive: true, force: true });
    },
  };

  const titlePlugin: Plugin = {
    name: 'sisense-dev-title',
    transformIndexHtml(html) {
      return html.replace(/<title>.*?<\/title>/, `<title>${pluginName} — Dev</title>`);
    },
  };

  const cssInjected = cssInjectedByJsPlugin();
  const cssPlugins: Plugin[] = Array.isArray(cssInjected) ? cssInjected : [cssInjected as Plugin];

  return [
    cleanDistPlugin,
    titlePlugin,
    ...cssPlugins,
    fusionFilesPlugin,
    ...modeExtraPlugins[mode],
  ];
}
