import { Meta, StoryObj } from '@storybook/react';
import ChartMessage from '../messages/chart-message';
import { SisenseContextProvider } from '../../sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '../../props';
import { MetadataItemJaql } from '@sisense/sdk-query-client';
import { AiContextProvider } from '@/ai';
import { getDefaultThemeSettings, ThemeProvider } from '@/index';

const sisenseContextProps: SisenseContextProviderProps = {
  url: import.meta.env.VITE_APP_SISENSE_URL ?? '',
  token: import.meta.env.VITE_APP_SISENSE_TOKEN,
};

const meta: Meta<typeof ChartMessage> = {
  title: 'AI/Components/ChartMessage',
  component: ChartMessage,
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

type Story = StoryObj<typeof ChartMessage>;

const props = {
  dataSource: 'Sample ECommerce',
  content: {
    queryTitle: 'Total Revenue by Year',
    detailedDescription: '[Commerce.Revenue] by [Commerce.Date]',
    followupQuestions: [],
    chartRecommendations: {
      axesMapping: {
        category: [{ name: 'Date', type: 'datetime' }],
        value: [{ name: 'total of Revenue', type: 'numeric' }],
      },
      chartFamily: 'cartesian',
      chartType: 'line',
    },
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
          } as MetadataItemJaql,
          format: {
            mask: {
              days: 'shortDate',
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
          } as MetadataItemJaql,
        },
      ],
    },
    nlqPrompt: 'sample prompt',
  },
};

export const Default: Story = {
  args: {
    ...props,
  },
};

export const DarkTheme: Story = {
  args: {
    ...props,
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={getDefaultThemeSettings(true)}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
