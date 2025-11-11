import { filterFactory } from '@sisense/sdk-data';
import { render } from '@testing-library/react';
import { beforeEach, Mock } from 'vitest';

import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { DashboardContainer } from '@/dashboard/components/dashboard-container';
import { Dashboard } from '@/dashboard/dashboard';
import { useComposedDashboardInternal } from '@/dashboard/use-composed-dashboard';

import * as DM from '../__test-helpers__/sample-ecommerce';

vi.mock('./use-composed-dashboard', () => ({
  useComposedDashboardInternal: vi.fn(() => ({ dashboard: { filters: [], widgets: [] } })),
}));

vi.mock('@/dashboard/components/dashboard-container', () => ({
  DashboardContainer: vi.fn(),
}));

const useComposedDashboardInternalMock = useComposedDashboardInternal as Mock;
const DashboardContainerMock = DashboardContainer as Mock;

describe('Dashboard', () => {
  beforeEach(() => {
    useComposedDashboardInternalMock.mockClear();
    DashboardContainerMock.mockClear();
  });

  it('should render DashboardContainer', () => {
    DashboardContainerMock.mockReturnValue(<div data-testid="dashboard-container" />);

    const { getByTestId } = render(
      <MockedSisenseContextProvider>
        <Dashboard widgets={[]} />
      </MockedSisenseContextProvider>,
    );

    expect(getByTestId('dashboard-container')).toBeInTheDocument();
  });

  it('should trigger onChange callback when filters updated', () => {
    const filters = [filterFactory.members(DM.Commerce.Gender, ['Male'])];
    DashboardContainerMock.mockImplementation(({ onFiltersChange }) => (
      <div>{onFiltersChange(filters)}</div>
    ));
    useComposedDashboardInternalMock.mockImplementation((_, { onFiltersChange }) => ({
      dashboard: { filters: [], widgets: [] },
      setFilters: onFiltersChange,
    }));

    const onChangeMock = vi.fn();
    render(
      <MockedSisenseContextProvider>
        <Dashboard widgets={[]} onChange={onChangeMock} />
      </MockedSisenseContextProvider>,
    );

    expect(onChangeMock).toHaveBeenCalledWith({
      type: 'filters/updated',
      payload: filters,
    });
  });
});
