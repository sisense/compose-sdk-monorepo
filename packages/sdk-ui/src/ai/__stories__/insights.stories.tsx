/* eslint-disable import/no-extraneous-dependencies */
import { templateForComponent } from '../../__stories__/template';

import { Meta } from '@storybook/react';
import InsightsMessage from '../messages/insights-message';
import { SisenseContextProvider } from '../../sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '../../props';
import { ChatApiContextProvider } from '../api/chat-api-context';

const template = templateForComponent(InsightsMessage);

const meta: Meta<typeof InsightsMessage> = {
  title: 'AI/Components/InsightsMessage',
  component: InsightsMessage,
};
export default meta;

const sisenseContextProps: SisenseContextProviderProps = {
  url: import.meta.env.VITE_APP_SISENSE_URL ?? '',
  token: import.meta.env.VITE_APP_SISENSE_TOKEN,
};

export const Default = template(
  {
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
  [
    (Story) => (
      <SisenseContextProvider {...sisenseContextProps}>
        <ChatApiContextProvider>
          <Story />
        </ChatApiContextProvider>
      </SisenseContextProvider>
    ),
  ],
);
