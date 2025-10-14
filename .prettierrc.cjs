module.exports = {
  ...require('@sisense/prettier-config'),
  tabWidth: 2,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^react', '^@?\\w', '^@sisense/', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  overrides: [
    // TypeScript files without JSX - exclude JSX parser to allow type assertions like <Type>value
    {
      files: ['*.ts'],
      options: {
        importOrderParserPlugins: ['typescript', 'decorators-legacy'],
      },
    },
  ],
};
