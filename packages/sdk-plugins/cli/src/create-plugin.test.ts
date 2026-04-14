import { readFile, writeFile } from 'fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  isExampleChoiceArray,
  loadEmbeddedWidgets,
  loadExamples,
  mergeWidgetDependencies,
} from './create-plugin.js';
import { getTemplatePath } from './helpers.js';

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

const mockedReadFile = vi.mocked(readFile);
const mockedWriteFile = vi.mocked(writeFile);
const mockedGetTemplatePath = vi.mocked(getTemplatePath);

describe('isExampleChoiceArray', () => {
  it('returns true for a valid array of choices', () => {
    expect(
      isExampleChoiceArray([
        { name: 'Empty Project', value: 'empty' },
        { name: 'Line Chart', value: 'line-chart' },
      ]),
    ).toBe(true);
  });

  it('returns true for choices with optional fields', () => {
    expect(
      isExampleChoiceArray([
        {
          name: 'Line Chart',
          value: 'line-chart',
          embedded: true,
          dependencies: { classnames: '^2.3.2' },
          devDependencies: { '@types/lodash': '^4.17.0' },
        },
      ]),
    ).toBe(true);
  });

  it('returns true for an empty array', () => {
    expect(isExampleChoiceArray([])).toBe(true);
  });

  it('returns false for a non-array', () => {
    expect(isExampleChoiceArray({ name: 'foo', value: 'bar' })).toBe(false);
    expect(isExampleChoiceArray(null)).toBe(false);
    expect(isExampleChoiceArray('string')).toBe(false);
    expect(isExampleChoiceArray(42)).toBe(false);
  });

  it('returns false when an item is missing the name field', () => {
    expect(isExampleChoiceArray([{ value: 'empty' }])).toBe(false);
  });

  it('returns false when an item is missing the value field', () => {
    expect(isExampleChoiceArray([{ name: 'Empty Project' }])).toBe(false);
  });

  it('returns false when name is not a string', () => {
    expect(isExampleChoiceArray([{ name: 123, value: 'empty' }])).toBe(false);
  });

  it('returns false when value is not a string', () => {
    expect(isExampleChoiceArray([{ name: 'Empty Project', value: true }])).toBe(false);
  });

  it('returns false when an item is null', () => {
    expect(isExampleChoiceArray([null])).toBe(false);
  });
});

describe('mergeWidgetDependencies', () => {
  const projectPath = '/tmp/my-plugin';
  const pkgPath = `${projectPath}/package.json`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when both dependencies and devDependencies are undefined', async () => {
    await mergeWidgetDependencies(projectPath, undefined, undefined);
    expect(mockedReadFile).not.toHaveBeenCalled();
    expect(mockedWriteFile).not.toHaveBeenCalled();
  });

  it('does nothing when both maps are empty objects', async () => {
    await mergeWidgetDependencies(projectPath, {}, {});
    expect(mockedWriteFile).not.toHaveBeenCalled();
  });

  it('merges dependencies into the existing package.json', async () => {
    const existingPkg = {
      name: 'my-plugin',
      dependencies: { react: '^18.0.0' },
    };
    mockedReadFile.mockResolvedValueOnce(JSON.stringify(existingPkg));

    await mergeWidgetDependencies(projectPath, { classnames: '^2.3.2' }, undefined);

    expect(mockedReadFile).toHaveBeenCalledWith(pkgPath, 'utf-8');
    const writtenContent = JSON.parse(
      (mockedWriteFile as ReturnType<typeof vi.fn>).mock.calls[0][1] as string,
    );
    expect(writtenContent.dependencies).toEqual({
      react: '^18.0.0',
      classnames: '^2.3.2',
    });
  });

  it('merges devDependencies into the existing package.json', async () => {
    const existingPkg = {
      name: 'my-plugin',
      devDependencies: { typescript: '4.8.4' },
    };
    mockedReadFile.mockResolvedValueOnce(JSON.stringify(existingPkg));

    await mergeWidgetDependencies(projectPath, undefined, { '@types/lodash': '^4.17.0' });

    const writtenContent = JSON.parse(
      (mockedWriteFile as ReturnType<typeof vi.fn>).mock.calls[0][1] as string,
    );
    expect(writtenContent.devDependencies).toEqual({
      typescript: '4.8.4',
      '@types/lodash': '^4.17.0',
    });
    expect(writtenContent.dependencies).toBeUndefined();
  });

  it('merges both dependencies and devDependencies simultaneously', async () => {
    const existingPkg = {
      name: 'my-plugin',
      dependencies: { react: '^18.0.0' },
      devDependencies: { typescript: '4.8.4' },
    };
    mockedReadFile.mockResolvedValueOnce(JSON.stringify(existingPkg));

    await mergeWidgetDependencies(
      projectPath,
      { '@emotion/styled': '^11.14.0', classnames: '^2.3.2' },
      { '@types/lodash': '^4.17.0' },
    );

    const writtenContent = JSON.parse(
      (mockedWriteFile as ReturnType<typeof vi.fn>).mock.calls[0][1] as string,
    );
    expect(writtenContent.dependencies).toEqual({
      react: '^18.0.0',
      '@emotion/styled': '^11.14.0',
      classnames: '^2.3.2',
    });
    expect(writtenContent.devDependencies).toEqual({
      typescript: '4.8.4',
      '@types/lodash': '^4.17.0',
    });
  });

  it('adds dependencies when the package.json has none', async () => {
    const existingPkg = { name: 'my-plugin' };
    mockedReadFile.mockResolvedValueOnce(JSON.stringify(existingPkg));

    await mergeWidgetDependencies(projectPath, { lodash: '^4.17.21' }, undefined);

    const writtenContent = JSON.parse(
      (mockedWriteFile as ReturnType<typeof vi.fn>).mock.calls[0][1] as string,
    );
    expect(writtenContent.dependencies).toEqual({ lodash: '^4.17.21' });
  });

  it('widget dependencies override existing ones on conflict', async () => {
    const existingPkg = { dependencies: { classnames: '^2.2.0' } };
    mockedReadFile.mockResolvedValueOnce(JSON.stringify(existingPkg));

    await mergeWidgetDependencies(projectPath, { classnames: '^2.3.2' }, undefined);

    const writtenContent = JSON.parse(
      (mockedWriteFile as ReturnType<typeof vi.fn>).mock.calls[0][1] as string,
    );
    expect(writtenContent.dependencies.classnames).toBe('^2.3.2');
  });

  it('writes the file with a trailing newline', async () => {
    mockedReadFile.mockResolvedValueOnce(JSON.stringify({ name: 'p' }));

    await mergeWidgetDependencies(projectPath, { a: '1.0.0' }, undefined);

    const written = (mockedWriteFile as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    expect(written.endsWith('\n')).toBe(true);
  });
});

describe('loadEmbeddedWidgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetTemplatePath.mockReturnValue('/dist/templates/widgets.json');
  });

  it('returns parsed choices from the dist widgets.json', async () => {
    const widgets = [{ name: 'Empty Project', value: 'empty', embedded: true }];
    mockedReadFile.mockResolvedValueOnce(JSON.stringify(widgets));

    const result = await loadEmbeddedWidgets();

    expect(mockedGetTemplatePath).toHaveBeenCalledWith('widgets.json');
    expect(result).toEqual(widgets);
  });

  it('returns an empty array when the file does not exist', async () => {
    mockedReadFile.mockRejectedValueOnce(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

    const result = await loadEmbeddedWidgets();

    expect(result).toEqual([]);
  });

  it('returns an empty array when the JSON is malformed', async () => {
    mockedReadFile.mockResolvedValueOnce('not-valid-json{{{');

    const result = await loadEmbeddedWidgets();

    expect(result).toEqual([]);
  });

  it('returns an empty array when the JSON is valid but not an ExampleChoice array', async () => {
    mockedReadFile.mockResolvedValueOnce(JSON.stringify({ foo: 'bar' }));

    const result = await loadEmbeddedWidgets();

    expect(result).toEqual([]);
  });

  it('returns all entries without filtering by embedded flag', async () => {
    const widgets = [
      { name: 'Empty', value: 'empty', embedded: true },
      { name: 'Line Chart', value: 'line-chart' },
    ];
    mockedReadFile.mockResolvedValueOnce(JSON.stringify(widgets));

    const result = await loadEmbeddedWidgets();

    expect(result).toHaveLength(2);
  });
});

describe('loadExamples', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeBase64Content = (data: unknown) => Buffer.from(JSON.stringify(data)).toString('base64');

  it('fetches and returns non-embedded examples from GitHub', async () => {
    const widgets = [
      { name: 'Line Chart', value: 'line-chart' },
      { name: 'Bar Chart', value: 'bar-chart' },
    ];
    mockGetContent.mockResolvedValueOnce({
      data: { content: makeBase64Content(widgets) },
    });

    const result = await loadExamples();

    expect(result).toEqual(widgets);
  });

  it('strips out items where embedded is true', async () => {
    const widgets = [
      { name: 'Empty', value: 'empty', embedded: true },
      { name: 'Line Chart', value: 'line-chart' },
    ];
    mockGetContent.mockResolvedValueOnce({
      data: { content: makeBase64Content(widgets) },
    });

    const result = await loadExamples();

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('line-chart');
  });

  it('returns an empty array when the API returns an array (directory listing)', async () => {
    mockGetContent.mockResolvedValueOnce({ data: [{ name: 'widgets.json', type: 'file' }] });

    const result = await loadExamples();

    expect(result).toEqual([]);
  });

  it('returns an empty array when the response has no content field', async () => {
    mockGetContent.mockResolvedValueOnce({ data: { sha: 'abc123' } });

    const result = await loadExamples();

    expect(result).toEqual([]);
  });

  it('returns an empty array when content is not a valid ExampleChoice array', async () => {
    mockGetContent.mockResolvedValueOnce({
      data: { content: makeBase64Content({ key: 'not an array' }) },
    });

    const result = await loadExamples();

    expect(result).toEqual([]);
  });

  it('calls the correct GitHub repository and path', async () => {
    mockGetContent.mockResolvedValueOnce({ data: { content: makeBase64Content([]) } });

    await loadExamples();

    expect(mockGetContent).toHaveBeenCalledWith({
      owner: 'sisense',
      repo: 'compose-sdk-monorepo',
      path: 'packages/sdk-plugins/templates/widgets.json',
    });
  });
});
