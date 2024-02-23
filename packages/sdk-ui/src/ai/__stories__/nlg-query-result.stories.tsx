import { Meta, StoryObj } from '@storybook/react';
import GetNlgQueryResult from '../get-nlg-query-result';
import { SisenseContextProvider } from '../../sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '../../props';
import AiContextProvider from '../ai-context-provider';

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
    jaql: {
      datasource: { title: 'Sample ECommerce' },
      metadata: [
        {
          jaql: {
            column: 'Date',
            datatype: 'datetime',
            dim: '[Commerce.Date]',
            firstday: 'mon',
            level: 'years',
            table: 'Commerce',
            title: 'Date',
          },
          format: {
            mask: {
              days: 'shortDate',
              isdefault: true,
              minutes: 'HH:mm',
              months: 'MM/yyyy',
              quarters: 'yyyy Q',
              weeks: 'ww yyyy',
              years: 'yyyy',
            },
          },
        },
        {
          jaql: {
            agg: 'sum',
            column: 'Revenue',
            datatype: 'numeric',
            dim: '[Commerce.Revenue]',
            table: 'Commerce',
            title: 'total of Revenue',
          },
        },
      ],
    },
    style: 'Large',
  },
};
