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
  isCascadingFilter,
  isCustomFilter,
  isDateRangeFilter,
  isDimensionalAttribute,
  isDimensionalBaseMeasure,
  isDimensionalCalculatedMeasure,
  isDimensionalDateDimension,
  isDimensionalDimension,
  isDimensionalLevelAttribute,
  isDimensionalMeasureTemplate,
  isExcludeFilter,
  isJaqlElement,
  isLogicalAttributeFilter,
  isMeasureFilter,
  isMembersFilter,
  isNumericFilter,
  isRankingFilter,
  isRelativeDateFilter,
  isTextFilter,
  JaqlElement,
  JSONObject,
  LogicalAttributeFilter,
  MeasureFilter,
  MembersFilter,
  NumericFilter,
  RankingFilter,
  RelativeDateFilter,
  Sort,
  TextFilter,
} from '@ethings-os/sdk-data';
import SuperJSON, { SuperJSONResult } from 'superjson';

// Centralized place to deserialize dimensional elements and register serialize/deserialize methods to SuperJSON.

interface SerializedObject extends JSONObject {
  __serializable: string;
}

const normalizeSort = (v: Sort | undefined) => (v === undefined ? Sort.None : v);

const deserializeJaqlElement = (v: any) => new JaqlElement(v.metadataItem, v.type);

const deserializeDimensionalAttribute = (v: any) =>
  new DimensionalAttribute(
    v.name,
    v.expression,
    v.type,
    v.description,
    normalizeSort(v.sort),
    v.dataSource,
    v.composeCode,
  );

const deserializeDimensionalLevelAttribute = (v: any) =>
  new DimensionalLevelAttribute(
    v.name,
    v.expression,
    v.granularity,
    v.format,
    v.description,
    normalizeSort(v.sort),
    v.dataSource,
    v.composeCode,
  );

const deserializeAttribute = (v: any) => {
  const className = (v as SerializedObject).__serializable;
  switch (className) {
    case 'DimensionalAttribute':
      return deserializeDimensionalAttribute(v);
    case 'DimensionalLevelAttribute':
      return deserializeDimensionalLevelAttribute(v);
    default:
      return v;
  }
};

const deserializeDimensionalDimension = (v: any) =>
  new DimensionalDimension(
    v.name,
    v.expression,
    v.attributes.map(deserializeAttribute),
    v.dimensions.map(deserializeDimension),
    v.type,
    v.description,
    normalizeSort(v.sort),
    v.dataSource,
    v.composeCode,
    v.defaultAttribute ? deserializeAttribute(v.defaultAttribute) : undefined,
  );

const deserializeDimensionalDateDimension = (v: any) =>
  new DimensionalDateDimension(
    v.name,
    v.expression,
    v.description,
    normalizeSort(v.sort),
    v.dataSource,
    v.composeCode,
  );

const deserializeDimension = (v: any) => {
  const className = (v as SerializedObject).__serializable;
  switch (className) {
    case 'DimensionalDimension':
      return deserializeDimensionalDimension(v);
    case 'DimensionalDateDimension':
      return deserializeDimensionalDateDimension(v);
    default:
      return v;
  }
};

const deserializeDimensionalBaseMeasure = (v: any) =>
  new DimensionalBaseMeasure(
    v.name,
    deserializeAttribute(v.attribute),
    v.aggregation,
    v.format,
    v.description,
    normalizeSort(v.sort),
    v.dataSource,
    v.composeCode,
  );

const deserializeDimensionalCalculatedMeasure = (v: any) => {
  // Handle deserialization of context with possible nested custom objects
  const deserializedContext: Record<string, any> = Object.fromEntries(
    Object.entries(v.context).map(([key, value]) => {
      if (value && typeof value === 'object' && '__serializable' in value) {
        const className = (value as SerializedObject).__serializable;
        switch (className) {
          case 'DimensionalAttribute':
            return [key, deserializeDimensionalAttribute(value)];
          case 'DimensionalLevelAttribute':
            return [key, deserializeDimensionalLevelAttribute(value)];
          case 'DimensionalBaseMeasure':
            return [key, deserializeDimensionalBaseMeasure(value)];
          case 'DimensionalCalculatedMeasure':
            return [key, deserializeDimensionalCalculatedMeasure(value)];
          default:
            return [key, value];
        }
      }
      // Otherwise, just return the value as is
      return [key, value];
    }),
  );

  return new DimensionalCalculatedMeasure(
    v.name,
    v.expression,
    deserializedContext,
    v.format,
    v.description,
    normalizeSort(v.sort),
    v.dataSource,
    v.composeCode,
  );
};

const deserializeDimensionalMeasureTemplate = (v: any) =>
  new DimensionalMeasureTemplate(
    v.name,
    deserializeAttribute(v.attribute),
    v.format,
    v.description,
    normalizeSort(v.sort),
    v.dataSource,
    v.composeCode,
  );

const deserializeMeasure = (v: any) => {
  const className = (v as SerializedObject).__serializable;
  switch (className) {
    case 'DimensionalBaseMeasure':
      return deserializeDimensionalBaseMeasure(v);
    case 'DimensionalCalculatedMeasure':
      return deserializeDimensionalCalculatedMeasure(v);
    case 'DimensionalMeasureTemplate':
      return deserializeDimensionalMeasureTemplate(v);
    default:
      return v;
  }
};

const deserializeFilter = (v: any): any => {
  const className = (v as SerializedObject).__serializable;
  switch (className) {
    case 'MembersFilter':
      return new MembersFilter(
        deserializeAttribute(v.attribute),
        v.members,
        v.config.backgroundFilter
          ? { ...v.config, backgroundFilter: deserializeFilter(v.config.backgroundFilter) }
          : v.config,
        v.composeCode,
      );
    case 'LogicalAttributeFilter':
      return new LogicalAttributeFilter(
        v.filters.map((f: any) => deserializeFilter(f)),
        v.operator,
        v.config,
        v.composeCode,
      );
    case 'CascadingFilter':
      return new CascadingFilter(
        v._filters.map((f: any) => deserializeFilter(f)),
        v.config,
        v.composeCode,
      );
    case 'ExcludeFilter':
      return new ExcludeFilter(
        deserializeFilter(v.filter),
        v.input ? deserializeFilter(v.input) : undefined,
        v.config,
        v.composeCode,
      );
    case 'MeasureFilter':
      return new MeasureFilter(
        deserializeAttribute(v.attribute),
        deserializeMeasure(v.measure),
        v.operatorA,
        v.valueA,
        v.operatorB,
        v.valueB,
        v.config,
        v.composeCode,
      );
    case 'RankingFilter':
      return new RankingFilter(
        deserializeAttribute(v.attribute),
        deserializeMeasure(v.measure),
        v.operator,
        v.count,
        v.config,
        v.composeCode,
      );
    case 'NumericFilter':
      return new NumericFilter(
        deserializeAttribute(v.attribute),
        v.operatorA,
        v.valueA,
        v.operatorB,
        v.valueB,
        v.config,
        v.composeCode,
      );
    case 'TextFilter':
      return new TextFilter(
        deserializeAttribute(v.attribute),
        v.operatorA,
        v.valueA,
        v.config,
        v.composeCode,
      );
    case 'DateRangeFilter': {
      const { valueA, valueB } = v;

      return new DateRangeFilter(
        deserializeAttribute(v.attribute),
        valueA,
        valueB,
        v.config,
        v.composeCode,
      );
    }
    case 'RelativeDateFilter':
      return new RelativeDateFilter(
        deserializeAttribute(v.attribute),
        v.offset,
        v.count,
        v.operator,
        v.anchor,
        v.config,
        v.composeCode,
      );
    case 'CustomFilter':
      return new CustomFilter(
        deserializeAttribute(v.attribute),
        v.jaqlExpression,
        v.config,
        v.composeCode,
      );
    default:
      return v;
  }
};

SuperJSON.registerCustom<JaqlElement, any>(
  {
    isApplicable: isJaqlElement,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeJaqlElement(v),
  },
  'JaqlElement',
);

SuperJSON.registerCustom<DimensionalAttribute, any>(
  {
    isApplicable: isDimensionalAttribute,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeDimensionalAttribute(v),
  },
  'DimensionalAttribute',
);

SuperJSON.registerCustom<DimensionalLevelAttribute, any>(
  {
    isApplicable: isDimensionalLevelAttribute,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeDimensionalLevelAttribute(v),
  },
  'DimensionalLevelAttribute',
);

SuperJSON.registerCustom<DimensionalDimension, any>(
  {
    isApplicable: isDimensionalDimension,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeDimensionalDimension(v),
  },
  'DimensionalDimension',
);

SuperJSON.registerCustom<DimensionalDateDimension, any>(
  {
    isApplicable: isDimensionalDateDimension,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeDimensionalDateDimension(v),
  },
  'DimensionalDateDimension',
);

SuperJSON.registerCustom<DimensionalBaseMeasure, any>(
  {
    isApplicable: isDimensionalBaseMeasure,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeDimensionalBaseMeasure(v),
  },
  'DimensionalBaseMeasure',
);

SuperJSON.registerCustom<DimensionalCalculatedMeasure, any>(
  {
    isApplicable: isDimensionalCalculatedMeasure,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeDimensionalCalculatedMeasure(v),
  },
  'DimensionalCalculatedMeasure',
);

SuperJSON.registerCustom<DimensionalMeasureTemplate, any>(
  {
    isApplicable: isDimensionalMeasureTemplate,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeDimensionalMeasureTemplate(v),
  },
  'DimensionalMeasureTemplate',
);

SuperJSON.registerCustom<MembersFilter, any>(
  {
    isApplicable: isMembersFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'MembersFilter',
);

SuperJSON.registerCustom<LogicalAttributeFilter, any>(
  {
    isApplicable: isLogicalAttributeFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'LogicalAttributeFilter',
);

SuperJSON.registerCustom<CascadingFilter, any>(
  {
    isApplicable: isCascadingFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'CascadingFilter',
);

SuperJSON.registerCustom<ExcludeFilter, any>(
  {
    isApplicable: isExcludeFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'ExcludeFilter',
);

// Do not register DoubleOperatorFilter as it is extended by other filters

SuperJSON.registerCustom<MeasureFilter, any>(
  {
    isApplicable: isMeasureFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'MeasureFilter',
);

SuperJSON.registerCustom<RankingFilter, any>(
  {
    isApplicable: isRankingFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'RankingFilter',
);

SuperJSON.registerCustom<NumericFilter, any>(
  {
    isApplicable: isNumericFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'NumericFilter',
);

SuperJSON.registerCustom<TextFilter, any>(
  {
    isApplicable: isTextFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'TextFilter',
);

SuperJSON.registerCustom<DateRangeFilter, any>(
  {
    isApplicable: isDateRangeFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'DateRangeFilter',
);

SuperJSON.registerCustom<RelativeDateFilter, any>(
  {
    isApplicable: isRelativeDateFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'RelativeDateFilter',
);

SuperJSON.registerCustom<CustomFilter, any>(
  {
    isApplicable: isCustomFilter,
    serialize: (v) => v.serialize(),
    deserialize: (v) => deserializeFilter(v),
  },
  'CustomFilter',
);

/**
 * Utility to stringify and parse CSDK JS objects to JSON and vice versa.
 * JS objects can contain class instances of dimensional elements (e.g., attributes/dimensions, measures, filters).
 *
 * The utility uses `superjson` under the hood.
 *
 * @internal
 */
export const CustomSuperJSON = SuperJSON;

/**
 * Type alias for the result of the `CustomSuperJSON` utility.
 *
 * @internal
 */
export type CustomSuperJSONResult = SuperJSONResult;
