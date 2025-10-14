import { MetadataItem } from '@sisense/sdk-data';
import { Meta } from '@storybook/react-vite';

import { templateForComponent } from '../../__stories__/template';
import { SisenseContextProviderProps } from '../../props';
import { SisenseContextProvider } from '../../sisense-context/sisense-context-provider';
import AiContextProvider from '../ai-context-provider';
import InsightsMessage from '../messages/insights-message';

const template = templateForComponent(InsightsMessage);

const meta: Meta<typeof InsightsMessage> = {
  title: 'AI/Components/InsightsMessage',
  component: InsightsMessage,
};
export default meta;

const sisenseContextProps: SisenseContextProviderProps = {
  url: import.meta.env.VITE_APP_SISENSE_URL ?? '',
  token: import.meta.env.VITE_APP_SISENSE_TOKEN,
  showRuntimeErrors: true,
  appConfig: { errorBoundaryConfig: { alwaysShowErrorText: true } },
};

export const Default = template(
  {
    nlgRequest: {
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
        ] as MetadataItem[],
      },
    },
  },
  [
    (Story) => (
      <SisenseContextProvider {...sisenseContextProps}>
        <AiContextProvider>
          <Story />
        </AiContextProvider>
      </SisenseContextProvider>
    ),
  ],
);
