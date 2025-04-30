import { render, fireEvent } from '@testing-library/react';

import { DrilldownWidget } from './drilldown-widget';
import { useMenu } from '@/common/hooks/use-menu';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { Mock } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

vi.mock('@/common/hooks/use-menu', () => ({
  useMenu: vi.fn(),
}));

vi.mock('@/sisense-context/sisense-context');

const mockUseMenu = useMenu as Mock;
const mockUseSisenseContext = useSisenseContext as Mock;

describe('DrilldownWidget', () => {
  const mockOpenMenu = vi.fn();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Provide default Sisense context
    mockUseSisenseContext.mockReturnValue({
      isInitialized: true,
      app: {
        defaultDataSource: DM.DataSource,
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });

    mockUseMenu.mockReturnValue({ openMenu: mockOpenMenu });
  });

  it('renders child function and passes drilldown props (no menu opened by default)', () => {
    const { getByText } = render(
      <DrilldownWidget
        drilldownPaths={[DM.Category.Category, DM.Commerce.Gender]}
        onChange={mockOnChange}
        initialDimension={DM.Commerce.AgeRange}
      >
        {({ onDataPointsSelected }) => (
          <div>
            Child content
            <button onClick={() => onDataPointsSelected([], { clientX: 100, clientY: 200 } as any)}>
              Trigger
            </button>
          </div>
        )}
      </DrilldownWidget>,
    );

    expect(getByText('Child content')).toBeInTheDocument();

    // Clicking "Trigger" sets selected points but doesn't open the menu
    fireEvent.click(getByText('Trigger'));
    expect(mockOpenMenu).not.toHaveBeenCalled();
  });

  it('opens context menu if child calls onDataPointsSelected AND then calls onContextMenu with a position', () => {
    const { getByText } = render(
      <DrilldownWidget
        drilldownPaths={[DM.Category.Category]}
        initialDimension={DM.Commerce.Condition}
        onChange={mockOnChange}
      >
        {({ onDataPointsSelected, onContextMenu }) => {
          return (
            <button
              onClick={() => {
                onDataPointsSelected([], { clientX: 50, clientY: 60 } as any);
                onContextMenu({ top: 60, left: 50 });
              }}
            >
              Open Drilldown Menu
            </button>
          );
        }}
      </DrilldownWidget>,
    );

    fireEvent.click(getByText('Open Drilldown Menu'));

    // Now we expect openMenu to have been called
    expect(mockOpenMenu).toHaveBeenCalledTimes(1);
    expect(mockOpenMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        position: { top: 60, left: 50 },
      }),
    );
  });

  it('renders breadcrumbs by default when there is a current drilldown dimension', () => {
    const { getByText, queryAllByText } = render(
      <DrilldownWidget
        drilldownPaths={[DM.Category.Category]}
        initialDimension={DM.Category.Category}
        onChange={mockOnChange}
        drilldownSelections={[{ points: [], nextDimension: DM.Category.Category }]}
      >
        {() => <div>With drilldown</div>}
      </DrilldownWidget>,
    );

    expect(getByText('With drilldown')).toBeInTheDocument();
    // find breadcrumbs
    expect(queryAllByText('Category (drilldown.breadcrumbsAllSuffix)')).toMatchSnapshot();
  });
});
