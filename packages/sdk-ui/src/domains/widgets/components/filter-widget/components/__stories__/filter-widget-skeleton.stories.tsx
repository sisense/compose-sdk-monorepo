import { createAttribute } from '@sisense/sdk-data';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { SisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

import { FilterWidget } from '../../filter-widget';
import { FilterWidgetSkeleton } from '../../filter-widget-skeleton';

const meta: Meta<typeof FilterWidgetSkeleton> = {
  title: 'Widgets/FilterWidget/Skeleton',
  component: FilterWidgetSkeleton,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof FilterWidgetSkeleton>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <FilterWidgetSkeleton />
    </div>
  ),
};

/** The real FilterWidget while the Sisense app initializes: the header is already in place. */
export const InAWidgetContainer: Story = {
  name: 'In a widget container',
  render: () => (
    <SisenseContext.Provider
      value={{
        isInitialized: true,
        app: undefined,
        tracking: { enabled: false, packageName: 'sdk-ui' },
        errorBoundary: { showErrorBox: true },
      }}
    >
      <div style={{ width: 420, height: 120 }}>
        <FilterWidget
          attribute={createAttribute({
            name: 'Country',
            expression: '[Commerce.Country]',
            type: 'text',
          })}
        />
      </div>
    </SisenseContext.Provider>
  ),
};
