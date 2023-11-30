/* eslint-disable import/no-extraneous-dependencies */
import { Meta, StoryObj } from '@storybook/react';
import { SisenseContextProviderProps } from '../../index';
import { SisenseContextProvider } from '../../sisense-context/sisense-context-provider';
import { ChatApiContextProvider } from '../api/chat-api-context';
import { Chatbot } from '../chatbot';

const sisenseContextProps: SisenseContextProviderProps = {
  url: import.meta.env.VITE_APP_SISENSE_URL ?? '',
  token: import.meta.env.VITE_APP_SISENSE_TOKEN,
};

const meta: Meta<typeof Chatbot> = {
  title: 'AI/Chat/Chatbot',
  component: Chatbot,
  decorators: [
    (Story) => (
      <SisenseContextProvider {...sisenseContextProps}>
        <ChatApiContextProvider>
          <Story />
        </ChatApiContextProvider>
      </SisenseContextProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Chatbot>;

export const Default: Story = {};
export const CustomWidth: Story = {
  args: {
    width: 1000,
  },
};
export const MinWidth: Story = {
  args: {
    width: 200,
  },
};
