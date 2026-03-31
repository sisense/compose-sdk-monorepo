import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readPluginConfig, run } from './deploy.js';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('vite', () => ({
  loadEnv: vi.fn(),
}));

const mockedReadFile = vi.mocked(readFile);
const mockedLoadEnv = vi.mocked(loadEnv);
const mockFetch = vi.fn();

const DIST_PATH = resolve(process.cwd(), 'dist');
const PLUGIN_CONFIG = { name: 'test-plugin' };
const SISENSE_URL = 'https://example.sisense.com';
const TOKEN = 'secret-token';

describe('readPluginConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reads and parses plugin.json from distPath', async () => {
    mockedReadFile.mockResolvedValueOnce(JSON.stringify(PLUGIN_CONFIG) as any);
    const result = await readPluginConfig(DIST_PATH);
    expect(result).toEqual(PLUGIN_CONFIG);
  });

  it('throws with a helpful message when the file cannot be read', async () => {
    mockedReadFile.mockRejectedValueOnce(new Error('ENOENT'));
    await expect(readPluginConfig(DIST_PATH)).rejects.toThrow(
      /Run "build:fusion" before deploying/,
    );
  });

  it('throws mentioning the config file path', async () => {
    mockedReadFile.mockRejectedValueOnce(new Error('ENOENT'));
    await expect(readPluginConfig(DIST_PATH)).rejects.toThrow(/plugin\.json/);
  });
});

describe('run', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);

    exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code?: number) => {
      throw new Error(`process.exit(${_code})`);
    });

    // Default: successful env + plugin config + zip file
    mockedLoadEnv.mockReturnValue({
      VITE_APP_SISENSE_URL: SISENSE_URL,
      VITE_APP_SISENSE_TOKEN: TOKEN,
    });

    // Use mockImplementation so early-exit tests don't leave stale queued values
    mockedReadFile.mockImplementation(async (filePath: unknown) => {
      const p = String(filePath);
      if (p.endsWith('plugin.json')) return JSON.stringify(PLUGIN_CONFIG) as any;
      return Buffer.from('zip-bytes') as any; // zip file
    });

    mockFetch.mockResolvedValue({ status: 200, text: async () => 'ok' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    exitSpy.mockRestore();
  });

  it('exits with code 1 when VITE_APP_SISENSE_URL is not set', async () => {
    mockedLoadEnv.mockReturnValue({
      VITE_APP_SISENSE_URL: '',
      VITE_APP_SISENSE_TOKEN: TOKEN,
    });
    await expect(run()).rejects.toThrow('process.exit(1)');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits with code 1 when VITE_APP_SISENSE_TOKEN is not set', async () => {
    mockedLoadEnv.mockReturnValue({
      VITE_APP_SISENSE_URL: SISENSE_URL,
      VITE_APP_SISENSE_TOKEN: '',
    });
    await expect(run()).rejects.toThrow('process.exit(1)');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits with code 1 when plugin.json cannot be read', async () => {
    mockedReadFile.mockRejectedValueOnce(new Error('ENOENT'));
    await expect(run()).rejects.toThrow();
  });

  it('sends DELETE to the correct plugin endpoint before uploading', async () => {
    await run();
    const [deleteUrl, deleteOptions] = mockFetch.mock.calls[0];
    expect(deleteUrl).toBe(
      `${SISENSE_URL}/api/v1/plugins/${encodeURIComponent('test-plugin/test-plugin')}`,
    );
    expect(deleteOptions.method).toBe('DELETE');
    expect(deleteOptions.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('sends POST to the import endpoint with form data', async () => {
    await run();
    const [importUrl, importOptions] = mockFetch.mock.calls[1];
    expect(importUrl).toBe(`${SISENSE_URL}/api/v1/plugins/import?overwrite=false`);
    expect(importOptions.method).toBe('POST');
    expect(importOptions.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(importOptions.body).toBeInstanceOf(FormData);
  });

  it('strips trailing slash from the Sisense URL', async () => {
    mockedLoadEnv.mockReturnValue({
      VITE_APP_SISENSE_URL: `${SISENSE_URL}/`,
      VITE_APP_SISENSE_TOKEN: TOKEN,
    });
    await run();
    const [deleteUrl] = mockFetch.mock.calls[0];
    expect(deleteUrl).not.toContain('//api');
  });

  it('continues to upload even when DELETE returns a non-2xx status', async () => {
    mockFetch
      .mockResolvedValueOnce({ status: 404, text: async () => 'not found' }) // DELETE
      .mockResolvedValueOnce({ status: 200, text: async () => 'ok' }); // POST
    await run();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
