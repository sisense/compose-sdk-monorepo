import React from 'react';
import { I18nextProvider } from 'react-i18next';

import type { Preview } from '@storybook/react-vite';

import { i18nextInstance } from '../src/infra/translation/initialize-i18n';
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

    docs: {
      codePanel: true,
    },
  },

  decorators: [
    (Story) =>
      React.createElement(I18nextProvider, { i18n: i18nextInstance }, React.createElement(Story)),
  ],

  tags: ['autodocs'],
};

export default preview;
