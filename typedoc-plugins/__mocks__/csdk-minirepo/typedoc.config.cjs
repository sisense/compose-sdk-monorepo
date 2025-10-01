const path = require('path');
const baseConfig = {
  tsconfig: path.join(__dirname, './tsconfig.json'),
  cleanOutputDir: true,
  sort: ['kind', 'instance-first'],
  disableSources: true,
  logLevel: 'Verbose',
  name: 'CSDK Packages Example',
  entryPoints: ['packages/package-1', 'packages/package-2', 'packages/package-3'],
  entryPointStrategy: 'packages',
  includeVersion: true,
  githubPages: false,
  outputFileStrategy: 'members',
  flattenOutputFiles: false,
  entryFileName: 'index.md',
  indexFileName: 'index.md',
  indexPageTitle: 'Compose SDK',
  skipIndexPage: false,
  excludeGroups: false,
  hidePageHeader: true,
  hidePageTitle: false,
  hideBreadcrumbs: true,
  hideInPageTOC: true,
  titleTemplate: '{kind} {name}',
  propertiesFormat: 'list',
  hiddenFunctionParameters: ['paramG', 'paramA'],
  treatWarningsAsErrors: true,
};

module.exports = {
  ...baseConfig,
  plugin: ['@ethings-os/typedoc-plugin-markdown'],
};
