import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sisenseFusionPlugin } from './vite-plugin-fusion.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('vite-plugin-css-injected-by-js', () => ({
  default: vi.fn(() => ({ name: 'css-injected-by-js' })),
}));

vi.mock('vite-plugin-zip-pack', () => ({
  default: vi.fn(() => ({ name: 'vite-plugin-zip-pack' })),
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
  resolveId(id: string): string | undefined;
  load(id: string): string | undefined;
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
  // fusionFilesPlugin is always index 1 (after cssInjectedByJs)
  return plugins[1] as unknown as FusionPlugin;
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

    it('returns 2 plugins in non-fusion mode', () => {
      const plugins = sisenseFusionPlugin({ manifest: MANIFEST_PATH });
      expect(plugins).toHaveLength(2);
    });

    it('returns 3 plugins in fusion mode (includes zip plugin)', () => {
      process.argv = ['node', 'script.js', '--fusion'];
      const plugins = sisenseFusionPlugin({ manifest: MANIFEST_PATH });
      expect(plugins).toHaveLength(3);
    });
  });

  describe('resolveId', () => {
    it('returns the prefixed virtual module id for the virtual module', () => {
      const plugin = getFusionPlugin();
      const result = plugin.resolveId('virtual:sisense-fusion-vite-plugin-module');
      expect(result).toBe('\0virtual:sisense-fusion-vite-plugin-module');
    });

    it('returns undefined for unrelated module ids', () => {
      const plugin = getFusionPlugin();
      expect(plugin.resolveId('react')).toBeUndefined();
      expect(plugin.resolveId('./some-file')).toBeUndefined();
    });
  });

  describe('load', () => {
    it('returns the manifest wrapper module for the resolved virtual module id', () => {
      const plugin = getFusionPlugin();
      const code = plugin.load('\0virtual:sisense-fusion-vite-plugin-module');
      expect(code).toContain('export default manifest');
      expect(code).toContain(`import manifest from "./src/index.tsx"`);
    });

    it('returns undefined for unrelated module ids', () => {
      const plugin = getFusionPlugin();
      expect(plugin.load('react')).toBeUndefined();
    });
  });

  describe('config', () => {
    it('returns es format with manifest entry in non-fusion mode', () => {
      const plugin = getFusionPlugin();
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.formats).toEqual(['es']);
      expect(result!.build.lib.entry).toBe('./src/index.tsx');
    });

    it('returns umd format with virtual module entry in fusion mode', () => {
      const plugin = getFusionPlugin(['node', 'script.js', '--fusion']);
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.formats).toEqual(['umd']);
      expect(result!.build.lib.entry).toBe('virtual:sisense-fusion-vite-plugin-module');
    });

    it('sets plugin name as lib name', () => {
      const plugin = getFusionPlugin();
      const result = plugin.config({}, { command: 'build', mode: 'production' });
      expect(result!.build.lib.name).toBe('my-plugin');
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
        pluginInfraVersion: 2,
        source: ['main.js'],
        version: '1.0.0',
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
