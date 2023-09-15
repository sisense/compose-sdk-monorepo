import React from 'react';
import type { StoryObj } from '@storybook/react';

export const templateForComponent =
  <P extends {}>(Component: React.FC<P>) =>
  (props: P, decorators?: StoryObj<typeof Component>['decorators']): StoryObj<typeof Component> => {
    return {
      args: props,
      decorators,
    };
  };
