import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sisenseFusionPlugin } from './vite-plugin-fusion.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  rmSync: vi.fn(),
}));

vi.mock('vite', () => ({
  build: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('vite-plugin-css-injected-by-js', () => ({
  default: vi.fn(() => ({ name: 'css-injected-by-js' })),
}));

vi.mock('vite-plugin-zip-pack', () => ({
  default: vi.fn(() => ({ name: 'vite-plugin-zip-pack' })),
}));

vi.mock('vite-plugin-dts', () => ({
  default: vi.fn(() => ({ name: 'vite-plugin-dts' })),
}));

const mockedExistsSync = vi.mocked(existsSync);
const mockedReadFileSync = vi.mocked(readFileSync);
const mockedWriteFileSync = vi.mocked(writeFileSync);
const mockedRmSync = vi.mocked(rmSync);
const VALID_MANIFEST = `export default { name: 'my-plugin', customWidget: { visualization: {} } }`;
const MANIFEST_PATH = 'src/index.tsx';

/** Narrow interface covering only the plugin hooks exercised by these tests. */
interface FusionPlugin {
  name: string;
  apply: string;
  config(
    config: unknown,
    env: { command: string; mode: string },
  ): {
    build: {
      lib: { entry: string; name: string; formats: string[]; fileName: () => string };
      rollupOptions?: { onwarn?: (warning: { code: string }, warn: (w: unknown) => void) => void };
    };
  } | null;
  configResolved(config: { css?: unknown }): void;
  closeBundle(): void | Promise<void>;
}

interface CleanDistPlugin {
  buildStart(): void;
}

function getFusionPlugin(argv: string[] = ['node', 'script.js']): FusionPlugin {
  process.argv = argv;
  const plugins = sisenseFusionPlugin({ manifest: MANIFEST_PATH });
  const plugin = plugins.find(
    (p) => (p as { name?: string }).name === 'sisense-fusion-vite-plugin',
  );
  if (!plugin) throw new Error('sisense-fusion-vite-plugin not found in plugin list');
  return plugin as unknown as FusionPlugin;
}

function getCleanDistPlugin(argv: string[] = ['node', 'script.js']): CleanDistPlugin {
  process.argv = argv;
  const plugins = sisenseFusionPlugin({ manifest: MANIFEST_PATH });
  const plugin = plugins.find((p) => (p as { name?: string }).name === 'sisense-clean-dist');
  if (!plugin) throw new Error('sisense-clean-dist not found in plugin list');
  return plugin as unknown as CleanDistPlugin;
}

describe('sisenseFusionPlugin', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    process.argv = ['node', 'script.js'];
    vi.clearAllMocks();
    mockedExistsSync.mockReturnValue(true);
    mockedReadFileSync.mockReturnValue(VALID_MANIFEST);
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('construction', () => {
    it('throws when the manifest file does not exist', () => {
      mockedExistsSync.mockReturnValue(false);
      expect(() => sisenseFusionPlugin({ manifest: MANIFEST_PATH })).toThrow(
        /manifest file not found/,
      );
    });

    it('throws when the plugin name cannot be extracted from the manifest', () => {
      mockedReadFileSync.mockReturnValue('export default { customWidget: {} }');
      expect(() => sisenseFusionPlugin({ manifest: MANIFEST_PATH })).toThrow(
        /could not extract "name"/,
      );
    });

    it('reads name only from the scope before customWidget to avoid nested name fields', () => {
      mockedReadFileSync.mockReturnValue(`{ name: 'top-level', customWidget: { name: 'nested' } }`);
      // Should not throw — top-level name is found before customWidget
      expect(() => sisenseFusionPlugin({ manifest: MANIFEST_PATH })).not.toThrow();
    });

    it('returns 5 plugins in csdk mode (cleanDist, title, css, fusionFiles, dts)', () => {
      const plugins = sisenseFusionPlugin({ manifest: MANIFEST_PATH });
      expect(plugins).toHaveLength(5);
    });

    it('ignores unrecognized flags and defaults to csdk mode', () => {
      process.argv = ['node', 'script.js', '--react', '--preact'];
      const plugins = sisenseFusionPlugin({ manifest: MANIFEST_PATH });
      expect(plugins).toHaveLength(5); // dts, not zip — csdk mode
    });

    it('returns 5 plugins in fusion mode (cleanDist, title, css, fusionFiles, zip)', () => {
      process.argv = ['node', 'script.js', '--fusion'];
      const plugins = sisenseFusionPlugin({ manifest: MANIFEST_PATH });
      expect(plugins).toHaveLength(5);
    });
  });

  describe('config', () => {
    it('returns es format with manifest entry in csdk mode', () => {
      const plugin = getFusionPlugin();
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.formats).toEqual(['es']);
      expect(result!.build.lib.entry).toBe('./src/index.tsx');
    });

    it('returns iife format with manifest entry in fusion mode', () => {
      const plugin = getFusionPlugin(['node', 'script.js', '--fusion']);
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.formats).toEqual(['iife']);
      expect(result!.build.lib.entry).toBe('./src/index.tsx');
    });

    it('sets plugin name as lib name', () => {
      const plugin = getFusionPlugin();
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.name).toBe('plugin_my_plugin');
    });

    it('fileName always returns main.js', () => {
      const plugin = getFusionPlugin();
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.fileName()).toBe('main.js');
    });

    it('returns null for non-build commands', () => {
      const plugin = getFusionPlugin();
      expect(plugin.config({}, { command: 'serve', mode: 'development' })).toBeNull();
    });

    it('returns es format with manifest entry in react mode', () => {
      const plugin = getFusionPlugin(['node', 'script.js', '--react']);
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.formats).toEqual(['es']);
      expect(result!.build.lib.entry).toBe('./src/index.tsx');
    });

    it('returns es format with manifest entry in preact mode', () => {
      const plugin = getFusionPlugin(['node', 'script.js', '--preact']);
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.formats).toEqual(['es']);
      expect(result!.build.lib.entry).toBe('./src/index.tsx');
    });

    it('fileName returns main.js in preact mode', () => {
      const plugin = getFusionPlugin(['node', 'script.js', '--preact']);
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.fileName()).toBe('main.js');
    });

    it('fileName returns main.js in fusion mode', () => {
      const plugin = getFusionPlugin(['node', 'script.js', '--fusion']);
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.fileName()).toBe('main.js');
    });

    it('onwarn passes through non-MODULE_LEVEL_DIRECTIVE warnings', () => {
      const plugin = getFusionPlugin();
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      const { onwarn } = result!.build.rollupOptions!;
      const mockWarn = vi.fn();
      onwarn!({ code: 'MODULE_LEVEL_DIRECTIVE' }, mockWarn);
      expect(mockWarn).not.toHaveBeenCalled();
      onwarn!({ code: 'OTHER_WARNING' }, mockWarn);
      expect(mockWarn).toHaveBeenCalledWith({ code: 'OTHER_WARNING' });
    });
  });

  describe('closeBundle', () => {
    it('writes plugin.json with correct shape in fusion mode', () => {
      const plugin = getFusionPlugin(['node', 'script.js', '--fusion']);
      plugin.closeBundle();

      expect(mockedWriteFileSync).toHaveBeenCalledOnce();
      const [, jsonArg] = mockedWriteFileSync.mock.calls[0];
      const written = JSON.parse(jsonArg as string);
      expect(written).toMatchObject({
        name: 'my-plugin',
        folderName: 'my-plugin',
        isEnabled: true,
        pluginInfraVersion: 3,
        main: 'main.js',
        skipCompilation: true,
      });
    });

    it('writes plugin.json to the dist folder', () => {
      const plugin = getFusionPlugin(['node', 'script.js', '--fusion']);
      plugin.closeBundle();

      const [pathArg] = mockedWriteFileSync.mock.calls[0];
      expect(String(pathArg)).toContain('dist');
      expect(String(pathArg)).toContain('plugin.json');
    });

    it('does not write anything in csdk mode', async () => {
      const plugin = getFusionPlugin();
      await plugin.closeBundle();
      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });
  });

  describe('configResolved', () => {
    it('captures css options from the resolved config', () => {
      const plugin = getFusionPlugin();
      // Should not throw — the hook captures css for use in the second vite pass
      expect(() => plugin.configResolved({ css: { preprocessorOptions: {} } })).not.toThrow();
    });
  });

  describe('cleanDistPlugin', () => {
    it('buildStart removes the dist folder', () => {
      const plugin = getCleanDistPlugin();
      plugin.buildStart();
      expect(mockedRmSync).toHaveBeenCalledWith(expect.stringContaining('dist'), {
        recursive: true,
        force: true,
      });
    });
  });
});
