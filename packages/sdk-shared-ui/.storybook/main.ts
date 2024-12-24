import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, join } from 'path';

const getAbsolutePath = (value: string): string =>
  dirname(require.resolve(join(value, 'package.json')));

const config: StorybookConfig = {
  framework: '@storybook/react-vite',

  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [getAbsolutePath('@storybook/addon-docs'), getAbsolutePath('@storybook/addon-a11y')],

  core: {
    builder: {
      options: {},
      name: '@storybook/builder-vite',
    },
  },

  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      resolve: {
        alias: [
          {
            find: '@sbi/styleguide',
            replacement: '@sbi/styleguide/dist/styleguide',
          },
        ],
      },
      css: {
        modules: {
          scopeBehaviour: 'local',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    });
  },

  typescript: { reactDocgen: false },
};

export default config;
