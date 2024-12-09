import { useDashboardModel, UseDashboardModelActionType } from '@/models';
import { beforeEach, Mock } from 'vitest';
import { DashboardById } from './dashboard-by-id';
import { render } from '@testing-library/react';
import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { Dashboard, DashboardChangeType } from './dashboard';
import { filterFactory } from '@sisense/sdk-data';
import * as DM from '../__test-helpers__/sample-ecommerce';

vi.mock('./dashboard', async (importOriginal) => {
  const original = await importOriginal<typeof import('./dashboard')>();
  return {
    ...original,
    Dashboard: vi.fn(() => <div data-testid="dashboard" />),
  };
});

vi.mock('@/models/dashboard/use-dashboard-model/use-dashboard-model', () => {
  return {
    useDashboardModel: vi.fn(),
  };
});

const useDashboardModelMock = useDashboardModel as Mock;
const DashboardMock = Dashboard as Mock;

describe('DashboardById', () => {
  beforeEach(() => {
    useDashboardModelMock.mockClear();
    DashboardMock.mockClear();
  });

  it('should render Dashboard', () => {
    useDashboardModelMock.mockReturnValue({
      dashboard: {
        oid: 'test-oid',
        widgets: [],
        filters: [],
      },
    });
    const { getByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(getByTestId('dashboard')).toBeInTheDocument();
  });

  it('the Dashboard should not be rendered due to a loading in progress', () => {
    useDashboardModelMock.mockReturnValue({
      isLoading: true,
    });
    const { queryByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(queryByTestId('dashboard')).toBeNull();
  });

  it('the Dashboard should not be rendered due to a loading error', () => {
    useDashboardModelMock.mockReturnValue({
      isError: true,
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
    useDashboardModelMock.mockReturnValue({
      dashboard: {
        oid: 'test-oid',
        widgets: [],
        filters: [],
      },
      dispatchChanges: dispatchChangesMock,
    });

    DashboardMock.mockImplementation(({ onChange }) => {
      return (
        <div data-testid="dashboard">
          {onChange({ type: DashboardChangeType.FILTERS_UPDATE, payload: filters })}
        </div>
      );
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
