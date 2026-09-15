import type { Meta, StoryFn, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockNarrativeStandard } from '@/domains/narrative/components/narrative/__mocks__/narrative-mocks.js';
import { ThemeProvider } from '@/infra/contexts/theme-provider';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';

import { NarrativeWidget } from './narrative-widget.js';

const meta: Meta<typeof NarrativeWidget> = {
  title: 'AI/Widgets/NarrativeWidget',
  component: NarrativeWidget,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof NarrativeWidget>;

// The widget reads the AI credit balance through useQuotaNotification, which needs a query
// client. Storybook has no Sisense context, so the query stays disabled and never fetches —
// the credit warning cannot be shown here.
const queryClient = new QueryClient();

/** A dashboard row: full width, fixed height, themed like a dashboard would theme it. */
const inRow =
  (height: number, isDarkMode = false) =>
  (Story: StoryFn) => {
    const StoryComponent = Story as unknown as React.ComponentType;
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={getDefaultThemeSettings(isDarkMode)}>
          <div style={{ width: '100%', height }}>
            <StoryComponent />
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

/** Fresh widget: standard container and header, the Generate action in the body, no copy action yet. */
export const Idle: Story = {
  args: { title: 'Dashboard Narrative' },
  decorators: [inRow(240)],
};

/** Generating without the narrative API wired up lands in the retryable failed state — click Generate. */
export const GenerateWithoutApi: Story = {
  args: { title: 'Dashboard Narrative' },
  decorators: [inRow(240)],
};

/** A pre-supplied narrative: ready state, and the copy action appears in the header toolbar. */
export const Ready: Story = {
  args: { title: 'Dashboard Narrative', narrative: mockNarrativeStandard },
  decorators: [inRow(280)],
};

/** Container styling reaches the widget through `styleOptions`, like any other widget. */
export const StyledContainer: Story = {
  args: {
    title: 'AI Dashboard Summary',
    narrative: mockNarrativeStandard,
    styleOptions: { border: true, borderColor: '#9EA2AB', cornerRadius: 'Large', shadow: 'Medium' },
  },
  decorators: [inRow(300)],
};

/** Dark theme: container, header and content follow the theme tokens. */
export const ReadyDark: Story = {
  args: { title: 'Dashboard Narrative', narrative: mockNarrativeStandard },
  decorators: [inRow(280, true)],
  parameters: { backgrounds: { default: 'dark' } },
};
