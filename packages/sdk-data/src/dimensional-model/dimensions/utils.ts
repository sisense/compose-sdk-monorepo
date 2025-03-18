import { DataSource } from '../../interfaces.js';
import { createAttribute } from '../attributes.js';
import { createDimension, createDateDimension } from './dimensions.js';
import { Dimension, Attribute } from '../interfaces.js';
import { DataSourceField } from '../types.js';

/**
 * Function to convert data source fields to dimensions.
 * @param fields - The data source fields to convert.
 * @param dataSource - The data source title.
 * @returns - The dimensions created from the data source fields.
 * @internal
 */
export function getDimensionsFromDataSourceFields(
  fields: DataSourceField[],
  dataSource: DataSource,
): Dimension[] {
  const attributeEntries = fields.map((field) => createAttributeEntry(field, dataSource));

  const groupedConfigs = groupAttributesByDimension(attributeEntries);
  return Object.values(groupedConfigs).map((config) => createDimension(config));
}

/**
 * Given a DataSourceField and the data source title, creates an attribute entry
 * that includes the dimension name, attribute name, and the attribute itself.
 */
const createAttributeEntry = (
  field: DataSourceField,
  dataSource: DataSource,
): {
  dimension: DimensionDefinition;
  attribute: Attribute;
} => {
  const dimensionId = field.table;
  const dimensionName = field.tableTitle || dimensionId;
  const attributeId = field.id;
  const attributeName = field.title || attributeId;
  const dataSourceConfig = { title: dataSource, live: false };

  const attribute =
    field.dimtype === 'datetime'
      ? createDateDimension({
          name: attributeName,
          expression: attributeId,
          dataSource: dataSourceConfig,
        })
      : createAttribute({
          name: attributeName,
          type: field.dimtype === 'text' ? 'text-attribute' : 'numeric-attribute',
          expression: attributeId,
          dataSource: dataSourceConfig,
        });

  return {
    dimension: {
      id: dimensionId,
      name: dimensionName,
    },
    attribute,
  };
};

/**
 * Raw definition of a dimension taken from DataSourceField.
 */
type DimensionDefinition = {
  id: string;
  name: string;
};

type DimensionConfig = {
  expression: string;
  name: string;
} & Record<Exclude<string, 'name'>, Attribute>;

type DimensionConfigMap = Record<string, DimensionConfig>;
/**
 * Groups an array of attribute entries by their dimension name.
 * Returns an object whose keys are dimension names and values are configuration objects
 * that can be passed to createDimension.
 */
const groupAttributesByDimension = (
  entries: { dimension: DimensionDefinition; attribute: Attribute }[],
): DimensionConfigMap =>
  entries.reduce<DimensionConfigMap>((acc, { dimension, attribute }) => {
    const dimensionConfig: DimensionConfig = acc[dimension.name] || {
      name: dimension.name,
      expression: dimension.id,
    };
    return {
      ...acc,
      [dimension.name]: {
        ...dimensionConfig,
        [attribute.name]: attribute,
      },
    };
  }, {});
