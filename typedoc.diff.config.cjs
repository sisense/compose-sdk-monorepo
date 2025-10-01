// TypeDoc config for ./scripts/diff-docs-ui.sh
/** @type {import("typedoc").TypeDocOptionValues} */
module.exports = {
  entryPointStrategy: 'packages',
  plugin: [
    'typedoc-plugin-vue',
    './typedoc-plugins/typedoc-plugin-expand-type-aliases/index.cjs',
    '@ethings-os/typedoc-plugin-diff-packages',
  ],
  // validation is not needed for diff-packages
  validation: {
    notExported: false,
    notDocumented: false,
    invalidLink: false,
  },
  readme: 'none',
  out: 'docs/diff-ui',
  name: 'Compose SDK',
  entryPoints: ['packages/sdk-ui', 'packages/sdk-ui-angular', 'packages/sdk-ui-vue'],
  hideGenerator: true,
};
