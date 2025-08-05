import React from 'react';
import type { StoryFn, StoryObj, StoryContext } from '@storybook/react';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider';
import { ThemeProvider, type ThemeSettings } from '..';

const url = import.meta.env.VITE_APP_SISENSE_URL ?? '';
const token = import.meta.env.VITE_APP_SISENSE_TOKEN;
const themeSettings = {
  chart: {
    animation: {
      ...(import.meta.env.VITE_APP_DISABLE_ANIMATION === 'true' && {
        init: { duration: 0 },
        redraw: { duration: 0 },
      }),
    },
  },
} as ThemeSettings;

const contextDecorator = {
  decorators: [
    (Story: StoryFn) => (
      <SisenseContextProvider
        url={url}
        token={token}
        showRuntimeErrors={true}
        appConfig={{ errorBoundaryConfig: { alwaysShowErrorText: true } }}
      >
        <ThemeProvider theme={themeSettings}>
          <Story />
        </ThemeProvider>
      </SisenseContextProvider>
    ),
  ],
};
const visualTestIdDecorator = {
  decorators: [
    (Story: StoryFn, { id }: StoryContext) => (
      <div data-visual-test-id={id}>
        <Story />
      </div>
    ),
  ],
};

export const templateForComponent =
  <P extends {}>(Component: React.FC<P>) =>
  (props: P, decorators?: ((Story: StoryFn) => JSX.Element)[]): StoryObj<typeof Component> => {
    return {
      args: props,
      decorators: [
        ...contextDecorator.decorators,
        ...visualTestIdDecorator.decorators,
        ...(decorators ?? []),
      ],
    };
  };
