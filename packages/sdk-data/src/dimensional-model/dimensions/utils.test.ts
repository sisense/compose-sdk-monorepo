import { DataSourceField } from '../types.js';
import { sampleEcommerceFields } from './__mocks__/sample-ecommerce-fields.js';
import { getDimensionsFromDataSourceFields } from './utils.js';

describe('getDimensionsFromDataSourceFields', () => {
  it('should return a list of dimensions', () => {
    const result = getDimensionsFromDataSourceFields(sampleEcommerceFields, 'Sample ECommerce');
    expect(result).toMatchSnapshot();
  });

  describe('reserved-key collisions (SNS-131217)', () => {
    const budgetField: DataSourceField = {
      id: '[movies.budget]',
      dimtype: 'numeric',
      type: 'dimension',
      title: 'budget',
      table: 'movies',
      column: 'budget',
      tableTitle: 'movies',
      indexed: false,
      merged: false,
    };

    /**
     * Builds a dimension without the colliding column (baseline) and one that also
     * contains a column literally named `columnName`.
     */
    const buildDimensions = (columnName: string) => {
      const collidingField: DataSourceField = {
        id: `[movies.${columnName}]`,
        dimtype: 'text',
        type: 'dimension',
        title: columnName,
        table: 'movies',
        column: columnName,
        tableTitle: 'movies',
        indexed: false,
        merged: false,
      };

      const [baseline] = getDimensionsFromDataSourceFields([budgetField], 'Movies');
      const [dimension] = getDimensionsFromDataSourceFields(
        [budgetField, collidingField],
        'Movies',
      );
      const columnAttribute = dimension.attributes.find(
        (attr) => attr.expression === `[movies.${columnName}]`,
      );
      return { baseline, dimension, columnAttribute };
    };

    // Reserved keys `createDimension` reads from its config that also surface as readable
    // dimension metadata. A column named like one of these used to overwrite the reserved
    // property with an attribute object (e.g. `dimension.title` became an object and crashed
    // React consumers such as DataSchemaBrowser).
    const readableMetadataColumnNames = [
      'id',
      'name',
      'title',
      'description',
      'type',
      'expression',
      'dataSource',
    ];

    it.each(readableMetadataColumnNames)(
      'keeps the reserved dimension property "%s" identical to a dimension without the column',
      (columnName) => {
        const { baseline, dimension, columnAttribute } = buildDimensions(columnName);

        // The colliding column is still present as a real attribute — nothing is lost.
        expect(columnAttribute).toBeDefined();
        // Introducing the column must not change the reserved property (value and type) —
        // this is the exact slot the collision would hijack with the attribute object.
        expect((dimension as unknown as Record<string, unknown>)[columnName]).toStrictEqual(
          (baseline as unknown as Record<string, unknown>)[columnName],
        );
      },
    );

    // The remaining reserved keys are config-only aliases (`desc`/`dim`/`dimtype`) or feed
    // other config paths (`sort`/`indexed`/`merged`/`attributes`/`dimensions`/`defaultAttribute`).
    // They have no distinct readable property to self-compare, but the collision must still not
    // corrupt the React-rendered string properties.
    const configOnlyColumnNames = [
      'desc',
      'dim',
      'dimtype',
      'sort',
      'indexed',
      'merged',
      'attributes',
      'dimensions',
      'defaultAttribute',
    ];

    it.each([...readableMetadataColumnNames, ...configOnlyColumnNames])(
      'keeps the React-rendered reserved properties strings when a column is named "%s"',
      (columnName) => {
        const { dimension, columnAttribute } = buildDimensions(columnName);

        expect(columnAttribute).toBeDefined();
        expect(typeof dimension.name).toBe('string');
        expect(typeof dimension.title).toBe('string');
        expect(typeof dimension.description === 'string' || dimension.description == null).toBe(
          true,
        );
      },
    );
  });
});
