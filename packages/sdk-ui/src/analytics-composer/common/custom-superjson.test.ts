import {
  CascadingFilter,
  CustomFilter,
  DateRangeFilter,
  DimensionalAttribute,
  DimensionalBaseMeasure,
  DimensionalCalculatedMeasure,
  DimensionalDateDimension,
  DimensionalDimension,
  DimensionalLevelAttribute,
  DimensionalMeasureTemplate,
  ExcludeFilter,
  JaqlDataSource,
  JaqlElement,
  LogicalAttributeFilter,
  MeasureFilter,
  MembersFilter,
  NumericFilter,
  RankingFilter,
  RelativeDateFilter,
  Sort,
  TextFilter,
} from '@sisense/sdk-data';
import { MOCK_QUERY_MODEL_1, MOCK_QUERY_MODEL_2 } from '../__mocks__/mock-queries.js';
import { widgetComposer } from '../index.js';
import { CustomSuperJSON } from './custom-superjson.js';
describe('CustomSuperJSON', () => {
  describe('queryModel', () => {
    it('should stringify and parse back to widget props', () => {
      [MOCK_QUERY_MODEL_1, MOCK_QUERY_MODEL_2].forEach((queryModel) => {
        const widgetProps = widgetComposer.toWidgetProps(queryModel);
        expect(widgetProps).toBeDefined();
        if (!widgetProps) return;

        // disregard styleOptions.header.renderToolbar, which is a function
        delete (widgetProps as any).styleOptions.header.renderToolbar;

        expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(widgetProps))).toStrictEqual(
          widgetProps,
        );
      });
    });
  });
  describe('DimensionalElement', () => {
    const jaqlDataSource: JaqlDataSource = {
      title: 'some-title',
      live: true,
      id: 'some-id',
      address: 'some-address',
    };

    const attribute = new DimensionalAttribute(
      'some-attribute-name',
      '[some.expression]',
      'some-type',
      'some-description',
      Sort.Ascending,
      jaqlDataSource,
      'some-attribute-compose-code',
      'some-attribute-panel',
    );
    const levelAttribute = new DimensionalLevelAttribute(
      'some-level-attribute-name',
      'some-expression',
      'Years',
      'some-format',
      'some-description',
      Sort.Ascending,
      jaqlDataSource,
      'some-level-attribute-compose-code',
      'some-level-attribute-panel',
    );
    const dimension = new DimensionalDimension(
      'some-dimension-name',
      'some-expression',
      [attribute, levelAttribute],
      undefined,
      'textdimension',
      'some-description',
      Sort.Ascending,
      jaqlDataSource,
      'some-dimension-compose-code',
      attribute,
    );

    const dateDimension = new DimensionalDateDimension(
      'some-date-dimension-name',
      '[some.expression]',
      'some-description',
      Sort.Ascending,
      jaqlDataSource,
      'some-date-dimension-compose-code',
    );

    const baseMeasure = new DimensionalBaseMeasure(
      'some-base-measure-name',
      attribute,
      'some-aggregation',
      'some-format',
      'some-description',
      Sort.Ascending,
      jaqlDataSource,
      'some-base-measure-compose-code',
    );
    const measureContext = {
      'some-name': 'some-value',
      'some-attribute': attribute,
      'some-level-attribute': levelAttribute,
      'some-base-measure': baseMeasure,
      'some-calculated-measure': new DimensionalCalculatedMeasure(
        'some-calculated-measure-name',
        '[some.expression]',
        {},
      ),
    };
    const calculatedMeasure = new DimensionalCalculatedMeasure(
      'some-calculated-measure-name',
      '[some.expression]',
      measureContext,
      'some-format',
      'some-description',
      Sort.Ascending,
      jaqlDataSource,
      'some-calculated-measure-compose-code',
    );

    const measureTemplate = new DimensionalMeasureTemplate(
      'some-measure-template-name',
      attribute,
      'some-format',
      'some-description',
      Sort.Ascending,
      jaqlDataSource,
      'some-measure-template-compose-code',
    );

    const textFilter = new TextFilter(
      attribute,
      'some-operator',
      'some-value',
      {
        guid: 'some-guid',
      },
      'some-text-filter-compose-code',
    );
    const membersFilter = new MembersFilter(
      attribute,
      ['some-member-1', 'some-member-2'],
      {
        guid: 'some-guid',
        backgroundFilter: textFilter,
      },
      'some-members-filter-compose-code',
    );

    const logicalAttributeFilter = new LogicalAttributeFilter(
      [textFilter, membersFilter],
      'some-operator',
      { guid: 'some-guid' },
      'some-logical-attribute-filter-compose-code',
    );

    const cascadingFilter = new CascadingFilter(
      [textFilter, membersFilter, logicalAttributeFilter],
      { guid: 'some-guid' },
      'some-cascading-filter-compose-code',
    );

    const excludeFilter = new ExcludeFilter(
      logicalAttributeFilter,
      cascadingFilter,
      {
        guid: 'some-guid',
      },
      'some-exclude-filter-compose-code',
    );

    const measureFilter1 = new MeasureFilter(
      attribute,
      baseMeasure,
      'some-operator-a',
      1,
      'some-operator-b',
      2,
      { guid: 'some-guid' },
      'some-measure-filter-1-compose-code',
    );

    const measureFilter2 = new MeasureFilter(
      attribute,
      calculatedMeasure,
      'some-operator-a',
      1,
      'some-operator-b',
      2,
      { guid: 'some-guid' },
      'some-measure-filter-2-compose-code',
    );

    const measureFilter3 = new MeasureFilter(
      attribute,
      measureTemplate,
      'some-operator-a',
      1,
      'some-operator-b',
      2,
      { guid: 'some-guid' },
      'some-measure-filter-3-compose-code',
    );

    const rankingFilter = new RankingFilter(
      attribute,
      baseMeasure,
      'some-operator',
      1,
      {
        guid: 'some-guid',
      },
      'some-ranking-filter-compose-code',
    );

    const numericFilter = new NumericFilter(
      attribute,
      'some-operator-a',
      1,
      'some-operator-b',
      2,
      {
        guid: 'some-guid',
      },
      'some-numeric-filter-compose-code',
    );

    const dateRangeFilter = new DateRangeFilter(
      levelAttribute,
      '2020-01-01',
      '2020-01-02',
      {
        guid: 'some-guid',
      },
      'some-date-range-filter-compose-code',
    );

    const relativeDateFilter = new RelativeDateFilter(
      levelAttribute,
      1,
      2,
      'last',
      'some-anchor',
      {
        guid: 'some-guid',
      },
      'some-relative-date-filter-compose-code',
    );

    const customFilter = new CustomFilter(
      attribute,
      'some-jaql-expression',
      {
        guid: 'some-guid',
      },
      'some-custom-filter-compose-code',
    );

    it('should have id', () => {
      expect(dimension.id).toBeDefined();
      expect(dateDimension.id).toBeDefined();
      expect(attribute.id).toBeDefined();
      expect(levelAttribute.id).toBeDefined();
      expect(baseMeasure.id).toBeDefined();
      expect(calculatedMeasure.id).toBeDefined();
      expect(measureTemplate.id).toBeDefined();
      expect(membersFilter.id).toBeDefined();
      expect(textFilter.id).toBeDefined();
      expect(logicalAttributeFilter.id).toBeDefined();
      expect(cascadingFilter.id).toBeDefined();
      expect(excludeFilter.id).toBeDefined();
      expect(measureFilter1.id).toBeDefined();
      expect(rankingFilter.id).toBeDefined();
      expect(numericFilter.id).toBeDefined();
      expect(dateRangeFilter.id).toBeDefined();
      expect(relativeDateFilter.id).toBeDefined();
      expect(customFilter.id).toBeDefined();
    });

    it('should sort DimensionalDimension', () => {
      expect(dimension.sort(Sort.Ascending)).toBeDefined();
    });

    it('should stringify and parse back JaqlElement', () => {
      const element = new JaqlElement({ jaql: { title: 'test' } }, 'some-type');
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(element))).toStrictEqual(element);
    });
    it('should stringify and parse back DimensionalAttribute', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(attribute))).toStrictEqual(attribute);
    });
    it('should stringify and parse back DimensionalLevelAttribute', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(levelAttribute))).toStrictEqual(
        levelAttribute,
      );
    });
    it('should stringify and parse back DimensionalDimension', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(dimension))).toStrictEqual(dimension);
    });
    it('should stringify and parse back DimensionalDateDimension', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(dateDimension))).toStrictEqual(
        dateDimension,
      );
    });
    it('should stringify and parse back DimensionalBaseMeasure', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(baseMeasure))).toStrictEqual(
        baseMeasure,
      );
    });
    it('should stringify and parse back DimensionalCalculatedMeasure', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(calculatedMeasure))).toStrictEqual(
        calculatedMeasure,
      );
    });
    it('should stringify and parse back DimensionalMeasureTemplate', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(measureTemplate))).toStrictEqual(
        measureTemplate,
      );
    });
    it('should stringify and parse back TextFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(textFilter))).toStrictEqual(
        textFilter,
      );
    });

    it('should stringify and parse back MembersFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(membersFilter))).toStrictEqual(
        membersFilter,
      );
    });

    it('should stringify and parse back LogicalAttributeFilter', () => {
      expect(
        CustomSuperJSON.parse(CustomSuperJSON.stringify(logicalAttributeFilter)),
      ).toStrictEqual(logicalAttributeFilter);
    });

    it('should stringify and parse back CascadingFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(cascadingFilter))).toStrictEqual(
        cascadingFilter,
      );
    });

    it('should stringify and parse back ExcludeFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(excludeFilter))).toStrictEqual(
        excludeFilter,
      );
    });

    it('should stringify and parse back MeasureFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(measureFilter1))).toStrictEqual(
        measureFilter1,
      );
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(measureFilter2))).toStrictEqual(
        measureFilter2,
      );
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(measureFilter3))).toStrictEqual(
        measureFilter3,
      );
    });

    it('should stringify and parse back RankingFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(rankingFilter))).toStrictEqual(
        rankingFilter,
      );
    });

    it('should stringify and parse back NumericFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(numericFilter))).toStrictEqual(
        numericFilter,
      );
    });

    it('should stringify and parse back DateRangeFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(dateRangeFilter))).toStrictEqual(
        dateRangeFilter,
      );
    });

    it('should stringify and parse back RelativeDateFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(relativeDateFilter))).toStrictEqual(
        relativeDateFilter,
      );
    });

    it('should stringify and parse back CustomFilter', () => {
      expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(customFilter))).toStrictEqual(
        customFilter,
      );
    });
  });
});
