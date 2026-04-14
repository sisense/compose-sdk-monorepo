/** @type { import("eslint").Linter.Config } */
module.exports = {
  overrides: [
    {
      // vitest/valid-expect does not recognise the two-argument form
      // expect(value, message) which is valid Vitest syntax.
      files: ['**/*.test.{ts,tsx}'],
      rules: {
        'vitest/valid-expect': 'off',
      },
    },
  ],
};
