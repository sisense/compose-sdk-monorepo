/* eslint-disable @typescript-eslint/unbound-method */

/** @vitest-environment jsdom */
import {
  type AppSettings,
  type ClientApplication,
  type CompleteThemeSettings,
  getDashboardModel,
  getDashboardModels,
} from '@sisense/sdk-ui-preact';
import { BehaviorSubject } from 'rxjs';
import { Mock, Mocked } from 'vitest';

import { type DashboardModel } from '../sdk-ui-core-exports';
import { DashboardService } from './dashboard.service';
import { SisenseContextService } from './sisense-context.service';
import { ThemeService } from './theme.service';

vi.mock('../decorators/trackable.decorator', () => ({
  TrackableService: (_target: any, _key: string, descriptor: PropertyDescriptor) => descriptor,
}));

vi.mock('@sisense/sdk-ui-preact', () => ({
  getDashboardModel: vi.fn(),
  getDashboardModels: vi.fn(),
}));

const getDashboardModelMock = getDashboardModel as Mock<typeof getDashboardModel>;

const getDashboardModelsMock = getDashboardModels as Mock<typeof getDashboardModels>;

const mockThemeSettings = { palette: { variantColors: ['#FF0000'] } } as CompleteThemeSettings;
const mockAppSettings = { serverThemeSettings: {} } as AppSettings;

describe('DashboardService', () => {
  let sisenseContextService: Mocked<SisenseContextService>;
  let themeService: Pick<ThemeService, 'themeSettings$'>;

  beforeEach(() => {
    getDashboardModelMock.mockClear();
    getDashboardModelsMock.mockClear();
    sisenseContextService = {
      getApp: vi.fn().mockResolvedValue({}),
    } as unknown as Mocked<SisenseContextService>;
    themeService = {
      themeSettings$: new BehaviorSubject(mockThemeSettings),
      getThemeSettings: vi.fn().mockReturnValue(mockThemeSettings),
    } as unknown as Pick<ThemeService, 'themeSettings$'>;
  });

  it('should be created', () => {
    const dashboardService = new DashboardService(
      sisenseContextService,
      themeService as ThemeService,
    );
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
        config: {},
      };

      const expectedDashboardModel = {
        ...expectedDashboardProps,
        getDashboardProps: () => expectedDashboardProps,
      } as DashboardModel;

      sisenseContextService.getApp.mockResolvedValue({
        httpClient: {},
        settings: mockAppSettings,
      } as ClientApplication);
      getDashboardModelMock.mockResolvedValue(expectedDashboardModel);

      const dashboardService = new DashboardService(
        sisenseContextService,
        themeService as ThemeService,
      );
      const result = await dashboardService.getDashboardModel(dashboardOid, {
        includeWidgets: true,
      });

      expect(result).toEqual(expectedDashboardModel);
      expect(sisenseContextService.getApp).toHaveBeenCalled();
      expect(getDashboardModelMock).toHaveBeenCalledWith(
        {},
        dashboardOid,
        { includeWidgets: true },
        mockThemeSettings,
        mockAppSettings,
      );
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
        config: {},
      };

      const expectedDashboardModel = {
        ...expectedDashboardProps,
        getDashboardProps: () => expectedDashboardProps,
      } as DashboardModel;
      const expectedDashboardModels: DashboardModel[] = [expectedDashboardModel];

      sisenseContextService.getApp.mockResolvedValue({
        httpClient: {},
        settings: mockAppSettings,
      } as ClientApplication);
      getDashboardModelsMock.mockResolvedValue(expectedDashboardModels);

      const dashboardService = new DashboardService(
        sisenseContextService,
        themeService as ThemeService,
      );
      const result = await dashboardService.getDashboardModels({
        includeWidgets: true,
        searchByTitle: 'Sales',
      });

      expect(result).toEqual([expectedDashboardModel]);
      expect(sisenseContextService.getApp).toHaveBeenCalled();
      expect(getDashboardModelsMock).toHaveBeenCalledWith(
        {},
        { includeWidgets: true, searchByTitle: 'Sales' },
        mockThemeSettings,
        mockAppSettings,
      );
    });
  });
});
