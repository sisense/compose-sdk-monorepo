// TypeDoc config for the monorepo to generate API docs
// for PUBLIC or INTERNAL audiences depending on TYPEDOC_MODE.
let baseConfig= {
    // To allow TypeDoc to resolve references across packages,
    // "declaration" and "declarationMap" in tsconfig.json must be set to true
    entryPointStrategy: 'packages',
    plugin: [
        './typedoc-plugins/typedoc-plugin-expand-type-aliases.js',
    ],
    readme: './quickstart.md',
    // Media directory that will be copied to the output file
    media: './media',
};

if(process.env.TYPEDOC_FORMAT === 'MARKDOWN') {
    baseConfig = {
      ...baseConfig,
      plugin: [
          'typedoc-plugin-markdown',
          './typedoc-plugins/typedoc-plugin-expand-type-aliases.js',
      ],
  }
}

if(process.env.TYPEDOC_MODE === 'PUBLIC') {
    /** @type {import('typedoc').TypeDocOptionValues} */
    module.exports = {
        ...baseConfig,
        name: 'Compose SDK',
        entryPoints: [
            'packages/sdk-cli',
            'packages/sdk-data',
            'packages/sdk-ui',
        ],
        hideGenerator: true,
        out: 'docs',
    };
} else {
    /** @type {import('typedoc').TypeDocOptionValues} */
    module.exports = {
        ...baseConfig,
        name: 'Compose SDK [INTERNAL]',
        entryPoints: [
            'packages/sdk-cli',
            'packages/sdk-data',
            'packages/sdk-modeling',
            'packages/sdk-query-client',
            'packages/sdk-ui'
        ],
        hideGenerator: false,
        out: 'docs-internal',
    };
}

