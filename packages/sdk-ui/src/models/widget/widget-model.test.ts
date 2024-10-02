/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { widgetModelTranslator } from '.';
import { WidgetDto, WidgetType } from '../../dashboard-widget/types';
import { TranslatableError } from '../../translation/translatable-error';
import { sampleEcommerceDashboard as dashboardMock } from '../__mocks__/sample-ecommerce-dashboard';
import { sampleHealthcareDashboard } from '../__mocks__/sample-healthcare-dashboard';
import { dashboardWithTextWidget } from '../__mocks__/dashboard-with-text-widget';

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
        title: mockWidgetDto.datasource.fullname || mockWidgetDto.datasource.title,
        type: 'elasticube',
      });
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
        drilldownPaths: expect.arrayContaining([]),
        drilldownSelections: expect.arrayContaining([]),
      });
    });

    it('should create plugin widget when unsupported widget type', () => {
      const unsupportedWidgetDto: WidgetDto = {
        ...mockWidgetDto,
        type: 'unsupportedType' as WidgetType,
      };

      const widgetPlugin = widgetModelTranslator.fromWidgetDto(unsupportedWidgetDto);

      expect(widgetPlugin.widgetType).equals('plugin');
      expect(widgetPlugin.pluginType).equals(unsupportedWidgetDto.type);
      expect(widgetPlugin.dataOptions).toBeDefined();
      expect(widgetPlugin.styleOptions).equals(unsupportedWidgetDto.style);
    });
  });

  describe('getExecuteQueryParams', () => {
    it('returns execute query parameters for chart widget', () => {
      const widget = widgetModelTranslator.fromWidgetDto(mockWidgetDto);
      const executeQueryParams = widget.getExecuteQueryParams();

      expect(executeQueryParams).toMatchObject({
        dataSource: { title: 'Sample ECommerce', type: 'elasticube' },
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
      const tableWidgetModel = widgetModelTranslator.fromWidgetDto(
        sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'tablewidget')!,
      );
      const executeQueryParams = tableWidgetModel.getExecuteQueryParams();

      expect(executeQueryParams).toMatchObject({
        dataSource: { title: 'Sample Healthcare', type: 'elasticube' },
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
      const pivotWidgetModel = widgetModelTranslator.fromWidgetDto(
        sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
      );

      expect(() => pivotWidgetModel.getExecuteQueryParams()).toThrow(TranslatableError);
    });
  });

  describe('getExecutePivotQueryParams', () => {
    it('returns execute query parameters for pivot widget', () => {
      const pivotWidgetModel = widgetModelTranslator.fromWidgetDto(
        sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
      );
      const executePivotQueryParams = pivotWidgetModel.getExecutePivotQueryParams();

      expect(executePivotQueryParams).toMatchObject({
        dataSource: { title: 'Sample Healthcare', type: 'elasticube' },
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
      const nonPivotWidgetModel = widgetModelTranslator.fromWidgetDto(mockWidgetDto);
      expect(() => nonPivotWidgetModel.getExecutePivotQueryParams()).toThrow(TranslatableError);
    });

    describe('getChartProps', () => {
      it('should throw an error for pivot widget', () => {
        const pivotWidgetModel = widgetModelTranslator.fromWidgetDto(
          sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
        );
        expect(() => pivotWidgetModel.getChartProps()).toThrow(TranslatableError);
      });
      it('should throw an error for text widget', () => {
        const textWidgetModel = widgetModelTranslator.fromWidgetDto(
          dashboardWithTextWidget.widgets!.find((widget) => widget.type === 'richtexteditor')!,
        );
        expect(() => textWidgetModel.getChartProps()).toThrow(TranslatableError);
      });
      it('should return chart props for chart widgets', () => {
        const widget = widgetModelTranslator.fromWidgetDto(mockWidgetDto);
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
          dataSet: { title: 'Sample ECommerce', type: 'elasticube' },
          filters: [],
        });
      });

      it('should return chart props for table widget', () => {
        const tableWidgetDto = sampleHealthcareDashboard.widgets!.find(
          (widget) => widget.type === 'tablewidget',
        )!;
        const tableWidget = widgetModelTranslator.fromWidgetDto(tableWidgetDto);
        const chartProps = tableWidget.getChartProps();

        expect(chartProps).toMatchSnapshot();
      });
    });

    describe('getTableProps', () => {
      it('should throw an error for non-table widgets', () => {
        const nonTableWidgetModel = widgetModelTranslator.fromWidgetDto(mockWidgetDto);
        expect(() => nonTableWidgetModel.getTableProps()).toThrow(TranslatableError);
      });
      it('should return TableProps for table widgets', () => {
        const tableWidgetModel = widgetModelTranslator.fromWidgetDto(
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
          dataSet: { title: 'Sample Healthcare', type: 'elasticube' },
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
        const nonPivotWidgetModel = widgetModelTranslator.fromWidgetDto(mockWidgetDto);
        expect(() => nonPivotWidgetModel.getPivotTableProps()).toThrow(TranslatableError);
      });
      it('should return PivotTableProps for pivot widgets', () => {
        const pivotWidgetModel = widgetModelTranslator.fromWidgetDto(
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
          dataSet: { title: 'Sample Healthcare', type: 'elasticube' },
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
        const widget = widgetModelTranslator.fromWidgetDto(mockWidgetDto);
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
          dataSource: { title: 'Sample ECommerce', type: 'elasticube' },
          filters: [],
          title: 'TOTAL BRANDS',
          description: '',
          drilldownOptions: {
            drilldownPaths: [],
            drilldownSelections: [],
          },
        });
      });

      it('should throw an error for non-chart widgets', () => {
        const tableWidgetModel = widgetModelTranslator.fromWidgetDto(
          sampleHealthcareDashboard.widgets!.find((widget) => widget.type === 'pivot')!,
        );

        expect(() => {
          tableWidgetModel.getChartWidgetProps();
        }).toThrow(TranslatableError);

        const textWidgetModel = widgetModelTranslator.fromWidgetDto(
          dashboardWithTextWidget.widgets!.find((widget) => widget.type === 'richtexteditor')!,
        );

        expect(() => {
          textWidgetModel.getChartWidgetProps();
        }).toThrow(TranslatableError);
      });
    });
  });

  describe('getTableWidgetProps', () => {
    it('should return table widget props correctly for table widget', () => {
      const tableWidgetModel = widgetModelTranslator.fromWidgetDto(
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
        dataSource: { title: 'Sample Healthcare', type: 'elasticube' },
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
      const nonTableWidgetModel = widgetModelTranslator.fromWidgetDto(mockWidgetDto);
      expect(() => nonTableWidgetModel.getTableWidgetProps()).toThrow(TranslatableError);

      const textWidgetModel = widgetModelTranslator.fromWidgetDto(
        dashboardWithTextWidget.widgets!.find((widget) => widget.type === 'richtexteditor')!,
      );
      expect(() => textWidgetModel.getTableWidgetProps()).toThrow(TranslatableError);
    });
  });

  describe('getPivotTableWidgetProps', () => {
    it('should throw an error for non-pivot widgets', () => {
      const nonPivotWidgetModel = widgetModelTranslator.fromWidgetDto(mockWidgetDto);
      expect(() => nonPivotWidgetModel.getPivotTableWidgetProps()).toThrow(TranslatableError);

      const textWidgetModel = widgetModelTranslator.fromWidgetDto(
        dashboardWithTextWidget.widgets!.find((widget) => widget.type === 'richtexteditor')!,
      );
      expect(() => textWidgetModel.getPivotTableWidgetProps()).toThrow(TranslatableError);
    });
    it('should return PivotTableWidgetProps for pivot widgets', () => {
      const pivotWidgetModel = widgetModelTranslator.fromWidgetDto(
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
        dataSource: { title: 'Sample Healthcare', type: 'elasticube' },
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

  describe('getTextWidgetProps', () => {
    it('should return text widget props correctly for text widget', () => {
      const textWidgetModel = widgetModelTranslator.fromWidgetDto(
        dashboardWithTextWidget.widgets!.find((widget) => widget.type === 'richtexteditor')!,
      );
      const textWidgetProps = textWidgetModel.getTextWidgetProps();

      expect(textWidgetProps).toMatchObject({
        styleOptions: {
          bgColor: '#FFFFFF',
          html: '<font color="#008c9c" size="5"><u style="">fancy text</u></font>',
          textAlign: 'center',
          vAlign: 'valign-middle',
        },
      });
    });
    it('should throw an error for non-text widgets', () => {
      const nonTextWidgetModel = widgetModelTranslator.fromWidgetDto(mockWidgetDto);
      expect(() => nonTextWidgetModel.getTextWidgetProps()).toThrow(TranslatableError);
    });
  });
});
