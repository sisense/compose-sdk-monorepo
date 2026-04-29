import { access, cp, mkdir, readdir } from 'fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  copyDirectory,
  directoryExists,
  ensureDirectoryExists,
  getSdkPluginsRoot,
  getTemplatePath,
  isDirectoryEmpty,
} from './helpers.js';

vi.mock('fs/promises', () => ({
  access: vi.fn(),
  cp: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('copyDirectory', () => {
  it('calls cp with recursive: true', async () => {
    vi.mocked(cp).mockResolvedValue(undefined);
    await copyDirectory('/src', '/dest');
    expect(vi.mocked(cp)).toHaveBeenCalledWith('/src', '/dest', { recursive: true });
  });

  it('throws with a descriptive message when cp fails', async () => {
    vi.mocked(cp).mockRejectedValue(new Error('EPERM'));
    await expect(copyDirectory('/src', '/dest')).rejects.toThrow(
      'Failed to copy directory from /src to /dest',
    );
  });
});

describe('directoryExists', () => {
  it('returns true when access resolves', async () => {
    vi.mocked(access).mockResolvedValue(undefined);
    expect(await directoryExists('/some/path')).toBe(true);
  });

  it('returns false when access throws', async () => {
    vi.mocked(access).mockRejectedValue(new Error('ENOENT'));
    expect(await directoryExists('/missing')).toBe(false);
  });
});

describe('isDirectoryEmpty', () => {
  it('returns true when readdir returns an empty array', async () => {
    vi.mocked(readdir).mockResolvedValue([] as never);
    expect(await isDirectoryEmpty('/empty')).toBe(true);
  });

  it('returns false when readdir returns entries', async () => {
    vi.mocked(readdir).mockResolvedValue(['file.txt'] as never);
    expect(await isDirectoryEmpty('/nonempty')).toBe(false);
  });

  it('throws "Directory does not exist" on ENOENT', async () => {
    vi.mocked(readdir).mockRejectedValue(
      Object.assign(new Error('no such file'), { code: 'ENOENT' }),
    );
    await expect(isDirectoryEmpty('/missing')).rejects.toThrow(
      'Directory does not exist: /missing',
    );
  });

  it('rethrows other readdir errors with context', async () => {
    vi.mocked(readdir).mockRejectedValue(
      Object.assign(new Error('permission denied'), { code: 'EPERM' }),
    );
    await expect(isDirectoryEmpty('/bad')).rejects.toThrow('Failed to read directory /bad');
  });
});

describe('ensureDirectoryExists', () => {
  it('calls mkdir with recursive: true', async () => {
    vi.mocked(mkdir).mockResolvedValue(undefined);
    await ensureDirectoryExists('/new/dir');
    expect(vi.mocked(mkdir)).toHaveBeenCalledWith('/new/dir', { recursive: true });
  });

  it('throws when mkdir fails', async () => {
    vi.mocked(mkdir).mockRejectedValue(new Error('EPERM'));
    await expect(ensureDirectoryExists('/bad')).rejects.toThrow('Failed to create directory /bad');
  });
});

describe('getSdkPluginsRoot', () => {
  it('returns a non-empty string', () => {
    const result = getSdkPluginsRoot();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getTemplatePath', () => {
  it('returns a path under the templates folder for the given template name', () => {
    const result = getTemplatePath('my-template');
    expect(result).toContain('templates');
    expect(result).toContain('my-template');
  });
});
