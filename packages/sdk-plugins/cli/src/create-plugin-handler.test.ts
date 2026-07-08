import type { Dirent } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import inquirer from 'inquirer';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ReplaceInFileConfig } from 'replace-in-file';
import { replaceInFileSync } from 'replace-in-file';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPluginCommand, findAvailableName } from './create-plugin.js';
import {
  copyDirectory,
  directoryExists,
  ensureDirectoryExists,
  getSdkPluginsRoot,
  getTemplatePath,
  isDirectoryEmpty,
} from './helpers.js';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  access: vi.fn(),
  cp: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  rm: vi.fn(),
  rename: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('./helpers.js', () => ({
  getTemplatePath: vi.fn(),
  copyDirectory: vi.fn(),
  directoryExists: vi.fn(),
  ensureDirectoryExists: vi.fn(),
  isDirectoryEmpty: vi.fn(),
  getSdkPluginsRoot: vi.fn(),
}));

const mockGetContent = vi.fn();
const mockGetBranch = vi.fn();
const mockGetTree = vi.fn();
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    rest: {
      repos: { getContent: mockGetContent, getBranch: mockGetBranch },
      git: { getTree: mockGetTree },
    },
  })),
}));

vi.mock('replace-in-file', () => ({
  replaceInFileSync: vi.fn(),
}));

vi.mock('inquirer', () => ({
  default: { prompt: vi.fn() },
}));

const mockedReadFile = vi.mocked(readFile);
const mockedWriteFile = vi.mocked(writeFile);
const mockedMkdir = vi.mocked(mkdir);
const mockedRm = vi.mocked(rm);
const mockedGetTemplatePath = vi.mocked(getTemplatePath);
const mockedCopyDirectory = vi.mocked(copyDirectory);
const mockedDirectoryExists = vi.mocked(directoryExists);
const mockedEnsureDirectoryExists = vi.mocked(ensureDirectoryExists);
const mockedIsDirectoryEmpty = vi.mocked(isDirectoryEmpty);
const mockedGetSdkPluginsRoot = vi.mocked(getSdkPluginsRoot);
const mockedExistsSync = vi.mocked(existsSync);
const mockedPrompt = vi.mocked(inquirer.prompt as (...args: unknown[]) => Promise<unknown>);
const mockedReplaceInFileSync = vi.mocked(replaceInFileSync);

const PROJECT_PATH = '/tmp/test-plugin';
const PLUGIN_NAME = 'my-plugin';
const TEMPLATE = 'empty';

const EMBEDDED_WIDGETS = [
  { name: 'Empty Project', value: 'empty', embedded: true },
  { name: 'Line Chart', value: 'line-chart' },
];

/** Calls the handler with merged defaults so individual tests only override what matters */
async function callHandler(overrides: Record<string, unknown> = {}) {
  const options = {
    _: [],
    $0: 'sdk-cli',
    path: PROJECT_PATH,
    name: PLUGIN_NAME,
    template: TEMPLATE,
    devMode: false,
    install: 'none',
    ...overrides,
  };
  await (createPluginCommand.handler as (opts: typeof options) => Promise<void>)(options);
}

describe('createPluginCommand handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Fresh, empty target directory
    mockedDirectoryExists.mockResolvedValue(true);
    mockedIsDirectoryEmpty.mockResolvedValue(true);

    // Template paths
    mockedGetTemplatePath.mockImplementation((name: string) => `/dist/templates/${name}`);

    // widgets.json for loadEmbeddedWidgets
    mockedReadFile.mockImplementation(async (filePath: unknown) => {
      const p = String(filePath);
      if (p.endsWith('widgets.json')) return JSON.stringify(EMBEDDED_WIDGETS);
      if (p.endsWith('package.json')) return JSON.stringify({ name: 'tpl', dependencies: {} });
      return '';
    });

    // writeFile is a no-op
    mockedWriteFile.mockResolvedValue(undefined);
    mockedMkdir.mockResolvedValue(undefined);
    mockedRm.mockResolvedValue(undefined);
    mockedCopyDirectory.mockResolvedValue(undefined);
    mockedEnsureDirectoryExists.mockResolvedValue(undefined);

    // GitHub API — fail silently (handler catches and continues with embedded only)
    mockGetContent.mockRejectedValue(new Error('network error'));
    mockGetBranch.mockRejectedValue(new Error('not mocked'));
    mockGetTree.mockRejectedValue(new Error('not mocked'));

    mockedGetSdkPluginsRoot.mockReturnValue('/fake/dist');
    mockedExistsSync.mockReturnValue(true);
  });

  describe('directory handling', () => {
    it('creates the project directory when it does not exist', async () => {
      // Only the target project path doesn't exist; template directories do
      mockedDirectoryExists.mockImplementation(async (p: string) => p !== PROJECT_PATH);
      await callHandler();
      expect(mockedMkdir).toHaveBeenCalledWith(PROJECT_PATH, { recursive: true });
    });

    it('skips the conflict prompt when the target directory is empty', async () => {
      mockedIsDirectoryEmpty.mockResolvedValue(true);
      await callHandler();
      const conflictPrompts = mockedPrompt.mock.calls.filter((call) =>
        (call[0] as { name: string }[]).some((q) => q.name === 'newPath'),
      );
      expect(conflictPrompts).toHaveLength(0);
    });

    it('warns and prompts for a new path when the explicit --path is not empty', async () => {
      mockedIsDirectoryEmpty.mockResolvedValue(false);
      // findAvailablePath: PROJECT_PATH exists, PROJECT_PATH+'2' is free
      mockedExistsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockedPrompt.mockResolvedValueOnce({ newPath: `${PROJECT_PATH}2` });

      await callHandler();

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('is not empty'));
      expect(mockedPrompt).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'newPath' })]),
      );
      expect(mockedMkdir).toHaveBeenCalledWith(`${PROJECT_PATH}2`, { recursive: true });
      warnSpy.mockRestore();
    });

    it('warns and re-prompts for plugin name when name-derived path is not empty', async () => {
      // existsSync false → findAvailableName('my-plugin') returns 'my-plugin' immediately
      mockedExistsSync.mockReturnValue(false);
      mockedIsDirectoryEmpty.mockResolvedValue(false);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockedPrompt.mockResolvedValueOnce({ pluginName: 'my-plugin2' });

      await callHandler({ path: undefined });

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('is not empty'));
      expect(mockedPrompt).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'pluginName' })]),
      );
      expect(mockedMkdir).toHaveBeenCalledWith(path.join(process.cwd(), 'my-plugin2'), {
        recursive: true,
      });
      warnSpy.mockRestore();
    });
  });

  describe('prompts', () => {
    it('skips the name prompt when --name flag is provided', async () => {
      await callHandler({ name: PLUGIN_NAME });
      const namePromptCalls = mockedPrompt.mock.calls.filter((call) =>
        (call[0] as { name: string }[]).some((q) => q.name === 'pluginName'),
      );
      expect(namePromptCalls).toHaveLength(0);
    });

    it('prompts for plugin name when --name flag is absent', async () => {
      mockedPrompt.mockResolvedValueOnce({ pluginName: 'prompted-name' });
      await callHandler({ name: undefined });
      expect(mockedPrompt).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'pluginName' })]),
      );
    });

    it('shows my-custom-plugin as the default name in the interactive prompt', async () => {
      // path is explicit → defaultName is always DEFAULT_PLUGIN_NAME
      mockedPrompt.mockResolvedValueOnce({ pluginName: 'my-custom-plugin' });
      await callHandler({ name: undefined });
      const namePromptCall = mockedPrompt.mock.calls.find((call) =>
        (call[0] as Array<{ name: string }>).some((q) => q.name === 'pluginName'),
      );
      expect(namePromptCall).toBeDefined();
      const question = (namePromptCall![0] as Array<{ default?: string }>)[0];
      expect(question.default).toBe('my-custom-plugin');
    });

    it('skips the template prompt when --template flag is provided', async () => {
      await callHandler({ template: TEMPLATE });
      const templatePromptCalls = mockedPrompt.mock.calls.filter((call) =>
        (call[0] as { name: string }[]).some((q) => q.name === 'template'),
      );
      expect(templatePromptCalls).toHaveLength(0);
    });

    it('prompts for template when --template flag is absent', async () => {
      mockedPrompt.mockResolvedValueOnce({ template: TEMPLATE });
      await callHandler({ template: undefined });
      expect(mockedPrompt).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'template' })]),
      );
    });

    it('shows first template name in the template prompt choices', async () => {
      mockedPrompt.mockResolvedValueOnce({ template: TEMPLATE });
      await callHandler({ template: undefined });
      const templatePromptCall = mockedPrompt.mock.calls.find((call) =>
        (call[0] as Array<{ name: string }>).some((q) => q.name === 'template'),
      );
      const choices = (templatePromptCall![0] as Array<{ choices: Array<{ name: string }> }>)[0]
        .choices;
      expect(choices.map((c) => c.name)).toContain('Empty Project');
    });
  });

  describe('scaffolding', () => {
    it('copies the repo template to the project path', async () => {
      await callHandler();
      expect(mockedCopyDirectory).toHaveBeenCalledWith('/dist/templates/repo', PROJECT_PATH);
    });

    it('copies the widget template into src/', async () => {
      await callHandler();
      expect(mockedCopyDirectory).toHaveBeenCalledWith(
        expect.stringContaining('empty'),
        expect.stringContaining('src'),
      );
    });

    it('applies PLUGIN_NAME token replacement to src files', async () => {
      await callHandler();
      const calls = mockedReplaceInFileSync.mock.calls as [ReplaceInFileConfig][];
      const nameReplacement = calls.find(
        ([config]) => String(config.from) === String(/PLUGIN_NAME/g),
      );
      expect(nameReplacement).toBeDefined();
      expect(nameReplacement![0].to).toBe(PLUGIN_NAME);
    });

    it('applies PLUGIN_DISPLAY_NAME token replacement to src files', async () => {
      await callHandler();
      const calls = mockedReplaceInFileSync.mock.calls as [ReplaceInFileConfig][];
      const displayNameReplacement = calls.find(
        ([config]) => String(config.from) === String(/PLUGIN_DISPLAY_NAME/g),
      );
      expect(displayNameReplacement).toBeDefined();
    });

    it('applies PLUGIN_NAME token replacement to package.json', async () => {
      await callHandler();
      const calls = mockedReplaceInFileSync.mock.calls as [ReplaceInFileConfig][];
      const pkgReplacement = calls.find(([config]) =>
        String(config.files).endsWith('package.json'),
      );
      expect(pkgReplacement).toBeDefined();
    });

    it('converts underscores to hyphens in the package.json name field', async () => {
      await callHandler({ name: 'my_plugin' });
      const calls = mockedReplaceInFileSync.mock.calls as [ReplaceInFileConfig][];
      const pkgNameReplacement = calls.find(
        ([config]) =>
          String(config.files).endsWith('package.json') &&
          String(config.from) === String(/PLUGIN_NAME/g),
      );
      expect(pkgNameReplacement).toBeDefined();
      expect(pkgNameReplacement![0].to).toBe('my-plugin');
    });

    it('strips leading hyphens produced by a leading underscore in the package.json name field', async () => {
      await callHandler({ name: '_foo' });
      const calls = mockedReplaceInFileSync.mock.calls as [ReplaceInFileConfig][];
      const pkgNameReplacement = calls.find(
        ([config]) =>
          String(config.files).endsWith('package.json') &&
          String(config.from) === String(/PLUGIN_NAME/g),
      );
      expect(pkgNameReplacement).toBeDefined();
      expect(pkgNameReplacement![0].to).toBe('foo');
    });

    it('ensures the src directory exists before copying', async () => {
      await callHandler();
      expect(mockedEnsureDirectoryExists).toHaveBeenCalledWith(expect.stringContaining('src'));
    });
  });

  describe('GitHub fallback', () => {
    it('proceeds with embedded templates when GitHub fetch fails', async () => {
      mockGetContent.mockRejectedValue(new Error('network timeout'));
      // Should complete without throwing
      await expect(callHandler()).resolves.toBeUndefined();
      expect(mockedCopyDirectory).toHaveBeenCalled();
    });
  });

  describe('template deduplication', () => {
    const makeBase64 = (data: unknown) => Buffer.from(JSON.stringify(data)).toString('base64');

    it('uses the embedded copy when GitHub returns a template with the same value', async () => {
      // GitHub also has 'empty' but without embedded:true
      mockGetContent.mockResolvedValueOnce({
        data: { content: makeBase64([{ name: 'Empty (GitHub)', value: 'empty' }]) },
      });

      // If the GitHub path were taken, repos.getBranch would be called and throw
      // (not mocked), proving the embedded route was used
      await callHandler({ template: 'empty' });

      expect(mockedCopyDirectory).toHaveBeenCalledWith(
        expect.stringContaining('empty'),
        expect.stringContaining('src'),
      );
    });

    it('shows no duplicate entries in the template prompt when GitHub overlaps with embedded', async () => {
      mockGetContent.mockResolvedValueOnce({
        data: {
          content: makeBase64([
            { name: 'Empty Duplicate', value: 'empty' }, // already embedded
            { name: 'Remote Chart', value: 'remote-chart' }, // new from GitHub
          ]),
        },
      });
      mockedPrompt.mockResolvedValueOnce({ template: TEMPLATE });

      await callHandler({ template: undefined });

      const templatePromptCall = mockedPrompt.mock.calls.find((call) =>
        (call[0] as Array<{ name: string }>).some((q) => q.name === 'template'),
      );
      expect(templatePromptCall).toBeDefined();
      const choices = (templatePromptCall![0] as Array<{ choices: Array<{ value: string }> }>)[0]
        .choices;
      const values = choices.map((c) => c.value);

      expect(values.filter((v) => v === 'empty')).toHaveLength(1); // no duplicate
      expect(values).toContain('remote-chart'); // new GitHub template still present
      expect(values).toHaveLength(3); // 2 embedded + 1 new from GitHub
    });
  });

  describe('safety guards', () => {
    it('throws when --force is used with filesystem root path', async () => {
      await expect(callHandler({ path: '/', force: true })).rejects.toThrow(
        'Refusing to use --force on filesystem root',
      );
    });
  });

  describe('force flag', () => {
    it('deletes directory contents without prompting when --force is used with a non-empty directory', async () => {
      mockedIsDirectoryEmpty.mockResolvedValue(false);
      const { readdir } = await import('fs/promises');
      vi.mocked(readdir).mockResolvedValueOnce([
        { name: 'old-file.txt', isDirectory: () => false } as unknown as Dirent,
      ]);
      await callHandler({ force: true });
      expect(mockedRm).toHaveBeenCalled();
    });
  });

  describe('template selection', () => {
    it('exits when the selected template is not in the available list', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code?: number) => {
        throw new Error(`process.exit(${_code})`);
      });
      await expect(callHandler({ template: 'nonexistent-template' })).rejects.toThrow(
        'process.exit(1)',
      );
      exitSpy.mockRestore();
    });
  });

  describe('path behavior', () => {
    it('uses name-derived path {cwd}/{name} when --path is not provided', async () => {
      const expectedPath = path.join(process.cwd(), PLUGIN_NAME);
      mockedExistsSync.mockReturnValue(false);
      mockedDirectoryExists.mockImplementation(async (p: string) => p !== expectedPath);
      await callHandler({ path: undefined });
      expect(mockedMkdir).toHaveBeenCalledWith(expectedPath, { recursive: true });
    });

    it('uses the explicit --path when provided', async () => {
      mockedDirectoryExists.mockImplementation(async (p: string) => p !== PROJECT_PATH);
      await callHandler({ path: PROJECT_PATH });
      expect(mockedMkdir).toHaveBeenCalledWith(PROJECT_PATH, { recursive: true });
    });

    it('treats positional arg as the plugin name, deriving path from it', async () => {
      const expectedPath = path.join(process.cwd(), 'my-custom-name');
      mockedExistsSync.mockReturnValue(false);
      mockedDirectoryExists.mockImplementation(async (p: string) => p !== expectedPath);
      // positional [name] maps to options.name in yargs
      await callHandler({ name: 'my-custom-name', path: undefined });
      expect(mockedMkdir).toHaveBeenCalledWith(expectedPath, { recursive: true });
    });

    it('prints cd instruction in next steps', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await callHandler();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('cd'));
      logSpy.mockRestore();
    });
  });

  describe('copyRepository error paths', () => {
    it('exits when the repository template directory is not found', async () => {
      mockedDirectoryExists.mockImplementation(async (p: string) => !p.endsWith('templates/repo'));
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code?: number) => {
        throw new Error(`process.exit(${_code})`);
      });
      await expect(callHandler()).rejects.toThrow('process.exit(1)');
      exitSpy.mockRestore();
    });

    it('logs a warning when removing the dev-only directory fails with a non-ENOENT error', async () => {
      mockedRm.mockRejectedValueOnce(
        Object.assign(new Error('operation not permitted'), { code: 'EPERM' }),
      );
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await callHandler();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not remove dev-only directory'),
      );
      warnSpy.mockRestore();
    });
  });

  describe('plugin name validation', () => {
    it('rejects a blank plugin name via the validate function', async () => {
      mockedPrompt.mockImplementationOnce(async (questions: unknown) => {
        const q = (questions as Array<{ validate?: (v: string) => boolean | string }>)[0];
        expect(q.validate?.('')).toBe('The plugin name cannot be blank');
        return { pluginName: 'valid-name' };
      });
      await callHandler({ name: undefined });
    });

    it('rejects plugin names with invalid characters', async () => {
      mockedPrompt.mockImplementationOnce(async (questions: unknown) => {
        const q = (questions as Array<{ validate?: (v: string) => boolean | string }>)[0];
        expect(q.validate?.('invalid name!')).toBe(
          'The plugin name can only contain letters, numbers, hyphens, and underscores',
        );
        return { pluginName: 'valid-name' };
      });
      await callHandler({ name: undefined });
    });

    it('rejects punctuation-only names that normalize to an empty npm package name', async () => {
      mockedPrompt.mockImplementationOnce(async (questions: unknown) => {
        const q = (questions as Array<{ validate?: (v: string) => boolean | string }>)[0];
        expect(q.validate?.('---')).toBe(
          'The plugin name can only contain letters, numbers, hyphens, and underscores',
        );
        expect(q.validate?.('___')).toBe(
          'The plugin name can only contain letters, numbers, hyphens, and underscores',
        );
        return { pluginName: 'valid-name' };
      });
      await callHandler({ name: undefined });
    });

    it('accepts a valid plugin name', async () => {
      mockedPrompt.mockImplementationOnce(async (questions: unknown) => {
        const q = (questions as Array<{ validate?: (v: string) => boolean | string }>)[0];
        expect(q.validate?.('my-plugin')).toBe(true);
        return { pluginName: 'my-plugin' };
      });
      await callHandler({ name: undefined });
    });

    it('rejects a name when the derived folder already exists', async () => {
      // path: undefined → name-derived. Use a finite once-sequence so findAvailableName terminates.
      mockedExistsSync
        .mockReturnValueOnce(true) // findAvailableName: my-custom-plugin exists → try next
        .mockReturnValueOnce(false) // findAvailableName: my-custom-plugin2 is free → use as default
        .mockReturnValueOnce(true); // validate('my-custom-plugin'): folder exists → show warning
      mockedPrompt.mockImplementationOnce(async (questions: unknown) => {
        const q = (questions as Array<{ validate?: (v: string) => boolean | string }>)[0];
        const result = q.validate?.('my-custom-plugin');
        expect(typeof result).toBe('string');
        expect(result).toContain('already exists');
        return { pluginName: 'my-custom-plugin2' };
      });
      await callHandler({ name: undefined, path: undefined });
    });
  });

  describe('devMode', () => {
    it('overrides path and loads local templates when devMode is true', async () => {
      await callHandler({ devMode: true, path: '.' });
      expect(mockedCopyDirectory).toHaveBeenCalled();
    });
  });

  describe('fetchExampleFromGitHub', () => {
    const TREE_PREFIX = 'packages/sdk-plugins/templates/widgets/line-chart/';

    beforeEach(() => {
      mockGetBranch.mockResolvedValue({
        data: { commit: { commit: { tree: { sha: 'abc123' } } } },
      });
      mockGetTree.mockResolvedValue({
        data: {
          truncated: false,
          tree: [{ type: 'blob', path: `${TREE_PREFIX}index.tsx` }],
        },
      });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => '// code' }));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('fetches tree and downloads files for a non-embedded template', async () => {
      await callHandler({ template: 'line-chart' });

      expect(mockGetBranch).toHaveBeenCalledWith(expect.objectContaining({ branch: 'master' }));
      expect(mockGetTree).toHaveBeenCalledWith(
        expect.objectContaining({ tree_sha: 'abc123', recursive: '1' }),
      );
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('line-chart'));
    });

    it('exits when the GitHub tree response is truncated', async () => {
      mockGetTree.mockResolvedValue({ data: { truncated: true, tree: [] } });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code?: number) => {
        throw new Error(`process.exit(${_code})`);
      });
      await expect(callHandler({ template: 'line-chart' })).rejects.toThrow(/process\.exit/);
      exitSpy.mockRestore();
    });
  });
});

describe('findAvailableName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns baseName when the folder does not exist', () => {
    mockedExistsSync.mockReturnValue(false);
    expect(findAvailableName('my-plugin', '/some/dir')).toBe('my-plugin');
  });

  it('appends 2 when baseName already exists', () => {
    mockedExistsSync
      .mockReturnValueOnce(true) // my-plugin exists
      .mockReturnValueOnce(false); // my-plugin2 does not
    expect(findAvailableName('my-plugin', '/some/dir')).toBe('my-plugin2');
  });

  it('increments until a free name is found', () => {
    mockedExistsSync
      .mockReturnValueOnce(true) // my-plugin
      .mockReturnValueOnce(true) // my-plugin2
      .mockReturnValueOnce(true) // my-plugin3
      .mockReturnValueOnce(false); // my-plugin4 — free
    expect(findAvailableName('my-plugin', '/some/dir')).toBe('my-plugin4');
  });
});
