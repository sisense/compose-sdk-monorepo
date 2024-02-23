import { ClientApplication } from '../app/client-application.js';
import { createDimensionalElementFromJaql } from '../dashboard-widget/translate-widget-data-options.js';
import { TranslatableError } from '../translation/translatable-error.js';
import { DimensionalCalculatedMeasure, FormulaJaql } from '@sisense/sdk-data';

/**
 * Fetch a formula by oid from the default Sisense instance
 *
 * @internal
 * @param oid - Formula identifier in Sisense instance
 * @param app - Client application
 */
export async function fetchFormulaByOid(
  oid: string,
  app: ClientApplication,
): Promise<DimensionalCalculatedMeasure | null> {
  try {
    const formula: FormulaJaql = await app.httpClient.get(
      `api/v1/formulas/${oid}?flat=true`,
      undefined,
      { skipTrackingParam: true },
    );
    if (!formula) return null;
    // For formula jaql this function will create DimensionalCalculatedMeasure
    return createDimensionalElementFromJaql(formula) as DimensionalCalculatedMeasure;
  } catch (err) {
    throw new TranslatableError('errors.sharedFormula.failedToFetch');
  }
}

/**
 * Fetch a shared formula by name and data source from the Sisense instance
 *
 * @internal
 * @param name - Formula name/title in Sisense instance
 * @param dataSource - Data source in Sisense instance
 */
export async function fetchFormula(
  name: string,
  dataSource: string,
  app: ClientApplication,
): Promise<DimensionalCalculatedMeasure | null> {
  try {
    const formulas: FormulaJaql[] = await app.httpClient.get(
      `api/v1/formulas?datasource=${dataSource}&flat=true`,
      undefined,
      { skipTrackingParam: true },
    );
    const formula = formulas.find((f: FormulaJaql) => f.title === name);
    if (!formula) return null;
    // For formula jaql this function will create DimensionalCalculatedMeasure
    return createDimensionalElementFromJaql(formula) as DimensionalCalculatedMeasure;
  } catch (err) {
    throw new TranslatableError('errors.sharedFormula.failedToFetch');
  }
}
