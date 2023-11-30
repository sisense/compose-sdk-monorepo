import React from 'react';
import type { StoryFn, StoryObj } from '@storybook/react';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider';

const url = import.meta.env.VITE_APP_SISENSE_URL ?? '';
const token = import.meta.env.VITE_APP_SISENSE_TOKEN;
const contextDecorator = {
  decorators: [
    (Story: StoryFn) => (
      <SisenseContextProvider url={url} token={token}>
        <Story />
      </SisenseContextProvider>
    ),
  ],
};

export const templateForComponent =
  <P extends {}>(Component: React.FC<P>) =>
  (props: P, decorators?: StoryObj<typeof Component>['decorators']): StoryObj<typeof Component> => {
    return {
      args: props,
      decorators: decorators
        ? [...contextDecorator.decorators, ...decorators]
        : contextDecorator.decorators,
    };
  };
