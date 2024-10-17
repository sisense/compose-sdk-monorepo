import { ScatterDataTable } from '../../chart-data/types';
import { createCategoriesMap } from '../../chart-data/scatter-data';
import { buildScatterSeries } from './scatter-series';
import { MarkerSettings } from './marker-section';
import { SeriesType } from '../chart-options-service';
import { SeriesPointStructure } from './translations-to-highcharts';
import { StyledMeasureColumn } from '@/index';

describe('Scatter series builder', () => {
  const xCategories = ['x1', 'x2', 'x3'];
  const yCategories = ['y1', 'y2', 'y3'];

  const commonData: ScatterDataTable = [
    {
      xAxis: { displayValue: 'x1', rawValue: 1 },
      yAxis: { displayValue: 'y1', rawValue: 1 },
    },
    {
      xAxis: { displayValue: 'x2', rawValue: 2 },
      yAxis: { displayValue: 'y2', rawValue: 2 },
    },
    {
      xAxis: { displayValue: 'x3', rawValue: 3 },
      yAxis: { displayValue: 'y3', rawValue: 4 },
    },
  ];

  const commonPointProperties = {
    color: '#00cee6',
  };

  function validateSeries(series: SeriesType, expectedPoints: SeriesPointStructure[]) {
    expect(series).toBeDefined();
    expect(series.data).toBeDefined();
    expect(series.data).toHaveLength(expectedPoints.length);
    expectedPoints.forEach((point, index) => {
      expect(series.data[index]).toMatchObject(point);
    });
  }

  it('should has one element with correct properties', () => {
    const categoriesMap = createCategoriesMap();
    const { series: options } = buildScatterSeries(commonData, categoriesMap);
    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({
      index: 0,
      marker: {
        enabled: true,
        fillOpacity: 0.7,
        lineWidth: 1,
        states: {
          select: {
            fillOpacity: 0.3,
            lineWidth: 1,
          },
        },
      },
      name: '',
      showInLegend: false,
      type: 'bubble',
      color: '#00cee6',
    });
    expect(options[0].data).toBeDefined();
  });

  it('should has one element with correct properties for user-provided data', () => {
    // ComparableData of user-provided data do not have rawValue
    const userProvidedData: ScatterDataTable = [
      {
        xAxis: { displayValue: '101' },
        yAxis: { displayValue: '101' },
      },
    ];

    const expected1 = {
      ...commonPointProperties,
      x: Number(userProvidedData[0].xAxis.displayValue),
      y: Number(userProvidedData[0].yAxis.displayValue),
      z: 1,
      custom: {
        maskedX: userProvidedData[0].xAxis.displayValue,
        maskedY: userProvidedData[0].yAxis.displayValue,
      },
    };

    const categoriesMap = createCategoriesMap();
    const { series: options } = buildScatterSeries(userProvidedData, categoriesMap);
    expect(options).toHaveLength(1);
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1]);
  });

  it('should build three points with value based on the data field', () => {
    const categoriesMap = createCategoriesMap();
    const { series: options } = buildScatterSeries(commonData, categoriesMap);

    const expected1 = {
      ...commonPointProperties,
      x: commonData[0].xAxis.rawValue,
      y: commonData[0].yAxis.rawValue,
      z: 1,
      custom: {
        maskedX: commonData[0].xAxis.displayValue,
        maskedY: commonData[0].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const expected2 = {
      ...commonPointProperties,
      x: commonData[1].xAxis.rawValue,
      y: commonData[1].yAxis.rawValue,
      z: 1,
      custom: {
        maskedX: commonData[1].xAxis.displayValue,
        maskedY: commonData[1].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const expected3 = {
      ...commonPointProperties,
      x: commonData[2].xAxis.rawValue,
      y: commonData[2].yAxis.rawValue,
      z: 1,
      custom: {
        maskedX: commonData[2].xAxis.displayValue,
        maskedY: commonData[2].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1, expected2, expected3]);
  });

  it('should build three points with value based on xCategories index', () => {
    const categoriesMap = createCategoriesMap(xCategories);
    const { series: options } = buildScatterSeries(commonData, categoriesMap);

    const expected1 = {
      ...commonPointProperties,
      x: 0,
      y: commonData[0].yAxis.rawValue,
      z: 1,
      custom: {
        maskedX: commonData[0].xAxis.displayValue,
        maskedY: commonData[0].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const expected2 = {
      ...commonPointProperties,
      x: 1,
      y: commonData[1].yAxis.rawValue,
      z: 1,
      custom: {
        maskedX: commonData[1].xAxis.displayValue,
        maskedY: commonData[1].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const expected3 = {
      ...commonPointProperties,
      x: 2,
      y: commonData[2].yAxis.rawValue,
      z: 1,
      custom: {
        maskedX: commonData[2].xAxis.displayValue,
        maskedY: commonData[2].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1, expected2, expected3]);
  });

  it('should build three points with value based on yCategories index', () => {
    const categoriesMap = createCategoriesMap(undefined, yCategories);
    const { series: options } = buildScatterSeries(commonData, categoriesMap);

    const expected1 = {
      ...commonPointProperties,
      x: commonData[0].xAxis.rawValue,
      y: 0,
      z: 1,
      custom: {
        maskedX: commonData[0].xAxis.displayValue,
        maskedY: commonData[0].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const expected2 = {
      ...commonPointProperties,
      x: commonData[1].xAxis.rawValue,
      y: 1,
      z: 1,
      custom: {
        maskedX: commonData[1].xAxis.displayValue,
        maskedY: commonData[1].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const expected3 = {
      ...commonPointProperties,
      x: commonData[2].xAxis.rawValue,
      y: 2,
      z: 1,
      custom: {
        maskedX: commonData[2].xAxis.displayValue,
        maskedY: commonData[2].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1, expected2, expected3]);
  });

  it('should build three points with value based on categories', () => {
    const categoriesMap = createCategoriesMap(xCategories, yCategories);
    const { series: options } = buildScatterSeries(commonData, categoriesMap);

    const expected1 = {
      ...commonPointProperties,
      x: 0,
      y: 0,
      z: 1,
      custom: {
        maskedX: commonData[0].xAxis.displayValue,
        maskedY: commonData[0].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const expected2 = {
      ...commonPointProperties,
      x: 1,
      y: 1,
      z: 1,
      custom: {
        maskedX: commonData[1].xAxis.displayValue,
        maskedY: commonData[1].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const expected3 = {
      ...commonPointProperties,
      x: 2,
      y: 2,
      z: 1,
      custom: {
        maskedX: commonData[2].xAxis.displayValue,
        maskedY: commonData[2].yAxis.displayValue,
      },
    } as SeriesPointStructure;
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1, expected2, expected3]);
  });

  it('should fill break by / point correctly', () => {
    const dataWithBreakByPoint = [
      {
        xAxis: { rawValue: 1, displayValue: 'x1' },
        yAxis: { rawValue: 1, displayValue: 'y1' },
        breakByPoint: { rawValue: 1, displayValue: 'b1' },
      },
      {
        xAxis: { rawValue: 2, displayValue: 'x2' },
        yAxis: { rawValue: 2, displayValue: 'y2' },
        breakByPoint: { rawValue: 2, displayValue: 'b2' },
      },
      {
        xAxis: { rawValue: 3, displayValue: 'x3' },
        yAxis: { rawValue: 4, displayValue: 'y3' },
        breakByPoint: { rawValue: 3, displayValue: 'b3' },
      },
    ] as ScatterDataTable;
    const categoriesMap = createCategoriesMap(xCategories, yCategories);
    const { series: options } = buildScatterSeries(dataWithBreakByPoint, categoriesMap);

    const expected1 = {
      ...commonPointProperties,
      x: 0,
      y: 0,
      z: 1,
      custom: {
        maskedX: dataWithBreakByPoint[0].xAxis.displayValue,
        maskedY: dataWithBreakByPoint[0].yAxis.displayValue,
        maskedBreakByPoint: dataWithBreakByPoint[0].breakByPoint?.displayValue,
      },
    } as SeriesPointStructure;
    const expected2 = {
      ...commonPointProperties,
      x: 1,
      y: 1,
      z: 1,
      custom: {
        maskedX: dataWithBreakByPoint[1].xAxis.displayValue,
        maskedY: dataWithBreakByPoint[1].yAxis.displayValue,
        maskedBreakByPoint: dataWithBreakByPoint[1].breakByPoint?.displayValue,
      },
    } as SeriesPointStructure;
    const expected3 = {
      ...commonPointProperties,
      x: 2,
      y: 2,
      z: 1,
      custom: {
        maskedX: dataWithBreakByPoint[2].xAxis.displayValue,
        maskedY: dataWithBreakByPoint[2].yAxis.displayValue,
        maskedBreakByPoint: dataWithBreakByPoint[2].breakByPoint?.displayValue,
      },
    } as SeriesPointStructure;
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1, expected2, expected3]);
  });

  const dataWithBreakByColor = [
    {
      xAxis: { rawValue: 2, displayValue: 'x2' },
      yAxis: { rawValue: 2, displayValue: 'y2' },
      breakByColor: { rawValue: 2, displayValue: 'b2', color: '#000002' },
    },
    {
      xAxis: { rawValue: 1, displayValue: 'x1' },
      yAxis: { rawValue: 1, displayValue: 'y1' },
      breakByColor: { rawValue: 1, displayValue: 'b1', color: '#000001' },
    },
    {
      xAxis: { rawValue: 3, displayValue: 'x3' },
      yAxis: { rawValue: 3, displayValue: 'y3' },
      breakByColor: { rawValue: 3, displayValue: 'b3', color: '#000003' },
    },
    {
      xAxis: { rawValue: 4, displayValue: 'x4' },
      yAxis: { rawValue: 4, displayValue: 'y4' },
      breakByColor: { rawValue: 1, displayValue: 'b1', color: '#000001' },
    },
  ] as ScatterDataTable;

  it('should fill break by / color for the categorical column correctly', () => {
    const categoriesMap = createCategoriesMap(xCategories, yCategories);
    const breakByColor = {
      column: {
        name: 'breakByColor',
        type: 'string',
      },
    };
    const dataOptions = {
      breakByColor,
    };
    const { series: options } = buildScatterSeries(
      dataWithBreakByColor,
      categoriesMap,
      dataOptions,
    );

    const seriesMarker: MarkerSettings = {
      enabled: true,
      fillOpacity: 0.7,
      lineWidth: 1,
      states: {
        select: {
          fillOpacity: 0.3,
          lineWidth: 1,
        },
      },
    };

    const expected1 = {
      color: '#000001',
      data: [
        {
          color: '#000001',
          x: 0,
          y: 0,
          z: 1,
          custom: {
            maskedX: dataWithBreakByColor[1].xAxis.displayValue,
            maskedY: dataWithBreakByColor[1].yAxis.displayValue,
            maskedBreakByColor: dataWithBreakByColor[1].breakByColor?.displayValue,
          },
        },
        {
          color: '#000001',
          x: 4,
          y: 4,
          z: 1,
          custom: {
            maskedX: dataWithBreakByColor[3].xAxis.displayValue,
            maskedY: dataWithBreakByColor[3].yAxis.displayValue,
            maskedBreakByColor: dataWithBreakByColor[3].breakByColor?.displayValue,
          },
        },
      ],
      index: 0,
      marker: seriesMarker,
      name: 'b1',
      showInLegend: true,
      type: 'bubble',
    };
    const expected2 = {
      color: '#000002',
      data: [
        {
          color: '#000002',
          x: 1,
          y: 1,
          z: 1,
          custom: {
            maskedX: dataWithBreakByColor[0].xAxis.displayValue,
            maskedY: dataWithBreakByColor[0].yAxis.displayValue,
            maskedBreakByColor: dataWithBreakByColor[0].breakByColor?.displayValue,
          },
        },
      ],
      index: 1,
      marker: seriesMarker,
      name: 'b2',
      showInLegend: true,
      type: 'bubble',
    };
    const expected3 = {
      color: '#000003',
      data: [
        {
          color: '#000003',
          x: 2,
          y: 2,
          z: 1,
          custom: {
            maskedX: dataWithBreakByColor[2].xAxis.displayValue,
            maskedY: dataWithBreakByColor[2].yAxis.displayValue,
            maskedBreakByColor: dataWithBreakByColor[2].breakByColor?.displayValue,
          },
        },
      ],
      index: 2,
      marker: seriesMarker,
      name: 'b3',
      showInLegend: true,
      type: 'bubble',
    };

    expect(options).toHaveLength(3);
    expect(options[0]).toMatchObject(expected1);
    expect(options[1]).toMatchObject(expected2);
    expect(options[2]).toMatchObject(expected3);
    // Verifies the correct series order => sorted ascending by 'name' field
    expect(options.map(({ name }) => name)).toEqual([
      expected1.name,
      expected2.name,
      expected3.name,
    ]);
  });

  it('should fill break by / color for the measure column correctly', () => {
    const categoriesMap = createCategoriesMap(xCategories, yCategories);
    const breakByColor = {
      column: {
        name: 'breakByColor',
        aggregation: 'sum',
        title: 'Break By Color',
      },
    };
    const dataOptions = {
      breakByColor,
    };
    const { series: options } = buildScatterSeries(
      dataWithBreakByColor,
      categoriesMap,
      dataOptions,
    );

    const seriesMarker: MarkerSettings = {
      enabled: true,
      fillOpacity: 0.7,
      lineWidth: 1,
      states: {
        select: {
          fillOpacity: 0.3,
          lineWidth: 1,
        },
      },
    };

    const expected1 = {
      color: '#00cee6',
      data: [
        {
          color: '#000002',
          x: 1,
          y: 1,
          z: 1,
          custom: {
            maskedX: dataWithBreakByColor[0].xAxis.displayValue,
            maskedY: dataWithBreakByColor[0].yAxis.displayValue,
            maskedBreakByColor: dataWithBreakByColor[0].breakByColor?.displayValue,
          },
        },
        {
          color: '#000001',
          x: 0,
          y: 0,
          z: 1,
          custom: {
            maskedX: dataWithBreakByColor[1].xAxis.displayValue,
            maskedY: dataWithBreakByColor[1].yAxis.displayValue,
            maskedBreakByColor: dataWithBreakByColor[1].breakByColor?.displayValue,
          },
        },
        {
          color: '#000003',
          x: 2,
          y: 2,
          z: 1,
          custom: {
            maskedX: dataWithBreakByColor[2].xAxis.displayValue,
            maskedY: dataWithBreakByColor[2].yAxis.displayValue,
            maskedBreakByColor: dataWithBreakByColor[2].breakByColor?.displayValue,
          },
        },
        {
          color: '#000001',
          x: 4,
          y: 4,
          z: 1,
          custom: {
            maskedX: dataWithBreakByColor[3].xAxis.displayValue,
            maskedY: dataWithBreakByColor[3].yAxis.displayValue,
            maskedBreakByColor: dataWithBreakByColor[3].breakByColor?.displayValue,
          },
        },
      ],
      index: 0,
      marker: seriesMarker,
      name: 'Break By Color',
      showInLegend: true,
      type: 'bubble',
    };

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject(expected1);
  });

  it('should set series colors based on color options from "break by / color" measure', () => {
    const expectedColor = 'red';
    const categoriesMap = createCategoriesMap(xCategories, yCategories);
    const breakByColor = {
      column: {
        name: 'breakByColor',
        aggregation: 'sum',
        title: 'breakByColor',
      },
      color: {
        type: 'uniform',
        color: expectedColor,
      },
    } as StyledMeasureColumn;
    const dataOptions = {
      breakByColor,
    };
    const options = buildScatterSeries(dataWithBreakByColor, categoriesMap, dataOptions);

    expect(options.series[0].color).toMatch(expectedColor);
    options.series[0].data.forEach((point) => {
      expect(point.color).toMatch(expectedColor);
    });
  });

  it('should fill size correctly', () => {
    const dataWithSize = [
      {
        xAxis: { rawValue: 1, displayValue: 'x1' },
        yAxis: { rawValue: 1, displayValue: 'y1' },
        breakByPoint: { rawValue: 1, displayValue: 'b1' },
        size: { rawValue: 1, displayValue: 's1' },
      },
      {
        xAxis: { rawValue: 2, displayValue: 'x2' },
        yAxis: { rawValue: 2, displayValue: 'y2' },
        breakByPoint: { rawValue: 2, displayValue: 'b2' },
        size: { rawValue: 2, displayValue: 's2' },
      },
      {
        xAxis: { rawValue: 3, displayValue: 'x3' },
        yAxis: { rawValue: 3, displayValue: 'y3' },
        breakByPoint: { rawValue: 3, displayValue: 'b3' },
        size: { rawValue: 3, displayValue: 's3' },
      },
    ] as ScatterDataTable;
    const categoriesMap = createCategoriesMap(xCategories, yCategories);
    const { series: options } = buildScatterSeries(dataWithSize, categoriesMap);

    const expected1 = {
      ...commonPointProperties,
      x: 0,
      y: 0,
      z: 1,
      custom: {
        maskedX: dataWithSize[0].xAxis.displayValue,
        maskedY: dataWithSize[0].yAxis.displayValue,
        maskedBreakByPoint: dataWithSize[0].breakByPoint?.displayValue,
        maskedSize: dataWithSize[0].size?.displayValue,
      },
    } as SeriesPointStructure;
    const expected2 = {
      ...commonPointProperties,
      x: 1,
      y: 1,
      z: 2,
      custom: {
        maskedX: dataWithSize[1].xAxis.displayValue,
        maskedY: dataWithSize[1].yAxis.displayValue,
        maskedBreakByPoint: dataWithSize[1].breakByPoint?.displayValue,
        maskedSize: dataWithSize[1].size?.displayValue,
      },
    } as SeriesPointStructure;
    const expected3 = {
      ...commonPointProperties,
      x: 2,
      y: 2,
      z: 3,
      custom: {
        maskedX: dataWithSize[2].xAxis.displayValue,
        maskedY: dataWithSize[2].yAxis.displayValue,
        maskedBreakByPoint: dataWithSize[2].breakByPoint?.displayValue,
        maskedSize: dataWithSize[2].size?.displayValue,
      },
    } as SeriesPointStructure;
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1, expected2, expected3]);
  });

  it('should fill size correctly with null values', () => {
    const dataWithSize: ScatterDataTable = [
      {
        xAxis: { rawValue: 1, displayValue: 'x1' },
        yAxis: { rawValue: 1, displayValue: 'y1' },
        breakByPoint: { rawValue: 1, displayValue: 'b1' },
        size: { rawValue: undefined, displayValue: 's1' },
      },
    ];
    const categoriesMap = createCategoriesMap(xCategories, yCategories);
    const { series: options } = buildScatterSeries(dataWithSize, categoriesMap);

    const expected1 = {
      ...commonPointProperties,
      x: 0,
      y: 0,
      z: null,
      custom: {
        maskedX: dataWithSize[0].xAxis.displayValue,
        maskedY: dataWithSize[0].yAxis.displayValue,
        maskedBreakByPoint: dataWithSize[0].breakByPoint?.displayValue,
        maskedSize: dataWithSize[0].size?.displayValue,
      },
    } as SeriesPointStructure;
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1]);
  });

  it('should fill size correctly with N\\A values', () => {
    const dataWithSize: ScatterDataTable = [
      {
        xAxis: { rawValue: 1, displayValue: 'x1' },
        yAxis: { rawValue: 1, displayValue: 'y1' },
        breakByPoint: { rawValue: 1, displayValue: 'b1' },
        size: { rawValue: 'N\\A', displayValue: 's1' },
      },
    ];
    const categoriesMap = createCategoriesMap(xCategories, yCategories);
    const { series: options } = buildScatterSeries(dataWithSize, categoriesMap);

    const expected1 = {
      ...commonPointProperties,
      x: 0,
      y: 0,
      z: null,
      custom: {
        maskedX: dataWithSize[0].xAxis.displayValue,
        maskedY: dataWithSize[0].yAxis.displayValue,
        maskedBreakByPoint: dataWithSize[0].breakByPoint?.displayValue,
        maskedSize: dataWithSize[0].size?.displayValue,
      },
    } as SeriesPointStructure;
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1]);
  });

  it('should build one point when another one has null data', () => {
    const dataWithNull: ScatterDataTable = [
      {
        xAxis: { rawValue: 1, displayValue: 'x1' },
        yAxis: { rawValue: undefined, displayValue: 'y1' },
      },
      {
        xAxis: { rawValue: 2, displayValue: 'x2' },
        yAxis: { rawValue: 2, displayValue: 'y2' },
      },
    ];
    const categoriesMap = createCategoriesMap();
    const { series: options } = buildScatterSeries(dataWithNull, categoriesMap);

    const expected1 = {
      ...commonPointProperties,
      x: 2,
      y: 2,
      z: 1,
      custom: {
        maskedX: 'x2',
        maskedY: 'y2',
      },
    } as SeriesPointStructure;
    const firstSeries = options[0];
    validateSeries(firstSeries, [expected1]);
  });

  it('should apply data limits', () => {
    const seriesCapacity = 2;

    const categoriesMap = createCategoriesMap(xCategories, yCategories);
    const breakByColor = {
      column: {
        name: 'breakByColor',
        type: 'string',
      },
    };
    const dataOptions = {
      breakByColor,
    };
    const { series: options } = buildScatterSeries(
      dataWithBreakByColor,
      categoriesMap,
      dataOptions,
      undefined,
      seriesCapacity,
    );

    expect(options).toHaveLength(seriesCapacity);
  });
});
