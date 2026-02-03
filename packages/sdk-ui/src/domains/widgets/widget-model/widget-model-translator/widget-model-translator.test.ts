import cloneDeep from 'lodash-es/cloneDeep';

import { advancedLineChartWidgetDto } from '@/domains/dashboarding/dashboard-model/__mocks__/advanced-line-chart-widget.js';
import { sampleEcommerceDashboard as dashboardMock } from '@/domains/dashboarding/dashboard-model/__mocks__/sample-ecommerce-dashboard.js';
import { TabberWidgetDtoStyle } from '@/domains/widgets/components/widget-by-id/types';
import { WidgetDto } from '@/index';
import { AppSettings } from '@/infra/app/settings/settings';
import { CompleteThemeSettings } from '@/types';

import {
  fromChartWidgetProps,
  fromWidgetDto,
  toChartWidgetProps,
  toCustomWidgetProps,
  toWidgetDto,
} from './widget-model-translator.js';

describe('WidgetModelTranslator', () => {
  const mockIndicatorWidgetDto = dashboardMock.widgets![0];
  const mockLineWidgetDto = dashboardMock.widgets![7];
  const mockTableWidgetDto = dashboardMock.widgets![9];
  const mockPieWidgetDto = dashboardMock.widgets![2];
  const mockScatterWidgetDto = dashboardMock.widgets![6];
  const mockPolarFilteredWidgetDto = dashboardMock.widgets![10];
  const mockTreemapWidgetDto = dashboardMock.widgets![11];

  let resWidgetDto: WidgetDto;

  const getWidgetTransformChain = (widgetDto: WidgetDto) => {
    const widget = fromWidgetDto(widgetDto);
    const chartProps = toChartWidgetProps(widget);
    const widgetFromChart = fromChartWidgetProps(chartProps);
    return { widget, chartProps, widgetFromChart };
  };

  describe('fromChartWidgetProps + toWidgetDto', () => {
    it('should create a valid WidgetDto for the "line"(carthesian) chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockLineWidgetDto);
      expect(widgetFromChart.chartType).toBe('line');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.type).toBe(mockLineWidgetDto.type);
      expect(resWidgetDto.metadata.panels[0].name).toBe('x-axis');
      expect(resWidgetDto.metadata.panels[1].name).toBe('values');
    });

    it('should create a valid WidgetDto for the "line" chart with advanced analytics', () => {
      const { widgetFromChart } = getWidgetTransformChain(advancedLineChartWidgetDto);
      expect(widgetFromChart.chartType).toBe('line');

      resWidgetDto = toWidgetDto(widgetFromChart);

      expect(resWidgetDto.type).toBe(advancedLineChartWidgetDto.type);
      // values

      resWidgetDto.metadata.panels[1].items.forEach((actualItem, index) => {
        const expectedItem = advancedLineChartWidgetDto.metadata.panels[1].items[index];
        expect(actualItem.panel).toBe(expectedItem.panel);
        expect(actualItem.y2).toBe(expectedItem.y2);
        expect(actualItem.statisticalModels).toStrictEqual(expectedItem.statisticalModels);
        expect(actualItem.format?.color).toStrictEqual(expectedItem.format?.color);
      });
    });

    it('should create a valid WidgetDto for the "table" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockTableWidgetDto);
      expect(widgetFromChart.chartType).toBe('table');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect(resWidgetDto.type).toBe('tablewidget');
    });

    it('should create a valid WidgetDto for the "indicator" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockIndicatorWidgetDto);
      expect(widgetFromChart.chartType).toBe('indicator');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect(resWidgetDto.subtype).toBe('indicator/gauge');
      expect((resWidgetDto.style as any).skin).toBe('1');
      expect(resWidgetDto.type).toBe(mockIndicatorWidgetDto.type);
    });

    it('should create a valid WidgetDto for the "pie"(categorical) chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockPieWidgetDto);
      expect(widgetFromChart.chartType).toBe('pie');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect((resWidgetDto.style as any).convolution.minimalIndependentSlicePercentage).toBe(3);
      expect(resWidgetDto.type).toBe(mockPieWidgetDto.type);
    });

    it('should create a valid WidgetDto for the "scatter" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockScatterWidgetDto);
      expect(widgetFromChart.chartType).toBe('scatter');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'y-axis').length).toBe(1);
      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'x-axis').length).toBe(1);
      expect(resWidgetDto.type).toBe(mockScatterWidgetDto.type);
    });

    it('should create a valid WidgetDto for the "polar" chart with Filters', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockPolarFilteredWidgetDto);
      expect(widgetFromChart.chartType).toBe('polar');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      const filterPanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters');
      expect(filterPanel.length).toBe(1);
      expect((filterPanel[0].items[0].jaql as any).dim).toBe('[Country.Country]');
      expect((filterPanel[0].items[0].jaql as any).filter.members).toEqual(
        expect.arrayContaining(['France', 'Israel', 'Ukraine']),
      );

      expect(resWidgetDto.type).toBe(mockPolarFilteredWidgetDto.type);
    });

    it('should create a valid WidgetDto for the "treemap" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockTreemapWidgetDto);
      expect(widgetFromChart.chartType).toBe('treemap');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      const filterPanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters');
      expect(filterPanel.length).toBe(1);
      const valuesPanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'values');
      expect(valuesPanel.length).toBe(1);
      expect(valuesPanel[0].items.length).toBe(0);
      const sizePanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'size');
      expect(sizePanel.length).toBe(1);
      expect(sizePanel[0].items.length).toBe(1);
      const colorPanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'color');
      expect(colorPanel.length).toBe(1);

      expect(resWidgetDto.type).toBe(mockTreemapWidgetDto.type);
      expect(resWidgetDto.subtype).toBe(mockTreemapWidgetDto.type);
    });

    it('should throw an error for a non-supported chart', () => {
      expect(() => {
        const pivotMock = cloneDeep(mockTableWidgetDto);
        pivotMock.type = 'pivot2';
        getWidgetTransformChain(pivotMock);
      }).toThrow();
    });
  });

  describe('fromWidgetDto', () => {
    describe('Unknown Custom Widgets', () => {
      it('should handle unknown custom widgets', () => {
        const customStyle = {
          customProperty: 'customValue',
          anotherProperty: 123,
        };

        const customWidgetDto = {
          oid: 'custom-widget-1',
          type: 'MyCustomWidget',
          subtype: 'MyCustomWidget',
          title: 'Custom Widget',
          desc: 'Test custom widget',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: customStyle,
          metadata: {
            panels: [
              {
                name: 'values',
                items: [
                  {
                    jaql: {
                      title: 'Total Revenue',
                      dim: '[Commerce.Revenue]',
                      agg: 'sum',
                      datatype: 'numeric',
                      table: 'Commerce',
                      column: 'Revenue',
                    },
                    format: {
                      mask: {
                        type: 'number',
                        abbreviations: {
                          t: true,
                          b: true,
                          m: true,
                          k: true,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        } as unknown as WidgetDto;

        const widgetModel = fromWidgetDto(customWidgetDto);

        expect(widgetModel.widgetType).toBe('custom');
        expect(widgetModel.customWidgetType).toBe('MyCustomWidget');
        expect(widgetModel.oid).toBe('custom-widget-1');
        expect(widgetModel.title).toBe('Custom Widget');
        expect(widgetModel.description).toBe('Test custom widget');

        // Verify style options are copied as-is
        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.customProperty).toBe('customValue');
        expect(styleOptions.anotherProperty).toBe(123);

        // Verify data options are created from panels
        expect(widgetModel.dataOptions).toBeDefined();
      });

      it('should apply widget design to unknown custom widgets', () => {
        const customStyle = {
          customProperty: 'value',
          widgetDesign: {
            widgetBackgroundColor: '#00FF00',
            widgetSpacing: 'medium',
            widgetCornerRadius: 'medium',
            widgetShadow: 'medium',
          },
        };

        const customWidgetDto = {
          oid: 'custom-widget-2',
          type: 'MyCustomWidget',
          subtype: 'MyCustomWidget',
          title: 'Custom Widget with Design',
          desc: '',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: customStyle,
          metadata: {
            panels: [],
          },
        } as unknown as WidgetDto;

        const widgetModel = fromWidgetDto(customWidgetDto);

        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.customProperty).toBe('value');
        // Widget design should be flattened into style options for unknown custom widgets
        expect(styleOptions.backgroundColor).toBe('#00FF00');
      });
    });

    describe('Standard Widgets', () => {
      it('should handle standard chart widget (line chart)', () => {
        const lineChartDto = cloneDeep(mockLineWidgetDto);
        const widgetModel = fromWidgetDto(lineChartDto);

        expect(widgetModel.widgetType).toBe('chart');
        expect(widgetModel.chartType).toBe('line');
        expect(widgetModel.customWidgetType).toBe('');
        expect(widgetModel.oid).toBe(lineChartDto.oid);
        expect(widgetModel.dataOptions).toBeDefined();
        expect(widgetModel.styleOptions).toBeDefined();
      });

      it('should handle indicator widget', () => {
        const indicatorDto = cloneDeep(mockIndicatorWidgetDto);
        const widgetModel = fromWidgetDto(indicatorDto);

        expect(widgetModel.widgetType).toBe('chart');
        expect(widgetModel.chartType).toBe('indicator');
        expect(widgetModel.customWidgetType).toBe('');
        expect(widgetModel.dataOptions).toBeDefined();
        expect(widgetModel.styleOptions).toBeDefined();
      });

      it('should apply widget design to standard widgets when enabled', () => {
        const lineChartDto = cloneDeep(mockLineWidgetDto);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (lineChartDto.style as any).widgetDesign = {
          widgetBackgroundColor: '#0000FF',
          widgetSpacing: 'small',
          widgetCornerRadius: 'small',
          widgetShadow: 'dark',
        };

        const appSettings = {
          serverFeatures: {
            widgetDesignStyle: {
              key: 'widgetDesignStyle',
              active: true,
            },
          },
        } as AppSettings;

        const widgetModel = fromWidgetDto(lineChartDto, undefined, appSettings);

        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.backgroundColor).toBe('#0000FF');
        expect(styleOptions.spaceAround).toBeDefined();
        expect(styleOptions.cornerRadius).toBeDefined();
        expect(styleOptions.shadow).toBeDefined();
      });

      it('should not apply widget design when feature flag is disabled', () => {
        const lineChartDto = cloneDeep(mockLineWidgetDto);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (lineChartDto.style as any).widgetDesign = {
          widgetBackgroundColor: '#0000FF',
          widgetSpacing: 'small',
          widgetCornerRadius: 'small',
          widgetShadow: 'dark',
        };

        const appSettings = {
          serverFeatures: {
            widgetDesignStyle: {
              key: 'widgetDesignStyle',
              active: false,
            },
          },
        } as AppSettings;

        const widgetModel = fromWidgetDto(lineChartDto, undefined, appSettings);

        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.backgroundColor).toBeUndefined();
      });
    });

    describe('Theme Settings', () => {
      it('should apply theme settings to standard widgets', () => {
        const lineChartDto = cloneDeep(mockLineWidgetDto);

        const themeSettings: Partial<CompleteThemeSettings> = {
          palette: {
            variantColors: ['#FF0000', '#00FF00', '#0000FF'],
          },
        };

        const widgetModel = fromWidgetDto(
          lineChartDto,
          themeSettings as unknown as CompleteThemeSettings,
        );

        expect(widgetModel.dataOptions).toBeDefined();
        expect(widgetModel.styleOptions).toBeDefined();
      });
    });

    describe('Plugin Widgets (WidgetsTabber)', () => {
      it('should transform WidgetsTabber to tabber-buttons widget with full integration', () => {
        const tabberStyle: TabberWidgetDtoStyle = {
          activeTab: '1',
          showTitle: false,
          showSeparators: true,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          tabsSize: 'MEDIUM',
          tabsInterval: 'MEDIUM',
          tabsAlignment: 'CENTER',
          selectedColor: '#94F5F0',
          selectedBkgColor: '#ffffff',
          unselectedColor: '#666666',
          unselectedBkgColor: '#ffffff',
          descriptionColor: '#666666',
          tabCornerRadius: 'NONE',
          showDescription: false,
          tabs: [
            {
              title: 'TAB 1',
              displayWidgetIds: ['widget1'],
              hideWidgetIds: ['widget2'],
            },
            {
              title: 'TAB 2',
              displayWidgetIds: ['widget2'],
              hideWidgetIds: ['widget1'],
            },
          ],
        };

        const tabberWidgetDto: WidgetDto = {
          oid: 'tabber-widget-1',
          type: 'WidgetsTabber',
          subtype: 'WidgetsTabber',
          title: 'Tabber Widget',
          desc: 'Test tabber widget',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: tabberStyle,
          metadata: {
            panels: [],
          },
        };

        // Test fromWidgetDto transformation
        const widgetModel = fromWidgetDto(tabberWidgetDto);

        expect(widgetModel.widgetType).toBe('custom');
        expect(widgetModel.customWidgetType).toBe('tabber-buttons');
        expect(widgetModel.oid).toBe('tabber-widget-1');
        expect(widgetModel.title).toBe('Tabber Widget');
        expect(widgetModel.description).toBe('Test tabber widget');

        // Verify customOptions transformation
        const customOptions = widgetModel.customOptions;
        expect(customOptions).toBeDefined();
        expect(customOptions!.tabNames).toEqual(['TAB 1', 'TAB 2']);
        expect(customOptions!.activeTab).toBe(1);

        // Verify style options are normalized and cleaned
        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.tabs).toBeUndefined();
        expect(styleOptions.activeTab).toBeUndefined();
        expect(styleOptions.showSeparators).toBe(true);
        expect(styleOptions.tabsSize).toBe('medium');
        expect(styleOptions.selectedColor).toBe('#94F5F0');

        // Test toCustomWidgetProps transformation
        const customWidgetProps = toCustomWidgetProps(widgetModel) as any;
        expect(customWidgetProps.customOptions).toBeDefined();
        expect(customWidgetProps.customOptions.tabNames).toEqual(['TAB 1', 'TAB 2']);
        expect(customWidgetProps.customOptions.activeTab).toBe(1);
        expect(customWidgetProps.styleOptions.tabsConfig).toBeUndefined();
      });

      it('should apply widget design to WidgetsTabber when feature is enabled', () => {
        const tabberStyle: TabberWidgetDtoStyle & { widgetDesign: any } = {
          activeTab: '0',
          showTitle: false,
          showSeparators: true,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          tabsSize: 'MEDIUM',
          tabsInterval: 'MEDIUM',
          tabsAlignment: 'CENTER',
          selectedColor: '#000000',
          selectedBkgColor: '#ffffff',
          unselectedColor: '#666666',
          unselectedBkgColor: '#ffffff',
          descriptionColor: '#666666',
          tabCornerRadius: 'NONE',
          showDescription: false,
          tabs: [
            {
              title: 'TAB 1',
              displayWidgetIds: ['widget1'],
              hideWidgetIds: [],
            },
          ],
          widgetDesign: {
            widgetBackgroundColor: '#FF0000',
            widgetSpacing: 'large',
            widgetCornerRadius: 'large',
            widgetShadow: 'light',
            widgetBorderEnabled: false,
            widgetBorderColor: '#000000',
            widgetTitleColor: '#000000',
            widgetTitleAlignment: 'left',
            widgetTitleDividerEnabled: false,
            widgetTitleDividerColor: '#000000',
            widgetTitleBackgroundColor: '#FFFFFF',
          },
        };

        const tabberWidgetDto: WidgetDto = {
          oid: 'tabber-widget-2',
          type: 'WidgetsTabber',
          subtype: 'WidgetsTabber',
          title: 'Tabber Widget with Design',
          desc: '',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: tabberStyle,
          metadata: {
            panels: [],
          },
        };

        const appSettings = {
          serverFeatures: {
            widgetDesignStyle: {
              key: 'widgetDesignStyle',
              active: true,
            },
          },
        } as AppSettings;

        const widgetModel = fromWidgetDto(tabberWidgetDto, undefined, appSettings);

        // Verify customOptions are present
        expect(widgetModel.customOptions).toBeDefined();

        // Verify widget design is applied to style options
        const styleOptions = widgetModel.styleOptions;
        expect(styleOptions.backgroundColor).toBe('#FF0000');
        expect(styleOptions.spaceAround).toBe('Large');
        expect(styleOptions.cornerRadius).toBe('Large');
        expect(styleOptions.shadow).toBe('Light');
        expect(styleOptions.header).toBeDefined();
        expect(styleOptions.header!.titleTextColor).toBe('#000000');
      });
    });

    describe('Edge Cases', () => {
      it('should handle widget without description', () => {
        const widgetDto = cloneDeep(mockLineWidgetDto);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (widgetDto as any).desc = undefined;

        const widgetModel = fromWidgetDto(widgetDto);

        expect(widgetModel.description).toBe('');
      });

      it('should handle standard widget with empty panels', () => {
        const emptyPanelDto: WidgetDto = {
          oid: 'empty-widget',
          type: 'chart/line',
          subtype: 'line',
          title: 'Empty Line Chart',
          desc: '',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: {},
          metadata: {
            panels: [],
          },
        };

        const widgetModel = fromWidgetDto(emptyPanelDto);

        expect(widgetModel.widgetType).toBe('chart');
        expect(widgetModel.dataOptions).toBeDefined();
        expect(widgetModel.filters).toEqual([]);
      });
    });
  });
});
