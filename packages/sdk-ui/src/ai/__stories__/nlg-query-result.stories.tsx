/* eslint-disable import/no-extraneous-dependencies */
import { Meta, StoryObj } from '@storybook/react';
import NlgQueryResult from '../nlg-query-result';
import { SisenseContextProvider } from '../../sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '../../props';
import { ChatApiContextProvider } from '../api/chat-api-context';

const sisenseContextProps: SisenseContextProviderProps = {
  url: import.meta.env.VITE_APP_SISENSE_URL ?? '',
  token: import.meta.env.VITE_APP_SISENSE_TOKEN,
};

const meta: Meta<typeof NlgQueryResult> = {
  title: 'AI/Chat/NlgQueryResult',
  component: NlgQueryResult,
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

type Story = StoryObj<typeof NlgQueryResult>;

export const Default: Story = {
  args: {
    dataSource: 'Sample ECommerce',
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
};
