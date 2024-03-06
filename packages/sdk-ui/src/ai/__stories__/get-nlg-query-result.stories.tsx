import { Meta, StoryObj } from '@storybook/react';
import GetNlgQueryResult from '../get-nlg-query-result';
import { SisenseContextProvider } from '../../sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '../../props';
import AiContextProvider from '../ai-context-provider';
import * as DM from '@/__demo__/sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';

const sisenseContextProps: SisenseContextProviderProps = {
  url: import.meta.env.VITE_APP_SISENSE_URL ?? '',
  token: import.meta.env.VITE_APP_SISENSE_TOKEN,
};

const meta: Meta<typeof GetNlgQueryResult> = {
  title: 'AI/Chat/GetNlgQueryResult',
  component: GetNlgQueryResult,
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

type Story = StoryObj<typeof GetNlgQueryResult>;

export const Default: Story = {
  args: {
    dataSource: 'Sample ECommerce',
    dimensions: [DM.Commerce.Date.Years],
    measures: [measureFactory.sum(DM.Commerce.Revenue), measureFactory.sum(DM.Commerce.Cost)],
  },
};
