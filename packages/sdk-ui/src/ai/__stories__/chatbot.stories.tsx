import { Meta, StoryObj } from '@storybook/react';
import { SisenseContextProviderProps } from '../../index';
import { SisenseContextProvider } from '../../sisense-context/sisense-context-provider';
import AiContextProvider from '../ai-context-provider';
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
export const WithDefaultContext: Story = {
  args: {
    config: { defaultContextTitle: 'Sample ECommerce' },
  },
};

export const WithDisabledWelcomeText: Story = {
  args: {
    config: {
      defaultContextTitle: 'Sample ECommerce',
      welcomeText: false,
    },
  },
};

export const WithCustomWelcomeText: Story = {
  args: {
    config: {
      defaultContextTitle: 'Sample ECommerce',
      welcomeText:
        'Hey there! I assist in creating Compose SDK Queries and Charts.\nTell me what to code!',
    },
  },
};

export const WithCustomStyle: Story = {
  args: {
    style: {
      backgroundColor: 'rgba(23, 28, 38, 1)',
      primaryTextColor: 'rgba(242, 247, 255, 0.9)',
      secondaryTextColor: 'rgba(242, 247, 255, 0.4)',
      messageBackgroundColor: 'rgba(46, 55, 77, 1)',
      inputBackgroundColor: 'rgba(31, 37, 51, 1)',
      border: false,
      suggestions: {
        textColor: 'rgba(88, 192, 244, 1)',
        border: '1px solid #2E374D',
        hoverBackgroundColor: 'rgba(242, 247, 255, 0.1)',
        loadingGradient: ['rgba(242, 247, 255, 0.1)', 'rgba(242, 247, 255, 0.3)'],
      },
      iconColor: 'rgba(242, 247, 255, 0.5)',
    },
    config: { defaultContextTitle: 'Sample ECommerce' },
  },
};
