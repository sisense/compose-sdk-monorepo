/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { WidgetModel } from './widget-model';
import { WidgetDto, WidgetType } from '../../dashboard-widget/types';
import { TranslatableError } from '../../translation/translatable-error';
import { sampleEcommerceDashboard as dashboardMock } from '../__mocks__/sample-ecommerce-dashboard';
import { sampleHealthcareDashboard } from '../__mocks__/sample-healthcare-dashboard';

describe('WidgetModel', () => {
  let mockWidgetDto: WidgetDto;

  beforeEach(() => {
    // Create a mock WidgetDto object with necessary properties for testing
    mockWidgetDto = dashboardMock.widgets![0];
  });

  describe('constructor', () => {
    it('should create a WidgetModel instance with valid input', () => {
      const widget = new WidgetModel(mockWidgetDto);

      expect(widget).toBeInstanceOf(WidgetModel);
      expect(widget.oid).toBe(mockWidgetDto.oid);
      expect(widget.title).toBe(mockWidgetDto.title);
      expect(widget.description).toBe(mockWidgetDto.desc || '');
      expect(widget.dataSource).toBe(
        mockWidgetDto.datasource.fullname || mockWidgetDto.datasource.title,
      );
      expect(widget.widgetType).toBe(mockWidgetDto.type);
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
        drilldownDimensions: expect.arrayContaining([]),
        drilldownSelections: expect.arrayContaining([]),
      });
    });

    it('should create plugin widget when unsupported widget type', () => {
      const unsupportedWidgetDto: WidgetDto = {
        ...mockWidgetDto,
        type: 'unsupportedType' as WidgetType,
      };

      const widgetPlugin = new WidgetModel(unsupportedWidgetDto);

      expect(widgetPlugin.widgetType).equals('plugin');
      expect(widgetPlugin.pluginType).equals(unsupportedWidgetDto.type);
      expect(widgetPlugin.pluginPanels).equals(unsupportedWidgetDto.metadata.panels);
      expect(widgetPlugin.pluginStyles).equals(unsupportedWidgetDto.style);
    });
  });

  describe('getExecuteQueryParams', () => {
    it('returns execute query parameters for chart widget', () => {
      const widget = new WidgetModel(mockWidgetDto);
      const executeQueryParams = widget.getExecuteQueryParams();

      expect(executeQueryParams).toMatchObject({
        dataSource: 'Sample ECommerce',
        dimensions: [],
        measures: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            type: 'basemeasure',
          }),
          expect.objectContaining({
            name: expect.any(String),
            type: 'calculatedmeasure',
          }),
          expect.objectContaining({
            name: expect.any(String),
            type: 'calculatedmeasure',
          }),
        ]),
      });
    });

    it('returns execute query parameters for table widget', () => {
      const tableWidgetModel = new WidgetModel(
        sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'tablewidget')!,
      );
      const executeQueryParams = tableWidgetModel.getExecuteQueryParams();

      expect(executeQueryParams).toMatchObject({
        dataSource: 'Sample Healthcare',
        dimensions: [expect.objectContaining({ name: 'DIAGNOSIS' })],
        measures: expect.arrayContaining([
          expect.objectContaining({
            name: '# PATIENTS',
            type: 'basemeasure',
          }),
          expect.objectContaining({
            name: 'AVG COST',
            type: 'basemeasure',
          }),
        ]),
        filters: [
          {
            attribute: {
              id: '[Diagnosis.Description]',
            },
            type: 'filter',
          },
        ],
      });
    });

    it('should throw an error for pivot widget', () => {
      const pivotWidgetModel = new WidgetModel(
        sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
      );

      expect(() => pivotWidgetModel.getExecuteQueryParams()).toThrow(TranslatableError);
    });
  });

  describe('getExecutePivotQueryParams', () => {
    it('returns execute query parameters for pivot widget', () => {
      const pivotWidgetModel = new WidgetModel(
        sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
      );
      const executePivotQueryParams = pivotWidgetModel.getExecutePivotQueryParams();

      console.log(executePivotQueryParams);

      expect(executePivotQueryParams).toMatchObject({
        dataSource: 'Sample Healthcare',
        rows: [{ attribute: expect.objectContaining({ name: 'DIAGNOSIS' }) }],
        values: expect.arrayContaining([
          expect.objectContaining({
            measure: expect.objectContaining({
              name: '# PATIENTS',
              type: 'basemeasure',
            }),
          }),
          expect.objectContaining({
            measure: expect.objectContaining({
              name: 'AVG COST',
              type: 'basemeasure',
            }),
          }),
          expect.objectContaining({
            measure: expect.objectContaining({
              name: 'AVG DAYS ADMITTED',
              type: 'calculatedmeasure',
            }),
          }),
        ]),
        filters: [
          {
            attribute: {
              id: '[Diagnosis.Description]',
            },
            type: 'filter',
          },
        ],
      });
    });

    it('should throw an error for non-pivot widget', () => {
      const nonPivotWidgetModel = new WidgetModel(mockWidgetDto);
      expect(() => nonPivotWidgetModel.getExecutePivotQueryParams()).toThrow(TranslatableError);
    });

    describe('getChartProps', () => {
      it('should throw an error for pivot widget', () => {
        const pivotWidgetModel = new WidgetModel(
          sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
        );

        expect(() => pivotWidgetModel.getChartProps()).toThrow(TranslatableError);
      });
      it('should return chart props for chart widgets', () => {
        const widget = new WidgetModel(mockWidgetDto);
        const chartProps = widget.getChartProps();

        expect(chartProps).toMatchObject({
          chartType: 'indicator',
          dataOptions: expect.objectContaining({
            max: expect.arrayContaining([expect.objectContaining({ column: expect.any(Object) })]),
            min: expect.arrayContaining([expect.objectContaining({ column: expect.any(Object) })]),
            value: expect.arrayContaining([
              expect.objectContaining({ column: expect.any(Object) }),
            ]),
          }),
          styleOptions: expect.objectContaining({
            skin: 1,
            subtype: 'indicator/gauge',
            indicatorComponents: expect.objectContaining({
              labels: expect.objectContaining({
                shouldBeShown: true,
              }),
              ticks: expect.objectContaining({
                shouldBeShown: true,
              }),
              title: expect.objectContaining({
                shouldBeShown: false,
                text: expect.any(String),
              }),
              secondaryTitle: expect.objectContaining({
                text: '',
              }),
            }),
          }),
          dataSet: 'Sample ECommerce',
          filters: [],
        });
      });

      it('should return chart props for table widget', () => {
        const tableWidgetDto = sampleHealthcareDashboard.widgets!.find(
          (widget) => widget.type === 'tablewidget',
        )!;
        const tableWidget = new WidgetModel(tableWidgetDto);
        const chartProps = tableWidget.getChartProps();

        expect(chartProps).toMatchSnapshot();
      });
    });

    describe('getTableProps', () => {
      it('should throw an error for non-table widgets', () => {
        const nonTableWidgetModel = new WidgetModel(mockWidgetDto);
        expect(() => nonTableWidgetModel.getTableProps()).toThrow(TranslatableError);
      });
      it('should return TableProps for table widgets', () => {
        const tableWidgetModel = new WidgetModel(
          sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'tablewidget')!,
        );
        const tableProps = tableWidgetModel.getTableProps();

        expect(tableProps).toMatchObject({
          dataOptions: expect.objectContaining({
            columns: expect.arrayContaining([
              expect.objectContaining({
                column: expect.objectContaining({
                  name: 'DIAGNOSIS',
                }),
              }),
              expect.objectContaining({
                column: expect.objectContaining({
                  name: '# PATIENTS',
                }),
              }),
              expect.objectContaining({
                column: expect.objectContaining({
                  name: 'AVG COST',
                }),
              }),
            ]),
          }),
          styleOptions: expect.objectContaining({
            columns: { alternatingColor: { enabled: expect.any(Boolean) } },
            rows: { alternatingColor: { enabled: expect.any(Boolean) } },
            header: { color: { enabled: expect.any(Boolean) } },
          }),
          dataSet: 'Sample Healthcare',
          filters: [
            {
              attribute: {
                id: '[Diagnosis.Description]',
              },
            },
          ],
        });
      });
    });

    describe('getPivotTableProps', () => {
      it('should throw an error for non-pivot widgets', () => {
        const nonPivotWidgetModel = new WidgetModel(mockWidgetDto);
        expect(() => nonPivotWidgetModel.getPivotTableProps()).toThrow(TranslatableError);
      });
      it('should return PivotTableProps for pivot widgets', () => {
        const pivotWidgetModel = new WidgetModel(
          sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
        );
        const pivotProps = pivotWidgetModel.getPivotTableProps();

        expect(pivotProps).toMatchObject({
          dataOptions: expect.objectContaining({
            rows: [
              expect.objectContaining({ column: expect.objectContaining({ name: 'DIAGNOSIS' }) }),
            ],
            values: expect.arrayContaining([
              expect.objectContaining({
                column: expect.objectContaining({
                  name: '# PATIENTS',
                }),
              }),
              expect.objectContaining({
                column: expect.objectContaining({
                  name: 'AVG COST',
                }),
              }),
              expect.objectContaining({
                column: expect.objectContaining({
                  name: 'AVG DAYS ADMITTED',
                }),
              }),
            ]),
          }),
          styleOptions: expect.objectContaining({
            alternatingColumnsColor: expect.any(Boolean),
            alternatingRowsColor: expect.any(Boolean),
            headersColor: expect.any(Boolean),
          }),
          dataSet: 'Sample Healthcare',
          filters: [
            {
              attribute: {
                id: '[Diagnosis.Description]',
              },
              type: 'filter',
            },
          ],
        });
      });
    });

    describe('getChartWidgetProps', () => {
      it('should return chart widget props correctly', () => {
        const widget = new WidgetModel(mockWidgetDto);
        const chartWidgetProps = widget.getChartWidgetProps();

        expect(chartWidgetProps).toMatchObject({
          // validate matching only basic shape of the object
          chartType: 'indicator',
          dataOptions: expect.objectContaining({
            value: expect.arrayContaining([
              expect.objectContaining({
                column: expect.objectContaining({
                  name: '# of unique Brand ID',
                  type: 'basemeasure',
                }),
              }),
            ]),
            secondary: [],
            min: expect.arrayContaining([
              expect.objectContaining({
                column: expect.objectContaining({
                  type: 'calculatedmeasure',
                }),
              }),
            ]),
            max: expect.arrayContaining([
              expect.objectContaining({
                column: expect.objectContaining({
                  type: 'calculatedmeasure',
                }),
              }),
            ]),
          }),
          styleOptions: expect.objectContaining({
            subtype: 'indicator/gauge',
            skin: 1,
            indicatorComponents: expect.any(Object),
          }),
          dataSource: 'Sample ECommerce',
          filters: [],
          title: 'TOTAL BRANDS',
          description: '',
          drilldownOptions: {
            drilldownDimensions: [],
            drilldownSelections: [],
          },
        });
      });

      it('should throw an error for non-chart widgets', () => {
        const tableWidgetModel = new WidgetModel(
          sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
        );

        expect(() => {
          tableWidgetModel.getChartWidgetProps();
        }).toThrow(TranslatableError);
      });
    });
  });

  describe('getTableWidgetProps', () => {
    it('should return table widget props correctly for table widget', () => {
      const tableWidgetModel = new WidgetModel(
        sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'tablewidget')!,
      );
      const tableWidgetProps = tableWidgetModel.getTableWidgetProps();

      expect(tableWidgetProps).toMatchObject({
        dataOptions: expect.objectContaining({
          columns: expect.arrayContaining([
            expect.objectContaining({
              column: expect.objectContaining({
                name: 'DIAGNOSIS',
              }),
            }),
            expect.objectContaining({
              column: expect.objectContaining({
                name: '# PATIENTS',
              }),
            }),
            expect.objectContaining({
              column: expect.objectContaining({
                name: 'AVG COST',
              }),
            }),
          ]),
        }),
        styleOptions: expect.objectContaining({
          columns: { alternatingColor: { enabled: expect.any(Boolean) } },
          rows: { alternatingColor: { enabled: expect.any(Boolean) } },
          header: { color: { enabled: expect.any(Boolean) } },
        }),
        dataSource: 'Sample Healthcare',
        filters: [
          {
            attribute: {
              id: '[Diagnosis.Description]',
            },
            type: 'filter',
          },
        ],
        title: 'TOP 10 DIAGNOSIS (table widget)',
        description: '',
      });
    });
    it('should throw an error for non-table widgets', () => {
      const nonTableWidgetModel = new WidgetModel(mockWidgetDto);
      expect(() => nonTableWidgetModel.getTableWidgetProps()).toThrow(TranslatableError);
    });
  });

  describe('getPivotTableWidgetProps', () => {
    it('should throw an error for non-pivot widgets', () => {
      const nonPivotWidgetModel = new WidgetModel(mockWidgetDto);
      expect(() => nonPivotWidgetModel.getPivotTableWidgetProps()).toThrow(TranslatableError);
    });
    it('should return PivotTableWidgetProps for pivot widgets', () => {
      const pivotWidgetModel = new WidgetModel(
        sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
      );
      const pivotProps = pivotWidgetModel.getPivotTableWidgetProps();

      expect(pivotProps).toMatchObject({
        dataOptions: expect.objectContaining({
          rows: [
            expect.objectContaining({ column: expect.objectContaining({ name: 'DIAGNOSIS' }) }),
          ],
          values: expect.arrayContaining([
            expect.objectContaining({
              column: expect.objectContaining({
                name: '# PATIENTS',
              }),
            }),
            expect.objectContaining({
              column: expect.objectContaining({
                name: 'AVG COST',
              }),
            }),
            expect.objectContaining({
              column: expect.objectContaining({
                name: 'AVG DAYS ADMITTED',
              }),
            }),
          ]),
        }),
        styleOptions: expect.objectContaining({
          alternatingColumnsColor: expect.any(Boolean),
          alternatingRowsColor: expect.any(Boolean),
          headersColor: expect.any(Boolean),
        }),
        dataSource: 'Sample Healthcare',
        filters: [
          {
            attribute: {
              id: '[Diagnosis.Description]',
            },
            type: 'filter',
          },
        ],
        title: 'TOP 10 DIAGNOSIS',
        description: '',
      });
    });
  });
});
