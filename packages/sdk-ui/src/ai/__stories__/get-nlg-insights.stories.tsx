import { measureFactory } from '@sisense/sdk-data';
import { Meta, StoryObj } from '@storybook/react-vite';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { SisenseContextProviderProps } from '../../props';
import { SisenseContextProvider } from '../../sisense-context/sisense-context-provider';
import AiContextProvider from '../ai-context-provider';
import GetNlgInsights from '../get-nlg-insights';

const sisenseContextProps: SisenseContextProviderProps = {
  url: import.meta.env.VITE_APP_SISENSE_URL ?? '',
  token: import.meta.env.VITE_APP_SISENSE_TOKEN,
  showRuntimeErrors: true,
  appConfig: { errorBoundaryConfig: { alwaysShowErrorText: true } },
};

const meta: Meta<typeof GetNlgInsights> = {
  title: 'AI/Chat/GetNlgInsights',
  component: GetNlgInsights,
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

type Story = StoryObj<typeof GetNlgInsights>;

export const Default: Story = {
  args: {
    dataSource: 'Sample ECommerce',
    dimensions: [DM.Commerce.Date.Years],
    measures: [measureFactory.sum(DM.Commerce.Revenue), measureFactory.sum(DM.Commerce.Cost)],
  },
};
