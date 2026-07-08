import React from 'react';

import type { StoryContext, StoryFn, StoryObj } from '@storybook/react';

import { ThemeProvider, type ThemeSettings } from '..';
import { SisenseContextProvider } from '../infra/contexts/sisense-context/sisense-context-provider';

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
    (Story: StoryFn) => {
      const StoryComponent = Story as unknown as React.ComponentType;
      return (
        <SisenseContextProvider
          url={url}
          token={token}
          showRuntimeErrors={true}
          appConfig={{ errorBoundaryConfig: { alwaysShowErrorText: true } }}
        >
          <ThemeProvider theme={themeSettings}>
            <StoryComponent />
          </ThemeProvider>
        </SisenseContextProvider>
      );
    },
  ],
};
const visualTestIdDecorator = {
  decorators: [
    (Story: StoryFn, { id }: StoryContext) => {
      const StoryComponent = Story as unknown as React.ComponentType;
      return (
        <div data-visual-test-id={id}>
          <StoryComponent />
        </div>
      );
    },
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
