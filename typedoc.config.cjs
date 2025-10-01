// TypeDoc config for the monorepo to generate API docs
// for PUBLIC or INTERNAL audiences depending on TYPEDOC_MODE.
let baseConfig = {
  // To allow TypeDoc to resolve references across packages,
  // "declaration" and "declarationMap" in tsconfig.json must be set to true
  entryPointStrategy: 'packages',
  plugin: ['typedoc-plugin-vue', './typedoc-plugins/typedoc-plugin-expand-type-aliases/index.cjs'],
  readme: 'none',
  out: 'docs',
};

if (process.env.TYPEDOC_FORMAT === 'MD') {
  baseConfig = {
    ...baseConfig,
    plugin: [
      '@ethings-os/typedoc-plugin-markdown',
      'typedoc-plugin-vue',
      './typedoc-plugins/typedoc-plugin-expand-type-aliases/index.cjs',
    ],
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
    readme: 'none',
    out: 'docs-md/sdk/modules',
    treatWarningsAsErrors: true,
    logLevel: 'Info',
    hiddenFunctionParameters: ['deprecatedLegacyContext'],
  };
}

if (process.env.TYPEDOC_MODE === 'PUBLIC') {
  /** @type {import("typedoc").TypeDocOptionValues} */
  module.exports = {
    ...baseConfig,
    name: 'Compose SDK',
    entryPoints: [
      'packages/sdk-data',
      'packages/sdk-ui',
      'packages/sdk-ui-preact',
      'packages/sdk-ui-angular',
      'packages/sdk-ui-vue',
    ],
    hideGenerator: true,
  };
} else {
  /** @type {import("typedoc").TypeDocOptionValues} */
  module.exports = {
    ...baseConfig,
    name: 'Compose SDK [INTERNAL]',
    entryPoints: [
      'packages/sdk-cli',
      'packages/sdk-data',
      'packages/sdk-modeling',
      'packages/sdk-query-client',
      'packages/sdk-ui',
      'packages/sdk-ui-preact',
      'packages/sdk-ui-angular',
      'packages/sdk-ui-vue',
    ],
    hideGenerator: false,
    out: 'docs-internal',
  };
}
