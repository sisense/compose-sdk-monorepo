import { filterFactory } from '@sisense/sdk-data';
import { fireEvent, render } from '@testing-library/react';

import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { DashboardHeaderProps } from '@/dashboard/types';
import { FiltersPanelProps } from '@/filters';

import * as DM from '../../__test-helpers__/sample-ecommerce';
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

vi.mock('@/filters', () => {
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

describe('DashboardContainer', () => {
  it('should render with header and filters panel', () => {
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { getByText, getByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          layoutOptions={{}}
          config={{}}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          defaultDataSource={''}
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
          defaultDataSource={''}
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
          layoutOptions={{}}
          config={{}}
          widgets={[]}
          filters={filters}
          onFiltersChange={onFiltersChangeMock}
          defaultDataSource={''}
        />
      </MockedSisenseContextProvider>,
    );

    fireEvent.click(getByTestId('filter-panel-button'));

    expect(onFiltersChangeMock).toHaveBeenCalledWith(filters);
  });

  it('should trigger onChange when filters panel collapse state changed', () => {
    const onChangeMock = vi.fn();
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { container } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          layoutOptions={{}}
          config={{}}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          defaultDataSource={''}
          onChange={onChangeMock}
        />
      </MockedSisenseContextProvider>,
    );

    fireEvent.click(container.querySelector('.arrow-wrapper') as Element);

    expect(onChangeMock).toHaveBeenCalledWith({
      payload: true,
      type: 'filtersPanel/collapse/changed',
    });
  });

  it('should render filter toggle button in header when showFilterIconInToolbar is enabled', () => {
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { container } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
            },
          }}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          defaultDataSource={''}
        />
      </MockedSisenseContextProvider>,
    );

    // Check that filter toggle button exists in header
    const filterToggleButton = container.querySelector('[aria-label="Toggle filters panel"]');
    expect(filterToggleButton).toBeInTheDocument();
    expect(filterToggleButton).toHaveAttribute('title', 'Hide Filters');
  });

  it('should toggle filters panel when filter icon button is clicked', () => {
    const onChangeMock = vi.fn();
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { container } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
            },
          }}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          defaultDataSource={''}
          onChange={onChangeMock}
        />
      </MockedSisenseContextProvider>,
    );

    const filterToggleButton = container.querySelector('[aria-label="Toggle filters panel"]');
    expect(filterToggleButton).toBeInTheDocument();

    fireEvent.click(filterToggleButton as Element);

    expect(onChangeMock).toHaveBeenCalledWith({
      payload: true,
      type: 'filtersPanel/collapse/changed',
    });
  });

  it('should hide collapse arrow when showFilterIconInToolbar is enabled', () => {
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { container } = render(
      <MockedSisenseContextProvider>
        <DashboardContainer
          title={DASHBOARD_TITLE}
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
            },
          }}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          defaultDataSource={''}
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
          layoutOptions={{}}
          config={{
            toolbar: { visible: false },
            filtersPanel: { showFilterIconInToolbar: true },
          }}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          defaultDataSource={''}
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
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
              collapsedInitially: false,
            },
          }}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          defaultDataSource={''}
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
          layoutOptions={{}}
          config={{
            filtersPanel: {
              showFilterIconInToolbar: true,
              collapsedInitially: true,
            },
          }}
          widgets={[]}
          filters={[]}
          onFiltersChange={vi.fn()}
          defaultDataSource={''}
        />
      </MockedSisenseContextProvider>,
    );

    filterToggleButton = collapsedContainer.querySelector('[aria-label="Toggle filters panel"]');
    expect(filterToggleButton).toHaveAttribute('title', 'Show Filters');
    expect(filterToggleButton).toHaveAttribute('aria-expanded', 'false');
  });
});
