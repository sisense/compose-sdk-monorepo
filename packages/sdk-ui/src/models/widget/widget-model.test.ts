/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getWidgetType } from '@/widget-by-id/utils';

import { widgetModelTranslator } from '.';
import { FusionWidgetType, WidgetDto } from '../../widget-by-id/types';
import { sampleEcommerceDashboard as dashboardMock } from '../__mocks__/sample-ecommerce-dashboard';

describe('WidgetModel', () => {
  let mockWidgetDto: WidgetDto;

  beforeEach(() => {
    // Create a mock WidgetDto object with necessary properties for testing
    mockWidgetDto = dashboardMock.widgets![0];
  });

  describe('constructor', () => {
    it('should create a WidgetModel instance with valid input', () => {
      const widget = widgetModelTranslator.fromWidgetDto(mockWidgetDto);

      expect(widget.oid).toBe(mockWidgetDto.oid);
      expect(widget.title).toBe(mockWidgetDto.title);
      expect(widget.description).toBe(mockWidgetDto.desc || '');
      expect(widget.dataSource).toStrictEqual({
        address: 'LocalHost',
        id: mockWidgetDto.datasource.id,
        title: mockWidgetDto.datasource.fullname || mockWidgetDto.datasource.title,
        type: 'elasticube',
      });
      expect(widget.widgetType).toBe(getWidgetType(mockWidgetDto.type));
      expect(widget.dataOptions).toMatchObject({
        max: expect.arrayContaining([expect.objectContaining({ column: expect.any(Object) })]),
        min: expect.arrayContaining([expect.objectContaining({ column: expect.any(Object) })]),
        value: expect.arrayContaining([expect.objectContaining({ column: expect.any(Object) })]),
      });
      expect(widget.styleOptions).toMatchObject({
        subtype: 'indicator/gauge',
        skin: 1,
        indicatorComponents: {
          labels: { shouldBeShown: true },
          ticks: { shouldBeShown: true },
          title: { shouldBeShown: false, text: expect.any(String) },
          secondaryTitle: { text: '' },
        },
      });
      expect(widget.filters).toHaveLength(0);
      expect(widget.drilldownOptions).toMatchObject({
        drilldownPaths: expect.arrayContaining([]),
        drilldownSelections: expect.arrayContaining([]),
      });
    });

    it('should create custom widget when unsupported widget type', () => {
      const unsupportedWidgetDto: WidgetDto = {
        ...mockWidgetDto,
        type: 'unsupportedType' as FusionWidgetType,
      };

      const widgetCustom = widgetModelTranslator.fromWidgetDto(unsupportedWidgetDto);

      expect(widgetCustom.widgetType).equals('custom');
      expect(widgetCustom.customWidgetType).equals(unsupportedWidgetDto.type);
      expect(widgetCustom.dataOptions).toBeDefined();
      expect(widgetCustom.styleOptions).toMatchObject(unsupportedWidgetDto.style);
    });
  });
});
