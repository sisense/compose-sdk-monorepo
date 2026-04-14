import type { Dirent } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import inquirer from 'inquirer';
import type { ReplaceInFileConfig } from 'replace-in-file';
import { replaceInFileSync } from 'replace-in-file';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPluginCommand } from './create-plugin.js';
import {
  copyDirectory,
  directoryExists,
  ensureDirectoryExists,
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
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    rest: { repos: { getContent: mockGetContent } },
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
  });

  describe('directory handling', () => {
    it('creates the project directory when it does not exist', async () => {
      // Only the target project path doesn't exist; template directories do
      mockedDirectoryExists.mockImplementation(async (p: string) => p !== PROJECT_PATH);
      await callHandler();
      expect(mockedMkdir).toHaveBeenCalledWith(PROJECT_PATH, { recursive: true });
    });

    it('skips the delete prompt when the target directory is empty', async () => {
      mockedIsDirectoryEmpty.mockResolvedValue(true);
      await callHandler();
      expect(mockedPrompt).not.toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'deleteContents' })]),
      );
    });

    it('exits when user declines to delete a non-empty directory', async () => {
      mockedIsDirectoryEmpty.mockResolvedValue(false);
      mockedPrompt.mockResolvedValueOnce({ deleteContents: false });
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code?: number) => {
        throw new Error(`process.exit(${_code})`);
      });
      await expect(callHandler()).rejects.toThrow('process.exit(0)');
      exitSpy.mockRestore();
    });

    it('deletes directory contents when user confirms', async () => {
      mockedIsDirectoryEmpty.mockResolvedValue(false);
      mockedPrompt.mockResolvedValueOnce({ deleteContents: true });
      const { readdir } = await import('fs/promises');
      vi.mocked(readdir).mockResolvedValueOnce([
        { name: 'old-file.txt', isDirectory: () => false } as unknown as Dirent,
      ]);
      await callHandler();
      expect(mockedRm).toHaveBeenCalled();
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
});
