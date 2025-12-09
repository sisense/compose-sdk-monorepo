import { DataSource } from '../../interfaces.js';
import { isDataSourceInfo } from '../../utils.js';
import { createAttribute } from '../attributes.js';
import { normalizeName } from '../base.js';
import { Attribute, Dimension } from '../interfaces.js';
import { DataSourceField } from '../types.js';
import { createDateDimension, createDimension } from './dimensions.js';

/**
 * Function to convert data source fields to dimensions.
 *
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
  const dataSourceConfig = isDataSourceInfo(dataSource)
    ? dataSource
    : { title: dataSource, live: false };

  const attribute =
    field.dimtype === 'datetime'
      ? createDateDimension({
          name: attributeName,
          expression: attributeId,
          dataSource: dataSourceConfig,
          description: field.description,
        })
      : createAttribute({
          name: attributeName,
          type: field.dimtype === 'text' ? 'text-attribute' : 'numeric-attribute',
          expression: attributeId,
          dataSource: dataSourceConfig,
          description: field.description,
        });

  return {
    dimension: {
      id: dimensionId,
      name: dimensionName,
      description: field.tableDescription,
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
  description?: string | null;
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
      description: dimension.description,
    };

    const safeAttributeName = ['id', 'name', 'expression'].includes(attribute.name)
      ? attribute.expression
      : normalizeName(attribute.name);

    return {
      ...acc,
      [dimension.name]: {
        ...dimensionConfig,
        [safeAttributeName]: attribute,
      },
    };
  }, {});
