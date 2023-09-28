import type { StorybookConfig } from '@storybook/react-vite';
import { withoutVitePlugins } from '@storybook/builder-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-storysource',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    // We get "Unable to preload CSS for ___" errors when trying to render a
    // story from a storybook build (not in development). This seems to work
    // correctly when not forcing an injection of CSS into the JS, which is
    // really only needed when building sdk-ui in library mode anyway.
    //
    // This is inspired by https://krzysztofzuraw.com/blog/2023/storybook-vite-config/.
    config.plugins = await withoutVitePlugins(config.plugins, ['vite-plugin-css-injected-by-js']);
    return config;
  },
};

export default config;
