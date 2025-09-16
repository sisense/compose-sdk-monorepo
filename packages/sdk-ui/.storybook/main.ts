import { dirname, join } from 'path';
import type { StorybookConfig } from '@storybook/react-vite';
import { withoutVitePlugins } from '@storybook/builder-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-storysource'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  async viteFinal(config) {
    // We get "Unable to preload CSS for ___" errors when trying to render a
    // story from a storybook build (not in development). This seems to work
    // correctly when not forcing an injection of CSS into the JS, which is
    // really only needed when building sdk-ui in library mode anyway.
    //
    // This is inspired by https://krzysztofzuraw.com/blog/2023/storybook-vite-config/.
    config.plugins = await withoutVitePlugins(config.plugins, [
      'vite-plugin-css-injected-by-js',
      'vite:dts',
    ]);

    config.server = {
      ...config.server,
      allowedHosts: true,
    };

    return config;
  },
  docs: {
    autodocs: true,
  },
  typescript: {
    reactDocgen: false,
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
