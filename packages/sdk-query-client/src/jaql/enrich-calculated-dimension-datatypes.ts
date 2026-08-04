import {
  CALCULATED_DIMENSION_JAQL_TYPE,
  DataSource,
  MetadataItem,
  MetadataItemJaql,
} from '@sisense/sdk-data';

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
 * This covers both forms a calculated-dimension filter takes in the payload:
 * - a FILTER, whose condition sits at the top level of its own metadata item (`jaql.filter`);
 * - a HIGHLIGHT, which `getJaqlQueryPayload` embeds into its dimension as `jaql.in.selected`. Here
 *   the engine reads the datatype off the DIMENSION element itself, so the dimension element is
 *   stamped as well as the embedded selection.
 *
 * Calculated dimensions used purely as dimensions (no `filter`, no highlight) and filters that
 * already carry a `datatype` (for example, those created in Fusion) are left untouched. The payload
 * metadata is stamped in place — it is freshly built per query (by `getJaqlQueryPayload` and
 * `filter.jaql()`), so this is not observable by callers.
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
  const jaqlsToResolve = jaqlPayload.metadata.flatMap(collectUnresolvedCalculatedDimensionJaqls);

  // A highlight produces both an unresolved dimension element and an unresolved embedded selection
  // with the same formula/context, so resolve each distinct formula/context once per run and share
  // the result across every matching node.
  const resolutionByKey = new Map<string, Promise<string>>();
  const resolveDatatype = (formula: string, context: object): Promise<string> => {
    const key = JSON.stringify({ formula, context });
    let pending = resolutionByKey.get(key);
    if (!pending) {
      pending = parseCalculatedDimension(dataSource, formula, context).then((parseResponse) => {
        if (parseResponse?.error) {
          throw new TranslatableError('errors.calculatedDimensionFormulaInvalid', {
            message: parseResponse.message ?? '',
          });
        }
        return parseResponse?.dataType || DEFAULT_CALCULATED_DIMENSION_DATATYPE;
      });
      resolutionByKey.set(key, pending);
    }
    return pending;
  };

  await Promise.all(
    jaqlsToResolve.map(async (cdJaql) => {
      // formula presence is guaranteed by needsCalculatedDimensionDatatype
      cdJaql.datatype = await resolveDatatype(cdJaql.formula ?? '', cdJaql.context ?? {});
    }),
  );
}

/**
 * Collects the calculated-dimension JAQL nodes within a metadata item that still need their result
 * data type resolved:
 * - the item's own element, when it drives a top-level `filter` OR carries an embedded highlight
 *   (`jaql.in.selected`) — the engine reads the datatype off this element in both cases;
 * - the embedded highlight node itself (`jaql.in.selected.jaql`).
 *
 * @param metadataItem - The metadata item to inspect.
 * @returns The calculated-dimension JAQL nodes (0-2) within the item that still lack a `datatype`.
 * @internal
 */
function collectUnresolvedCalculatedDimensionJaqls(metadataItem: MetadataItem): MetadataItemJaql[] {
  const jaql = metadataItem.jaql;
  const highlightJaql = jaql?.in?.selected?.jaql;
  const cdJaqls: MetadataItemJaql[] = [];

  // The element drives a filter/highlight when it either owns a top-level filter or carries an
  // embedded highlight. A calculated dimension has no `dim`, so it must carry its own `datatype`.
  const drivesFilterOrHighlight = Boolean(jaql?.filter) || Boolean(highlightJaql?.filter);
  if (drivesFilterOrHighlight && needsCalculatedDimensionDatatype(jaql)) {
    cdJaqls.push(jaql);
  }

  if (Boolean(highlightJaql?.filter) && needsCalculatedDimensionDatatype(highlightJaql)) {
    cdJaqls.push(highlightJaql!);
  }

  return cdJaqls;
}

/**
 * Returns whether a JAQL node is a calculated dimension that still needs its result data type
 * resolved (a calculated dimension with a `formula` but no `datatype`).
 *
 * @param jaql - The JAQL node to test.
 * @returns `true` when the node is a calculated dimension with a `formula` and no `datatype`.
 * @internal
 */
function needsCalculatedDimensionDatatype(jaql: MetadataItemJaql | undefined): boolean {
  return (
    jaql?.type === CALCULATED_DIMENSION_JAQL_TYPE &&
    // presence, not truthiness: an empty formula must still reach the parser to surface the
    // server's invalid-formula error rather than being silently skipped
    jaql.formula !== undefined &&
    !jaql.datatype
  );
}
