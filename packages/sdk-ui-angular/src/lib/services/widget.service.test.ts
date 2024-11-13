/* eslint-disable @typescript-eslint/unbound-method */
/** @vitest-environment jsdom */

import { type ClientApplication, getWidgetModel } from '@sisense/sdk-ui-preact';
import { type WidgetModel } from '../sdk-ui-core-exports';
import { Mock, Mocked } from 'vitest';
import { WidgetService } from './widget.service';
import { SisenseContextService } from './sisense-context.service';

vi.mock('@sisense/sdk-ui-preact', () => ({
  getWidgetModel: vi.fn(),
}));

const getWidgetModelMock = getWidgetModel as Mock<typeof getWidgetModel>;

describe('WidgetService', () => {
  let sisenseContextService: Mocked<SisenseContextService>;

  beforeEach(() => {
    getWidgetModelMock.mockClear();
    sisenseContextService = {
      getApp: vi.fn().mockResolvedValue({}),
    } as unknown as Mocked<SisenseContextService>;
  });

  it('should be created', () => {
    const widgetService = new WidgetService(sisenseContextService);
    expect(widgetService).toBeTruthy();
  });

  describe('getWidgetModel', () => {
    it('should retrieve an existing widget model', async () => {
      const dashboardOid = 'dashboard-oid';
      const widgetOid = 'widget-oid';
      const expectedWidgetModel = {
        oid: widgetOid,
        title: 'test-widget',
      } as WidgetModel;

      sisenseContextService.getApp.mockResolvedValue({ httpClient: {} } as ClientApplication);
      getWidgetModelMock.mockResolvedValue(expectedWidgetModel);

      const widgetService = new WidgetService(sisenseContextService);
      const result = await widgetService.getWidgetModel({ dashboardOid, widgetOid });

      expect(result).toEqual(expectedWidgetModel);
      expect(sisenseContextService.getApp).toHaveBeenCalled();
      expect(getWidgetModelMock).toHaveBeenCalledWith({}, dashboardOid, widgetOid);
    });
  });
});
