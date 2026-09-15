import type { ReactNode } from 'react';

import type { Meta, StoryFn, StoryObj } from '@storybook/react-vite';

import { createNarrativeCopyItem } from '@/domains/widgets/components/narrative-widget/copy-header-item.js';
import { withHeaderItemsInConfig } from '@/domains/widgets/helpers/header-items-utils.js';
import { WidgetContainer } from '@/domains/widgets/shared/widget-container';
import { useWidgetHeaderTitle } from '@/domains/widgets/shared/widget-header/features/use-widget-header-title';
import { ThemeProvider } from '@/infra/contexts/theme-provider';

import {
  mockNarrativeLowDensity,
  mockNarrativeOverflow,
  mockNarrativeStandard,
  mockNarrativeTwoInsights,
} from './__mocks__/narrative-mocks.js';
import { Narrative } from './narrative.js';

/** Wrapped in `ThemeProvider` only — theme is the one context this component reads. */
const meta: Meta<typeof Narrative> = {
  title: 'AI/Components/Narrative',
  component: Narrative,
};
export default meta;

type Story = StoryObj<typeof Narrative>;

/** The real widget container with a titled header and, when given, the copy action as a header item. */
function Frame({ copyText, children }: { copyText?: string; children: ReactNode }) {
  const headerConfigWithTitle = useWidgetHeaderTitle(undefined, { title: 'Dashboard Narrative' });
  const headerConfig =
    copyText === undefined
      ? headerConfigWithTitle
      : withHeaderItemsInConfig([createNarrativeCopyItem({ copyText })])(headerConfigWithTitle);
  return <WidgetContainer headerConfig={headerConfig}>{children}</WidgetContainer>;
}

/**
 * Frames the content in the real widget container. Width stays fluid so resizing the canvas exercises
 * the container query; height is pinned, as a dashboard layout would pin it.
 */
const framed =
  (height: number, width: number | string = '100%') =>
  (Story: StoryFn) => {
    const StoryComponent = Story as unknown as React.ComponentType;
    return (
      <ThemeProvider>
        <div style={{ width, height }}>
          <Frame>
            <StoryComponent />
          </Frame>
        </div>
      </ThemeProvider>
    );
  };

/** A dashboard row: full width, fixed height. Resize the canvas to watch the insights re-flow. */
const inRow = framed(240);

/** Frames the content with the copy action in the header, as the mockup draws it. */
const framedWithHeaderCopy = (height: number) => (Story: StoryFn) => {
  const StoryComponent = Story as unknown as React.ComponentType;
  return (
    <ThemeProvider>
      <div style={{ width: '100%', height }}>
        <Frame copyText={mockNarrativeStandard.copyText}>
          <StoryComponent />
        </Frame>
      </div>
    </ThemeProvider>
  );
};

export const Idle: Story = {
  args: { state: { status: 'idle' } },
  decorators: [inRow],
};

export const IdleWithQuotaWarning: Story = {
  args: { state: { status: 'idle' }, quotaWarning: { usagePercentage: 87 } },
  decorators: [inRow],
};

export const Loading: Story = {
  args: { state: { status: 'loading' } },
  decorators: [inRow],
};

/** Standard density: overview plus the maximum of three insights, one per status. */
export const Ready: Story = {
  args: { state: { status: 'ready', data: mockNarrativeStandard } },
  decorators: [inRow],
};

/** The header carries the copy action as a header item, matching the mockup's toolbar. */
export const ReadyWithHeaderCopy: Story = {
  args: { state: { status: 'ready', data: mockNarrativeStandard } },
  decorators: [framedWithHeaderCopy(240)],
};

/** Proves the insight row holds together at fewer than three items. */
export const ReadyWithTwoInsights: Story = {
  args: { state: { status: 'ready', data: mockNarrativeTwoInsights } },
  decorators: [inRow],
};

/** Low density: no insights and no badges — a normal outcome, not an empty state. */
export const ReadyLowDensity: Story = {
  args: { state: { status: 'ready', data: mockNarrativeLowDensity } },
  decorators: [framed(180)],
};

/** Beside Regenerate the warning is a mark with a tooltip; spelled out only before generating. */
export const ReadyWithQuotaWarning: Story = {
  args: {
    state: { status: 'ready', data: mockNarrativeStandard },
    quotaWarning: { usagePercentage: 87 },
  },
  decorators: [inRow],
};

/** Allowance spent with a narrative on screen: the text stays, Regenerate goes dead, the mark remains. */
export const ReadyWithCreditsExhausted: Story = {
  args: {
    state: { status: 'ready', data: mockNarrativeStandard },
    quotaWarning: { usagePercentage: 100, exceeded: true },
  },
  decorators: [inRow],
};

/** Constrained height: only the generated text scrolls, the footer stays pinned at the bottom. */
export const ReadyOverflowing: Story = {
  args: { state: { status: 'ready', data: mockNarrativeOverflow } },
  decorators: [framed(150)],
};

/** Pinned narrow: the insights stack below the breakpoint. */
export const ReadyNarrow: Story = {
  args: { state: { status: 'ready', data: mockNarrativeStandard } },
  decorators: [framed(460, 420)],
};

/** Nothing to narrate — generation cannot help, so the action stays disabled. */
export const ErrorNoData: Story = {
  args: { state: { status: 'error', kind: 'no-data' } },
  decorators: [inRow],
};

/** Generation failed and may succeed on another attempt, so the action returns as a retry. */
export const ErrorFailed: Story = {
  args: { state: { status: 'error', kind: 'failed' } },
  decorators: [inRow],
};

/** Allowance spent: the body is replaced by the message and no action is offered. */
export const ErrorQuotaExceeded: Story = {
  args: { state: { status: 'error', kind: 'quota-exceeded' } },
  decorators: [inRow],
};
