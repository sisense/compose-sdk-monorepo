import { DashboardHeaderProps } from '@/dashboard/types';
import { FiltersPanelProps } from '@/filters';
import { filterFactory } from '@sisense/sdk-data';
import { fireEvent, render } from '@testing-library/react';
import { DashboardContainer } from './dashboard-container';
import * as DM from '../../__test-helpers__/sample-ecommerce';

vi.mock('./dashboard-header', async () => {
  return {
    DashboardHeader: (props: DashboardHeaderProps) => (
      <div data-testid="dashboard-header">{props.title}</div>
    ),
  };
});

vi.mock('@/filters', async () => {
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
  it('should render with header and filters panel', async () => {
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { getByText, getByTestId } = render(
      <DashboardContainer
        title={DASHBOARD_TITLE}
        layoutOptions={{}}
        config={{}}
        widgets={[]}
        filters={[]}
        onFiltersChange={vi.fn()}
        defaultDataSource={''}
      />,
    );

    expect(getByText(DASHBOARD_TITLE)).toBeInTheDocument();
    expect(getByTestId('dashboard-header')).toBeInTheDocument();
    expect(getByTestId('filter-panel')).toBeInTheDocument();
  });

  it('should render without header and filters panel', async () => {
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { queryByTestId } = render(
      <DashboardContainer
        title={DASHBOARD_TITLE}
        layoutOptions={{}}
        config={{
          toolbar: {
            isVisible: false,
          },
          filtersPanel: {
            isVisible: false,
          },
        }}
        widgets={[]}
        filters={[]}
        onFiltersChange={vi.fn()}
        defaultDataSource={''}
      />,
    );

    expect(queryByTestId('dashboard-header')).toBeNull();
    expect(queryByTestId('filter-panel')).toBeNull();
  });

  it('should trigger onFiltersChange when filterPanel trigger filters update', async () => {
    const onFiltersChangeMock = vi.fn();
    const filters = [filterFactory.members(DM.Commerce.Gender, ['male'])];
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { getByTestId } = render(
      <DashboardContainer
        title={DASHBOARD_TITLE}
        layoutOptions={{}}
        config={{}}
        widgets={[]}
        filters={filters}
        onFiltersChange={onFiltersChangeMock}
        defaultDataSource={''}
      />,
    );

    fireEvent.click(getByTestId('filter-panel-button'));

    expect(onFiltersChangeMock).toHaveBeenCalledWith(filters);
  });

  it('should trigger onChange when filters panel collapse state changed', async () => {
    const onChangeMock = vi.fn();
    const DASHBOARD_TITLE = 'Test Dashboard';
    const { container } = render(
      <DashboardContainer
        title={DASHBOARD_TITLE}
        layoutOptions={{}}
        config={{}}
        widgets={[]}
        filters={[]}
        onFiltersChange={vi.fn()}
        defaultDataSource={''}
        onChange={onChangeMock}
      />,
    );

    fireEvent.click(container.querySelector('.arrow-wrapper') as Element);

    expect(onChangeMock).toHaveBeenCalledWith({
      payload: true,
      type: 'UI.FILTERS.PANEL.COLLAPSE',
    });
  });
});
