/* eslint-disable @typescript-eslint/unbound-method */
/** @vitest-environment jsdom */

import {
  type ClientApplication,
  getDashboardModel,
  getDashboardModels,
} from '@ethings-os/sdk-ui-preact';
import { Mock, Mocked } from 'vitest';

import { type DashboardModel } from '../sdk-ui-core-exports';
import { DashboardService } from './dashboard.service';
import { SisenseContextService } from './sisense-context.service';

vi.mock('../decorators/trackable.decorator', () => ({
  TrackableService: (_target: any, _key: string, descriptor: PropertyDescriptor) => descriptor,
}));

vi.mock('@ethings-os/sdk-ui-preact', () => ({
  getDashboardModel: vi.fn(),
  getDashboardModels: vi.fn(),
}));

const getDashboardModelMock = getDashboardModel as Mock<typeof getDashboardModel>;

const getDashboardModelsMock = getDashboardModels as Mock<typeof getDashboardModels>;

describe('DashboardService', () => {
  let sisenseContextService: Mocked<SisenseContextService>;

  beforeEach(() => {
    getDashboardModelMock.mockClear();
    getDashboardModelsMock.mockClear();
    sisenseContextService = {
      getApp: vi.fn().mockResolvedValue({}),
    } as unknown as Mocked<SisenseContextService>;
  });

  it('should be created', () => {
    const dashboardService = new DashboardService(sisenseContextService);
    expect(dashboardService).toBeTruthy();
  });

  describe('getDashboardModel', () => {
    it('should retrieve an existing dashboard model', async () => {
      const dashboardOid = 'dashboard-oid';
      const expectedDashboardProps = {
        oid: dashboardOid,
        title: 'test-dashboard',
        dataSource: 'test-data-source',
        widgets: [],
        layoutOptions: { widgetsPanel: { columns: [] } },
        filters: [],
        widgetsOptions: {},
        styleOptions: {},
      };

      const expectedDashboardModel = {
        ...expectedDashboardProps,
        getDashboardProps: () => expectedDashboardProps,
      } as DashboardModel;

      sisenseContextService.getApp.mockResolvedValue({ httpClient: {} } as ClientApplication);
      getDashboardModelMock.mockResolvedValue(expectedDashboardModel);

      const dashboardService = new DashboardService(sisenseContextService);
      const result = await dashboardService.getDashboardModel(dashboardOid);

      expect(result).toEqual(expectedDashboardModel);
      expect(sisenseContextService.getApp).toHaveBeenCalled();
      expect(getDashboardModelMock).toHaveBeenCalledWith({}, dashboardOid, undefined);
    });
  });

  describe('getDashboardModels', () => {
    it('should retrieve existing dashboard models', async () => {
      const expectedDashboardProps = {
        oid: 'test-dashboard-oid',
        title: 'test-dashboard',
        dataSource: 'test-data-source',
        widgets: [],
        layoutOptions: { widgetsPanel: { columns: [] } },
        filters: [],
        widgetsOptions: {},
        styleOptions: {},
      };

      const expectedDashboardModel = {
        ...expectedDashboardProps,
        getDashboardProps: () => expectedDashboardProps,
      } as DashboardModel;
      const expectedDashboardModels: DashboardModel[] = [expectedDashboardModel];

      sisenseContextService.getApp.mockResolvedValue({ httpClient: {} } as ClientApplication);
      getDashboardModelsMock.mockResolvedValue(expectedDashboardModels);

      const dashboardService = new DashboardService(sisenseContextService);
      const result = await dashboardService.getDashboardModels();

      expect(result).toEqual([expectedDashboardModel]);
      expect(sisenseContextService.getApp).toHaveBeenCalled();
      expect(getDashboardModelsMock).toHaveBeenCalledWith({}, undefined);
    });
  });
});
