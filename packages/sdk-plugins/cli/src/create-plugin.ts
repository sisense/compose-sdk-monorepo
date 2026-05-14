/* eslint-disable security/detect-non-literal-fs-filename */
import { Octokit } from '@octokit/rest';
import { access, cp, mkdir, readdir, readFile, rename, rm, writeFile } from 'fs/promises';
import inquirer from 'inquirer';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'os';
import path from 'path';
import { replaceInFileSync } from 'replace-in-file';
import { Arguments, Argv, CommandBuilder, CommandModule } from 'yargs';

import {
  copyDirectory,
  directoryExists,
  ensureDirectoryExists,
  getSdkPluginsRoot,
  getTemplatePath,
  isDirectoryEmpty,
} from './helpers.js';
import { CreatePluginOptions } from './types.js';

const requireModule = createRequire(import.meta.url);
const PKG_VERSION: string = (requireModule('../package.json') as { version: string }).version;

const DEFAULT_PLUGIN_NAME = 'my-custom-plugin';

const command = 'create-plugin [name]';
const describe = 'Create a new Compose SDK plugin';

const builder: CommandBuilder<unknown, CreatePluginOptions> = (
  yargs: Argv<unknown>,
): Argv<CreatePluginOptions> =>
  yargs
    .positional('name', {
      type: 'string',
      describe: 'Name of the plugin',
    })
    .options({
      name: {
        type: 'string',
        describe: 'Name of the plugin',
      },
      template: {
        type: 'string',
        describe: 'Template to use',
      },
      path: {
        type: 'string',
        describe: 'Path where the repository should be created',
      },
      'dev-mode': {
        type: 'boolean',
        describe: 'Install the plugins repo as a part of the monorepo',
        hidden: true,
        default: false,
      },
      force: {
        type: 'boolean',
        describe: 'Overwrite the target directory without prompting',
        default: false,
      },
    })
    .example([
      ['$0 create-plugin'],
      ['$0 create-plugin my-awesome-plugin'],
      ['$0 create-plugin --name my-awesome-plugin'],
      ['$0 create-plugin --name my-awesome-plugin --template empty'],
      ['$0 create-plugin --name my-awesome-plugin --path ./my-project'],
    ]) as Argv<CreatePluginOptions>;

/** Returns `baseName` if available in `baseDir`, otherwise appends an incrementing suffix. */
export function findAvailableName(baseName: string, baseDir: string): string {
  if (!existsSync(path.join(baseDir, baseName))) return baseName;
  let i = 2;
  while (existsSync(path.join(baseDir, `${baseName}${i}`))) i++;
  return `${baseName}${i}`;
}

/** Returns `basePath` if it doesn't exist, otherwise appends an incrementing suffix. */
function findAvailablePath(basePath: string): string {
  if (!existsSync(basePath)) return basePath;
  let i = 2;
  while (existsSync(`${basePath}${i}`)) i++;
  return `${basePath}${i}`;
}

async function createPlugin(
  projectPath: string,
  pluginName: string,
  selectedTemplate: string,
  isEmbedded = false,
  isDevMode = false,
) {
  try {
    const srcPath = path.join(projectPath, './src');
    await ensureDirectoryExists(srcPath);

    if (isDevMode || isEmbedded) {
      const widgetsRoot = isDevMode
        ? path.join(getLocalTemplatesRoot(), 'widgets')
        : getTemplatePath('widgets');
      const templatePath = path.join(widgetsRoot, selectedTemplate);

      if (!(await directoryExists(templatePath))) {
        throw new Error(`Template '${selectedTemplate}' not found at ${templatePath}`);
      }

      await copyDirectory(templatePath, srcPath);
    } else {
      await fetchExampleFromGitHub(selectedTemplate, srcPath);
    }

    replaceInFileSync({
      files: path.resolve(srcPath, './**/*'),
      from: /PLUGIN_NAME/g,
      to: pluginName,
    });
    replaceInFileSync({
      files: path.resolve(srcPath, './**/*'),
      from: /PLUGIN_DISPLAY_NAME/g,
      to: pluginName,
    });
  } catch (err) {
    if (err) console.log(`Error: ${err}\r\n`);
    process.exit(1);
  }
}

async function copyRepository(projectPath: string, pluginName: string, isDevMonorepoMode = false) {
  const version = isDevMonorepoMode ? 'workspace:^' : PKG_VERSION;
  const repoTemplatePath = getTemplatePath('repo');

  if (!(await directoryExists(repoTemplatePath))) {
    console.error(`Error: Repository template was not found.`, repoTemplatePath);
    process.exit(1);
  }

  await copyDirectory(repoTemplatePath, projectPath);
  // npm strips files named .gitignore from tarballs; template stores it as "gitignore" and we rename on copy
  try {
    await rename(path.join(projectPath, 'gitignore'), path.join(projectPath, '.gitignore'));
  } catch (error) {
    // ignore if source file is not present (e.g. dev-mode source already has .gitignore)
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Warning: Could not rename gitignore to .gitignore: ${error}`);
    }
  }

  // Remove dev-only directory from the copied project (it shouldn't be in user's project)
  const devOnlyDestPath = path.join(projectPath, 'dev-only');
  try {
    await rm(devOnlyDestPath, { recursive: true, force: true });
  } catch (error) {
    // Ignore if directory doesn't exist
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Warning: Could not remove dev-only directory: ${error}`);
    }
  }
  const packageJsonPath = path.resolve(projectPath, `./package.json`);
  replaceInFileSync({
    files: packageJsonPath,
    from: /PLUGIN_NAME/g,
    to: toNpmPackageName(pluginName),
  });
  replaceInFileSync({
    files: packageJsonPath,
    from: /CSDK_VERSION/g,
    to: version,
  });

  // Copy dev-only files (.npmrc.dev and .yarnrc.yml.dev) if version contains -alpha or -internal
  const isDevVersion = PKG_VERSION.includes('-alpha') || PKG_VERSION.includes('-internal');
  if (isDevVersion) {
    const devOnlyPath = path.join(repoTemplatePath, 'dev-only');
    const npmrcDevPath = path.join(devOnlyPath, '.npmrc.dev');
    const yarnrcDevPath = path.join(devOnlyPath, '.yarnrc.yml.dev');

    try {
      // Check if files exist before copying
      await access(npmrcDevPath);
      await access(yarnrcDevPath);

      // Copy .npmrc.dev to .npmrc in repo root (remove .dev suffix)
      await cp(npmrcDevPath, path.join(projectPath, '.npmrc'));
      // Copy .yarnrc.yml.dev to .yarnrc.yml in repo root (remove .dev suffix)
      await cp(yarnrcDevPath, path.join(projectPath, '.yarnrc.yml'));
    } catch (error) {
      // If files don't exist, that's okay - they're optional
      // Only warn if it's not a "file not found" error
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn(`Warning: Could not copy dev-only files: ${error}`);
      }
    }
  }
}

async function deleteDirectoryContents(dirPath: string): Promise<void> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(dirPath, entry.name);
        await rm(entryPath, { recursive: true, force: true });
      }),
    );
  } catch (error) {
    throw new Error(`Failed to delete directory contents: ${error}`);
  }
}

const NAME_PROMPT_MESSAGE = 'What name would you like to give the plugin?';
const NAME_BLANK_ERROR = 'The plugin name cannot be blank';
const NAME_INVALID_CHARS_ERROR =
  'The plugin name can only contain letters, numbers, hyphens, and underscores';

function isNameValid(name?: string): name is string {
  if (!name) return false;
  const trimmed = name.trim();
  return /^[a-zA-Z0-9_-]+$/.test(trimmed) && toNpmPackageName(trimmed) !== '';
}

function toNpmPackageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function isNonEmptyDirectory(p: string): Promise<boolean> {
  return (await directoryExists(p)) && !(await isDirectoryEmpty(p));
}

async function promptPluginName(
  defaultName: string,
  checkFolderConflict: boolean,
): Promise<string> {
  return (
    await inquirer.prompt<{ pluginName: string }>([
      {
        type: 'input',
        name: 'pluginName',
        message: NAME_PROMPT_MESSAGE,
        default: defaultName,
        validate: (answer: string): boolean | string => {
          if (!answer || answer.trim() === '') return NAME_BLANK_ERROR;
          if (!isNameValid(answer)) return NAME_INVALID_CHARS_ERROR;
          if (checkFolderConflict) {
            const targetPath = path.join(process.cwd(), answer.trim());
            if (existsSync(targetPath))
              return `Directory '${targetPath}' already exists. Please choose a different name`;
          }
          return true;
        },
      },
    ])
  ).pluginName.trim();
}

const SILENT_LOG = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };

const EXAMPLES_REPO = { owner: 'sisense', repo: 'compose-sdk-monorepo', branch: 'master' } as const;
const EXAMPLES_JSON_PATH = 'packages/sdk-plugins/templates/widgets.json';
const EXAMPLES_DIR = 'packages/sdk-plugins/templates/widgets';

const CACHE_DIR = path.join(os.homedir(), '.cache', 'sisense-sdk-cli');
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function startSpinner(text: string): () => void {
  if (!process.stdout.isTTY) return () => {};
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${SPINNER_FRAMES[i++ % SPINNER_FRAMES.length]} ${text}`);
  }, 80);
  return () => {
    clearInterval(interval);
    process.stdout.write(`\r${' '.repeat(text.length + 2)}\r`);
  };
}

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await readFile(path.join(CACHE_DIR, key), 'utf-8');
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) return entry.data;
  } catch {
    // cache miss or parse error
  }
  return null;
}

async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(path.join(CACHE_DIR, key), JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // ignore cache write failures — non-critical
  }
}

function createOctokit() {
  const auth = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  return new Octokit({ log: SILENT_LOG, ...(auth && { auth }) });
}

function rawContentUrl(filePath: string) {
  const { owner, repo, branch } = EXAMPLES_REPO;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

type DependencyMap = Record<string, string>;

interface ExampleChoice {
  name: string;
  value: string;
  embedded?: boolean;
  dependencies?: DependencyMap;
  devDependencies?: DependencyMap;
}

export function isExampleChoiceArray(value: unknown): value is ExampleChoice[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'name' in item &&
        'value' in item &&
        typeof item.name === 'string' &&
        typeof item.value === 'string',
    )
  );
}

function getLocalTemplatesRoot(): string {
  const templatesRoot = path.resolve(getSdkPluginsRoot(), '../../templates');
  if (!existsSync(templatesRoot)) {
    throw new Error(`Templates folder not found at "${templatesRoot}"`);
  }
  return templatesRoot;
}

async function loadLocalWidgetTemplates(): Promise<ExampleChoice[]> {
  const widgetsJsonPath = path.join(getLocalTemplatesRoot(), 'widgets.json');
  try {
    const raw = await readFile(widgetsJsonPath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    return isExampleChoiceArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function loadEmbeddedWidgets(): Promise<ExampleChoice[]> {
  try {
    const raw = await readFile(getTemplatePath('widgets.json'), 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    return isExampleChoiceArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function loadExamples(): Promise<ExampleChoice[]> {
  const cached = await readCache<ExampleChoice[]>('widgets-list.json');
  if (cached) return cached;

  const stop = startSpinner('Loading templates...');
  const octokit = createOctokit();
  const { data } = await octokit.rest.repos.getContent({
    owner: EXAMPLES_REPO.owner,
    repo: EXAMPLES_REPO.repo,
    path: EXAMPLES_JSON_PATH,
  });

  if (Array.isArray(data) || !('content' in data) || typeof data.content !== 'string') {
    return [];
  }

  const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
  const parsed: unknown = JSON.parse(decoded);

  if (!isExampleChoiceArray(parsed)) {
    return [];
  }

  const result = parsed.filter((item) => !item.embedded);
  stop();
  await writeCache('widgets-list.json', result);
  return result;
}

type GitTreeItem = Awaited<ReturnType<Octokit['rest']['git']['getTree']>>['data']['tree'][number];

async function fetchGitTree(): Promise<GitTreeItem[]> {
  const cached = await readCache<GitTreeItem[]>('git-tree.json');
  if (cached) return cached;

  const stop = startSpinner('Fetching template files...');
  const octokit = createOctokit();
  const { owner, repo, branch } = EXAMPLES_REPO;

  const { data: branchData } = await octokit.rest.repos.getBranch({ owner, repo, branch });
  const treeSha = branchData.commit.commit.tree.sha;

  const { data: treeData } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: '1',
  });

  if (treeData.truncated) {
    throw new Error('GitHub tree response was truncated — repository may be too large');
  }

  stop();
  await writeCache('git-tree.json', treeData.tree);
  return treeData.tree;
}

async function fetchExampleFromGitHub(exampleName: string, destSrcPath: string): Promise<void> {
  const tree = await fetchGitTree();

  // Filter to blob entries under the requested template directory
  const prefix = `${EXAMPLES_DIR}/${exampleName}/`;
  const files = tree.filter((item) => item.type === 'blob' && item.path?.startsWith(prefix));

  if (files.length === 0) {
    throw new Error(`Template '${exampleName}' not found in repository`);
  }

  // Download all files in parallel via raw content URL (not subject to REST rate limits)
  await Promise.all(
    files.map(async (item) => {
      const relativePath = item.path!.slice(prefix.length);
      const destFilePath = path.join(destSrcPath, relativePath);
      await mkdir(path.dirname(destFilePath), { recursive: true });
      const response = await fetch(rawContentUrl(item.path!));
      if (response.ok) {
        await writeFile(destFilePath, await response.text());
      }
    }),
  );
}

export async function mergeWidgetDependencies(
  projectPath: string,
  dependencies: DependencyMap | undefined,
  devDependencies: DependencyMap | undefined,
): Promise<void> {
  const hasEntries = (map: DependencyMap | undefined) => !!map && Object.keys(map).length > 0;
  if (!hasEntries(dependencies) && !hasEntries(devDependencies)) return;

  const pkgPath = path.join(projectPath, 'package.json');
  const raw = await readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw) as Record<string, unknown>;

  const merge = (
    existing: unknown,
    extra: DependencyMap | undefined,
  ): DependencyMap | undefined => {
    if (!extra || Object.keys(extra).length === 0) return existing as DependencyMap | undefined;
    return { ...(existing as DependencyMap | undefined), ...extra };
  };

  if (dependencies && Object.keys(dependencies).length > 0) {
    pkg.dependencies = merge(pkg.dependencies, dependencies);
  }
  if (devDependencies && Object.keys(devDependencies).length > 0) {
    pkg.devDependencies = merge(pkg.devDependencies, devDependencies);
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}

const handler = async (options: Arguments<CreatePluginOptions>) => {
  if (options.devMode) {
    console.log('\n!!! DEV MODE. Installing the repo to monorepo !!!\n');
    if (!options.path) {
      options.path = '../sdk-plugins-repo-test';
    }
  }

  console.log('\nWelcome to the Sisense Compose SDK Plugin toolkit!\n\n');

  let shouldDelete = false;
  let resolvedPath = options.path ? path.resolve(options.path) : null;

  if (options.force && resolvedPath && resolvedPath === path.parse(resolvedPath).root) {
    throw new Error('Refusing to use --force on filesystem root');
  }

  let pluginName = DEFAULT_PLUGIN_NAME;
  let askPluginName = true;
  const pluginNameAsFolderName = !resolvedPath;

  if (isNameValid(options.name)) {
    pluginName = options.name.trim();

    if (pluginNameAsFolderName) {
      const derivedPath = path.join(process.cwd(), pluginName);
      const isNotEmpty = await isNonEmptyDirectory(derivedPath);
      shouldDelete = !!options.force && isNotEmpty;

      if (isNotEmpty && !options.force) {
        pluginName = findAvailableName(pluginName, process.cwd());
        console.warn(
          `Warning: Directory '${derivedPath}' is not empty. Please choose a different name`,
        );
      } else {
        askPluginName = false;
      }
    } else {
      askPluginName = false;
    }
  } else if (options.name) {
    console.warn(`Warning: Name "${options.name}" cannot be used as a plugin name`);
  } else if (pluginNameAsFolderName) {
    pluginName = findAvailableName(pluginName, process.cwd());
  }

  pluginName = askPluginName
    ? await promptPluginName(pluginName, pluginNameAsFolderName)
    : pluginName;

  if (resolvedPath) {
    const isNonEmptyResolvedPath = await isNonEmptyDirectory(resolvedPath);
    shouldDelete = !!options.force && isNonEmptyResolvedPath;

    if (isNonEmptyResolvedPath && !options.force) {
      const suggested = findAvailablePath(resolvedPath);
      console.warn(
        `Warning: Directory '${resolvedPath}' is not empty. Please provide a different location`,
      );
      const result = await inquirer.prompt<{ newPath: string }>([
        {
          type: 'input',
          name: 'newPath',
          message: 'Please provide a different location',
          default: suggested,
          validate: (answer: string): boolean | string => {
            if (!answer || answer.trim() === '') return 'The location cannot be blank';
            const resolved = path.resolve(answer.trim());
            if (!existsSync(resolved)) return true;
            return `Directory '${resolved}' already exists. Please provide a different location`;
          },
        },
      ]);
      resolvedPath = path.resolve(result.newPath.trim());
    }
  }

  const projectPath = resolvedPath ? resolvedPath : path.join(process.cwd(), pluginName);

  let embeddedWidgets: ExampleChoice[] = [];
  let githubExamples: ExampleChoice[] = [];

  if (options.devMode) {
    embeddedWidgets = await loadLocalWidgetTemplates();
  } else {
    embeddedWidgets = await loadEmbeddedWidgets();
    try {
      githubExamples = await loadExamples();
    } catch (e) {
      console.error(
        'Error: Could not load the data from github - please check network connection\n---------------------------------------\n',
      );
    }
  }

  const embeddedValues = new Set(embeddedWidgets.map((t) => t.value));
  const templates = embeddedWidgets.concat(
    githubExamples.filter((t) => !embeddedValues.has(t.value)),
  );

  // Prompt for template selection
  const selectedTemplate: string =
    options.template ||
    (
      await inquirer.prompt<{ template: string }>([
        {
          type: 'list',
          name: 'template',
          message: `How would you like to start?`,
          choices: templates,
          default: templates[0],
        },
      ])
    ).template;

  const selectedTemplateEntry = templates.find((t) => t.value === selectedTemplate);
  if (!selectedTemplateEntry) {
    console.error(
      `Error: Template '${selectedTemplate}' not found. Available templates: ${templates
        .map((t) => t.value)
        .join(', ')}`,
    );
    process.exit(1);
  }

  try {
    if (shouldDelete) {
      await deleteDirectoryContents(projectPath);
    }
    await mkdir(projectPath, { recursive: true });

    const isEmbedded = selectedTemplateEntry.embedded === true;
    await copyRepository(projectPath, pluginName, options.devMode);
    await mergeWidgetDependencies(
      projectPath,
      selectedTemplateEntry.dependencies,
      selectedTemplateEntry.devDependencies,
    );
    await createPlugin(projectPath, pluginName, selectedTemplate, isEmbedded, options.devMode);

    const cpCommand =
      process.platform === 'win32'
        ? 'copy .env.local.example .env.local'
        : 'cp .env.local.example .env.local';

    console.log(`\nNext steps:`);
    console.log(`  cd "${projectPath}"  - Navigate to the plugin directory`);
    console.log(`  npm install  - Install all dependencies`);
    console.log(`  ${cpCommand}  - Prepare a .env.local. Setup your envs manually`);
    console.log(`  npm run dev  - Start the development server`);
  } catch (err) {
    if (err) console.log(`Error: ${err}\r\n`);
    process.exit(1);
  }
};

export const createPluginCommand: CommandModule<unknown, CreatePluginOptions> = {
  command,
  describe,
  builder,
  handler,
};
