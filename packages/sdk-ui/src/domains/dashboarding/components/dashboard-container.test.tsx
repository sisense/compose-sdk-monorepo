import { filterFactory } from '@sisense/sdk-data';
import { fireEvent, render } from '@testing-library/react';

import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { DashboardHeaderProps } from '@/domains/dashboarding/types';
import { FiltersPanelProps } from '@/domains/filters';

import * as DM from '../../../__test-helpers__/sample-ecommerce';
import { DashboardContainer } from './dashboard-container';

vi.mock('./dashboard-header', () => {
  return {
    DashboardHeader: (props: DashboardHeaderProps) => (
      <div data-testid="dashboard-header">
        {props.title}
        <div data-testid="dashboard-toolbar">{props.toolbar?.()}</div>
      </div>
    ),
  };
});

vi.mock('@/domains/filters', () => {
  return {
    FiltersPanel: (props: FiltersPanelProps) => (
      <div data-testid="filter-panel">
        <button
          data-testid="filter-panel-button"
          onClick={() => props.onFiltersChange(props.filters)}
        ></button>
      </div>
    ),
  };
});

const ToolbarFilterToggleButton = ({
  collapsed,
  onToggleClick,
}: {
  collapsed: boolean;
  onToggleClick: () => void;
}) => {
  return (
    <button
      aria-label="Toggle filters panel"
      aria-expanded={!collapsed}
      title={collapsed ? 'Show Filters' : 'Hide Filters'}
      onClick={onToggleClick}
    />
  );
};

describe('DashboardContainer', () => {
  it('should render with header and filters panel', () => {
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { getByText, getByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          editMode={false}
          layoutOptions={{}}
          config={{}}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={false}
          onFilterPanelCollapsedChange={vi.fn()}
        />
      </MockedSisenseContextProvider>,
    );

    expect(getByText(DASHBOARD_TITLE)).toBeInTheDocument();
    expect(getByTestId('dashboard-header')).toBeInTheDocument();
    expect(getByTestId('filter-panel')).toBeInTheDocument();
  });

  it('should render without header and filters panel', () => {
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { queryByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          editMode={false}
          layoutOptions={{}}
          config={{
            toolbar: {
              visible: false,
            },
            filtersPanel: {
              visible: false,
            },
          }}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={false}
          onFilterPanelCollapsedChange={vi.fn()}
        />
      </MockedSisenseContextProvider>,
    );

    expect(queryByTestId('dashboard-header')).toBeNull();
    expect(queryByTestId('filter-panel')).toBeNull();
  });

  it('should trigger onFiltersChange when filterPanel trigger filters update', () => {
    const onFiltersChangeMock = vi.fn();
    const filters = [filterFactory.members(DM.Commerce.Gender, ['male'])];
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { getByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          editMode={false}
          layoutOptions={{}}
          config={{}}
          widgets={[]}
          filters={filters}
          onFiltersChange={onFiltersChangeMock}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={false}
          onFilterPanelCollapsedChange={vi.fn()}
        />
      </MockedSisenseContextProvider>,
    );

    fireEvent.click(getByTestId('filter-panel-button'));

    expect(onFiltersChangeMock).toHaveBeenCalledWith(filters);
  });

  it('should trigger onChange when filters panel collapse state changed', () => {
    const onFilterPanelCollapsedChangeMock = vi.fn();
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { container } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          editMode={false}
          layoutOptions={{}}
          config={{}}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={false}
          onFilterPanelCollapsedChange={onFilterPanelCollapsedChangeMock}
        />
      </MockedSisenseContextProvider>,
    );

    fireEvent.click(container.querySelector('.arrow-wrapper') as Element);

    expect(onFilterPanelCollapsedChangeMock).toHaveBeenCalledWith(true);
  });

  it('should render filter toggle button in header when showFilterIconInToolbar is enabled', () => {
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { container } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          editMode={false}
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
            },
          }}
          renderToolbar={() => (
            <ToolbarFilterToggleButton collapsed={false} onToggleClick={vi.fn()} />
          )}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={false}
          onFilterPanelCollapsedChange={vi.fn()}
        />
      </MockedSisenseContextProvider>,
    );

    // Check that filter toggle button exists in header
    const filterToggleButton = container.querySelector('[aria-label="Toggle filters panel"]');
    expect(filterToggleButton).toBeInTheDocument();
    expect(filterToggleButton).toHaveAttribute('title', 'Hide Filters');
  });

  it('should toggle filters panel when filter icon button is clicked', () => {
    const onFilterPanelCollapsedChangeMock = vi.fn();
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { container } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          editMode={false}
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
            },
          }}
          renderToolbar={() => (
            <ToolbarFilterToggleButton
              collapsed={false}
              onToggleClick={() => onFilterPanelCollapsedChangeMock(true)}
            />
          )}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={false}
          onFilterPanelCollapsedChange={vi.fn()}
        />
      </MockedSisenseContextProvider>,
    );

    const filterToggleButton = container.querySelector('[aria-label="Toggle filters panel"]');
    expect(filterToggleButton).toBeInTheDocument();

    fireEvent.click(filterToggleButton as Element);

    expect(onFilterPanelCollapsedChangeMock).toHaveBeenCalledWith(true);
  });

  it('should hide collapse arrow when showFilterIconInToolbar is enabled', () => {
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { container } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          editMode={false}
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
            },
          }}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={false}
          onFilterPanelCollapsedChange={vi.fn()}
        />
      </MockedSisenseContextProvider>,
    );

    // Check that collapse arrow is not present when showFilterIconInToolbar is enabled
    const collapseArrow = container.querySelector('.arrow-wrapper');
    expect(collapseArrow).toBeNull();
  });

  it('should keep collapse arrow when toolbar is hidden even if showFilterIconInToolbar is true', () => {
    const { container } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title="Test Dashboard"
          editMode={false}
          layoutOptions={{}}
          config={{
            toolbar: { visible: false },
            filtersPanel: { showFilterIconInToolbar: true },
          }}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={false}
          onFilterPanelCollapsedChange={vi.fn()}
        />
      </MockedSisenseContextProvider>,
    );

    const collapseArrow = container.querySelector('.arrow-wrapper');
    expect(collapseArrow).not.toBeNull();
  });

  it('should update filter button title based on collapsed state', () => {
    const DASHBOARD_TITLE = 'Test Dashboard';

    // Test with collapsed initially set to false (expanded)
    const { container: expandedContainer } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          editMode={false}
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
            },
          }}
          renderToolbar={() => (
            <ToolbarFilterToggleButton collapsed={false} onToggleClick={vi.fn()} />
          )}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={false}
          onFilterPanelCollapsedChange={vi.fn()}
        />
      </MockedSisenseContextProvider>,
    );

    let filterToggleButton = expandedContainer.querySelector('[aria-label="Toggle filters panel"]');
    expect(filterToggleButton).toHaveAttribute('title', 'Hide Filters');
    expect(filterToggleButton).toHaveAttribute('aria-expanded', 'true');

    // Test with collapsed initially set to true (collapsed)
    const { container: collapsedContainer } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          editMode={false}
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
            },
          }}
          renderToolbar={() => (
            <ToolbarFilterToggleButton collapsed={true} onToggleClick={vi.fn()} />
          )}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          onLayoutChange={vi.fn()}
          filterPanelCollapsed={true}
          onFilterPanelCollapsedChange={vi.fn()}
        />
      </MockedSisenseContextProvider>,
    );

    filterToggleButton = collapsedContainer.querySelector('[aria-label="Toggle filters panel"]');
    expect(filterToggleButton).toHaveAttribute('title', 'Show Filters');
    expect(filterToggleButton).toHaveAttribute('aria-expanded', 'false');
  });
});
