import { Meta, StoryObj } from '@storybook/react';
import ChatInput from '../chat-input';

const meta: Meta<typeof ChatInput> = {
  title: 'AI/Components/ChatInput',
  component: ChatInput,
};
export default meta;

type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
  args: {
    onSendMessage: (message) => {
      console.log(message);
    },
  },
};

export const WithDropup: Story = {
  args: {
    recentPrompts: ['user prompt 1', 'user prompt 2'],
    suggestions: [
      'How many duplicate Visit IDs are there?',
      'What is the total revenue generated?',
      'What is the total quantity of items sold?',
    ],
    isLoading: false,
    onSendMessage: (message) => {
      console.log(message);
    },
  },
  decorators: [
    (Story) => (
      <div className="csdk-pt-48 csdk-bg-background-priority">
        <div className="csdk-m-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const WithDropupLoading: Story = {
  args: {
    recentPrompts: [],
    suggestions: [],
    isLoading: true,
    onSendMessage: (message) => {
      console.log(message);
    },
  },
  decorators: [
    (Story) => (
      <div className="csdk-pt-48 csdk-bg-background-priority">
        <div className="csdk-m-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};
