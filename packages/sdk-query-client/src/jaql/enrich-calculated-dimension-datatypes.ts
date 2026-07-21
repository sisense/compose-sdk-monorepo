import { CALCULATED_DIMENSION_JAQL_TYPE, DataSource, MetadataItem } from '@sisense/sdk-data';

import { TranslatableError } from '../translation/translatable-error.js';
import { CalculatedDimensionParseResponse, JaqlQueryPayload } from '../types.js';

/**
 * Data type applied to a calculated-dimension filter when the server validates the formula but
 * reports no result type. Mirrors Fusion, which falls back to `text` in exactly this case.
 */
const DEFAULT_CALCULATED_DIMENSION_DATATYPE = 'text';

/**
 * Resolves a calculated-dimension formula's result data type against the server.
 *
 * Takes the filter's `dataSource`, `formula` and formula `context`, and returns the parse response
 * carrying the resolved `dataType` (or `error`/`message` for an invalid formula), or `undefined`
 * when the server returns no body.
 */
export type ParseCalculatedDimensionFn = (
  dataSource: DataSource,
  formula: string,
  context: object,
) => Promise<CalculatedDimensionParseResponse | undefined>;

/**
 * Stamps the top-level `datatype` on calculated-dimension FILTER metadata items that lack one.
 *
 * A calculated-dimension formula element has no `dim`, so the analytical engine resolves the
 * filter's value type from the element's own `datatype`; without it the query fails. The result
 * type cannot be inferred locally, so it is resolved from the server's formula parse endpoint,
 * mirroring Fusion:
 * - the parsed data type is used when the server returns one;
 * - `text` is used when the formula is valid but the server returns no type;
 * - an invalid formula fails the query, surfacing the server's message (Fusion blocks such a
 *   formula at authoring time; here it is caught when the query runs).
 *
 * Calculated dimensions used purely as dimensions (no `filter`) and filters that already carry a
 * `datatype` (for example, those created in Fusion) are left untouched. The payload metadata is
 * stamped in place — it is freshly built per query (by `getJaqlQueryPayload` and `filter.jaql()`),
 * so this is not observable by callers.
 *
 * @param jaqlPayload - The JAQL payload whose filter metadata is enriched (only `metadata` is read).
 * @param dataSource - The data source the formulas are evaluated against.
 * @param parseCalculatedDimension - Resolver for a formula's result data type.
 * @returns A promise that resolves once every calculated-dimension filter has had its `datatype`
 * stamped, or rejects when a formula fails validation.
 */
export async function enrichCalculatedDimensionDatatypes(
  jaqlPayload: Pick<JaqlQueryPayload, 'metadata'>,
  dataSource: DataSource,
  parseCalculatedDimension: ParseCalculatedDimensionFn,
): Promise<void> {
  const filtersToResolve = jaqlPayload.metadata.filter(isUnresolvedCalculatedDimensionFilter);

  await Promise.all(
    filtersToResolve.map(async (filterMetadata) => {
      const { formula, context } = filterMetadata.jaql;
      // formula/filter presence is guaranteed by isUnresolvedCalculatedDimensionFilter
      const parseResponse = await parseCalculatedDimension(
        dataSource,
        formula ?? '',
        context ?? {},
      );

      if (parseResponse?.error) {
        throw new TranslatableError('errors.calculatedDimensionFormulaInvalid', {
          message: parseResponse.message ?? '',
        });
      }

      filterMetadata.jaql.datatype =
        parseResponse?.dataType || DEFAULT_CALCULATED_DIMENSION_DATATYPE;
    }),
  );
}

/**
 * Returns whether a metadata item is a calculated-dimension filter that still needs its result
 * data type resolved (a `filter` present, but no top-level `datatype`).
 *
 * @param metadataItem - The metadata item to test.
 */
function isUnresolvedCalculatedDimensionFilter(metadataItem: MetadataItem): boolean {
  return (
    metadataItem.jaql?.type === CALCULATED_DIMENSION_JAQL_TYPE &&
    // presence, not truthiness: an empty formula must still reach the parser to surface the
    // server's invalid-formula error rather than being silently skipped
    metadataItem.jaql.formula !== undefined &&
    Boolean(metadataItem.jaql.filter) &&
    !metadataItem.jaql.datatype
  );
}
