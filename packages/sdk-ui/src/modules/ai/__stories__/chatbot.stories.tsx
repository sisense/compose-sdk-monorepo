import { Meta, StoryObj } from '@storybook/react-vite';

import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '@/props';

import AiContextProvider from '../ai-context-provider.js';
import { Chatbot } from '../chatbot.js';

const sisenseContextProps: SisenseContextProviderProps = {
  url: import.meta.env.VITE_APP_SISENSE_URL ?? '',
  token: import.meta.env.VITE_APP_SISENSE_TOKEN,
  showRuntimeErrors: true,
  appConfig: { errorBoundaryConfig: { alwaysShowErrorText: true } },
};

const meta: Meta<typeof Chatbot> = {
  title: 'AI/Chat/Chatbot',
  component: Chatbot,
  decorators: [
    (Story) => (
      <SisenseContextProvider {...sisenseContextProps}>
        <AiContextProvider>
          <Story />
        </AiContextProvider>
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
export const WithFollowupQuestionsEnabled: Story = {
  args: {
    config: { enableFollowupQuestions: true },
  },
};
export const WithCustomNumberOfRecommendations: Story = {
  args: {
    config: { numOfRecommendations: 6 },
  },
};

export const WithSingleDaatTopic: Story = {
  args: {
    config: { dataTopicsList: ['Sample ECommerce'] },
  },
};

export const WithMultipleDataTopics: Story = {
  args: {
    config: { dataTopicsList: ['Sample ECommerce', 'Sample Healthcare'] },
  },
};

export const WithDisabledWelcomeText: Story = {
  args: {
    config: {
      dataTopicsList: ['Sample ECommerce'],
      welcomeText: false,
    },
  },
};

export const WithCustomWelcomeText: Story = {
  args: {
    config: {
      dataTopicsList: ['Sample ECommerce'],
      welcomeText:
        'Hey there! I assist in creating Compose SDK Queries and Charts.\nTell me what to code!',
    },
  },
};
