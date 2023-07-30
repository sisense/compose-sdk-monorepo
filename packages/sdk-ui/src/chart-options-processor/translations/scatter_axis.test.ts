import {
  commonColor,
  getScatterXAxisSettings,
  getScatterYAxisSettings,
  scatterFormatter,
} from './scatter_axis';
import { Axis, AxisSettings } from './axis_section';
import { fontStyleDefault } from '../defaults/cartesian';

describe('Scatter axis options', () => {
  const axis: Axis = {
    enabled: true,
    labels: true,
    titleEnabled: true,
    title: 'title',
    gridLine: true,
    type: 'linear',
    min: 0,
    max: 100,
    tickInterval: null,
  };

  describe('Scatter x-axis options', () => {
    it('Has correct categories property', () => {
      const categories = ['test'];
      const options = getScatterXAxisSettings(axis, categories, {});

      expect(options[0].categories).toStrictEqual(categories);
    });

    it('Has correct title text property', () => {
      const expectedTitle = 'title';
      const options = getScatterXAxisSettings(axis, undefined, {});

      expect(options[0].title?.text).toStrictEqual(expectedTitle);
    });

    it('Has correct options', () => {
      const titleText = 'title';

      const expectedOptions = {
        type: 'linear',
        startOnTick: false,
        endOnTick: false,
        labels: {
          overflow: 'justify',
          enabled: true,
          formatter: undefined,
          autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
          style: fontStyleDefault,
        },
        gridLineWidth: 1,
        gridLineColor: commonColor,
        gridLineDashStyle: 'Dot',
        title: {
          enabled: true,
          margin: 25,
          text: titleText,
        },
        categories: undefined,
        lineColor: commonColor,
        lineWidth: 1,
        minorTickColor: commonColor,
        minorGridLineColor: commonColor,
        minorGridLineDashStyle: 'Dot',
        minorTickLength: 0,
        tickLength: 0,
        tickColor: commonColor,
        tickmarkPlacement: 'on',
      } as AxisSettings;
      const options = getScatterXAxisSettings(axis, undefined, {});

      expect(options[0]?.labels?.formatter).toBeDefined();
      expect({
        ...options[0],
        labels: { ...options[0].labels, formatter: undefined },
      }).toStrictEqual(expectedOptions);
    });
  });

  describe('Scatter y-axis options', () => {
    it('Has correct categories property', () => {
      const categories = ['test'];
      const options = getScatterYAxisSettings(axis, categories, {});

      expect(options[0].categories).toStrictEqual(categories);
    });

    it('Has correct title text property', () => {
      const expectedTitle = 'title';
      const options = getScatterYAxisSettings(axis, undefined, {});

      expect(options[0].title?.text).toStrictEqual(expectedTitle);
    });

    it('Has correct options', () => {
      const titleText = 'title';

      const expectedOptions = {
        startOnTick: false,
        endOnTick: false,
        type: 'linear',
        title: {
          enabled: true,
          text: titleText,
        },
        labels: {
          enabled: true,
          formatter: undefined,
          autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
          style: fontStyleDefault,
        },
        categories: undefined,
        gridLineColor: commonColor,
        gridLineDashStyle: 'Dot',
        gridLineWidth: 1,
        lineColor: commonColor,
        lineWidth: 1,
        maxPadding: 0.025,
        minPadding: 0.025,
        minorGridLineColor: commonColor,
        minorGridLineDashStyle: 'Dot',
        minorGridLineWidth: 0,
        minorTickColor: commonColor,
        minorTickWidth: 0,
        opposite: false,
        tickColor: commonColor,
        tickWidth: 0,
        tickmarkPlacement: 'on',
      } as AxisSettings;
      const options = getScatterYAxisSettings(axis, undefined, {});

      expect(options[0]?.labels?.formatter).toBeDefined();
      expect({
        ...options[0],
        labels: { ...options[0].labels, formatter: undefined },
      }).toStrictEqual(expectedOptions);
    });
  });

  describe('scatterFormatter', () => {
    it('should return only string values', () => {
      const context1 = {
        value: 'Category1',
      };
      const context2 = {
        value: 14,
      };
      const res1 = scatterFormatter(undefined, context1.value, undefined);
      const res2 = scatterFormatter(undefined, context2.value, undefined);

      expect(res1).toBe(context1.value);
      expect(res2).toBe(`${context2.value}`);
    });

    it('should return shortened numbers', () => {
      const contextK = {
        value: 1000,
      };
      const contextM = {
        value: 2000000,
      };
      const contextB = {
        value: 3000000000,
      };
      const resK = scatterFormatter(undefined, contextK.value, undefined);
      const resM = scatterFormatter(undefined, contextM.value, undefined);
      const resB = scatterFormatter(undefined, contextB.value, undefined);

      expect(resK).toBe('1K');
      expect(resM).toBe('2M');
      expect(resB).toBe('3B');
    });

    it('should not shorten numbers if those are categories names', () => {
      const contextK = {
        value: 5000,
      };
      const axisAttribute = {
        name: 'Category',
        type: 'string',
      };
      const resK = scatterFormatter(axisAttribute, contextK.value, undefined);

      expect(resK).toBe(`${contextK.value}`);
    });

    it('should shorten numbers if those are not categories names', () => {
      const contextK = {
        value: 5000,
      };
      const axisAttribute = {
        name: 'Category',
        type: 'number',
      };
      const resK = scatterFormatter(axisAttribute, contextK.value, undefined);

      expect(resK).toBe('5K');
    });

    it('should not show values that are not a category name', () => {
      const context = {
        value: -146,
      };
      const axisAttribute = {
        name: 'Category',
        type: 'number',
      };
      const categories = ['Category1', 'Category2', 'Category3'];

      const res = scatterFormatter(axisAttribute, context.value, categories);

      expect(res).toBe('');
    });
  });
});
