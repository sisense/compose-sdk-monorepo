import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sisenseFusionPlugin } from './vite-plugin-fusion.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  rmSync: vi.fn(),
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
    build: { lib: { entry: string; name: string; formats: string[]; fileName: () => string } };
  } | null;
  closeBundle(): void;
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

    it('returns 4 plugins in non-fusion mode (cleanDist, css, fusionFiles, dts)', () => {
      const plugins = sisenseFusionPlugin({ manifest: MANIFEST_PATH });
      expect(plugins).toHaveLength(4);
    });

    it('returns 4 plugins in fusion mode (cleanDist, css, fusionFiles, zip)', () => {
      process.argv = ['node', 'script.js', '--fusion'];
      const plugins = sisenseFusionPlugin({ manifest: MANIFEST_PATH });
      expect(plugins).toHaveLength(4);
    });
  });

  describe('config', () => {
    it('returns es format with manifest entry in non-fusion mode', () => {
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

    it('does not write anything in non-fusion mode', () => {
      const plugin = getFusionPlugin();
      plugin.closeBundle();
      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });
  });
});
