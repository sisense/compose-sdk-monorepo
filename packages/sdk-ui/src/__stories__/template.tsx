import React from 'react';
import type { StoryFn, StoryObj, StoryContext } from '@storybook/react';
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
const visualTestIdDecorator = {
  decorators: [
    (Story: StoryFn, { id }: StoryContext) => (
      <div data-visual-testid={id}>
        <Story />
      </div>
    ),
  ],
};

export const templateForComponent =
  <P extends {}>(Component: React.FC<P>) =>
  (props: P, decorators?: StoryObj<typeof Component>['decorators']): StoryObj<typeof Component> => {
    return {
      args: props,
      decorators: [
        ...contextDecorator.decorators,
        ...visualTestIdDecorator.decorators,
        ...(decorators || []),
      ],
    };
  };
