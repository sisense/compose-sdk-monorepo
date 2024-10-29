import type { Preview } from '@storybook/react';
import './global.css';
type CallbackArg = `on${string}`;
const argsToExclude: CallbackArg[] = ['onBeforeRender', 'onDataReady'];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: `(?!${argsToExclude.join('|')})^on[A-Z].*` },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
