import { UseDashboardModelActionType, useDashboardModelInternal } from '@/models';
import { beforeEach, Mock } from 'vitest';
import { DashboardById } from './dashboard-by-id';
import { render } from '@testing-library/react';
import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { Dashboard, DashboardChangeType } from './dashboard';
import { filterFactory } from '@sisense/sdk-data';
import * as DM from '../__test-helpers__/sample-ecommerce';

// Mock the Dashboard component completely
vi.mock('./dashboard', () => ({
  Dashboard: vi.fn(() => <div data-testid="dashboard" />),
  DashboardChangeType: {
    FILTERS_UPDATE: 'FILTERS_UPDATE',
    WIDGETS_UPDATE: 'WIDGETS_UPDATE',
    LAYOUT_UPDATE: 'LAYOUT_UPDATE',
  },
}));

// Mock the useDashboardModel hook
vi.mock('@/models/dashboard/use-dashboard-model/use-dashboard-model', () => ({
  useDashboardModelInternal: vi.fn(),
}));

const useDashboardModelInternalMock = useDashboardModelInternal as Mock;
const DashboardMock = Dashboard as Mock;

describe('DashboardById', () => {
  beforeEach(() => {
    useDashboardModelInternalMock.mockClear();
    DashboardMock.mockClear();
  });

  it('should render Dashboard', () => {
    useDashboardModelInternalMock.mockReturnValue({
      dashboard: {
        oid: 'test-oid',
        widgets: [],
        filters: [],
      },
      isLoading: false,
      isError: false,
      error: undefined,
      dispatchChanges: vi.fn(),
    });

    const { getByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(getByTestId('dashboard')).toBeInTheDocument();
  });

  it('the Dashboard should not be rendered due to a loading in progress', () => {
    useDashboardModelInternalMock.mockReturnValue({
      dashboard: null,
      isLoading: true,
      isError: false,
      error: undefined,
      dispatchChanges: vi.fn(),
    });

    const { queryByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(queryByTestId('dashboard')).toBeNull();
  });

  it('the Dashboard should not be rendered due to a loading error', () => {
    useDashboardModelInternalMock.mockReturnValue({
      dashboard: null,
      isLoading: false,
      isError: true,
      error: new Error('Test error'),
      dispatchChanges: vi.fn(),
    });

    const { queryByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(queryByTestId('dashboard')).toBeNull();
  });

  it('should dispatch filters update then Dashboard trigger related onChange', () => {
    const filters = [filterFactory.members(DM.Commerce.Gender, ['Male'])];
    const dispatchChangesMock = vi.fn();

    useDashboardModelInternalMock.mockReturnValue({
      dashboard: {
        oid: 'test-oid',
        widgets: [],
        filters: [],
      },
      isLoading: false,
      isError: false,
      error: undefined,
      dispatchChanges: dispatchChangesMock,
    });

    DashboardMock.mockImplementation(({ onChange }) => {
      // Trigger the onChange immediately to simulate user interaction
      if (onChange) {
        onChange({ type: DashboardChangeType.FILTERS_UPDATE, payload: filters });
      }
      return <div data-testid="dashboard" />;
    });

    render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(dispatchChangesMock).toHaveBeenCalledWith({
      type: UseDashboardModelActionType.FILTERS_UPDATE,
      payload: filters,
    });
  });
});
