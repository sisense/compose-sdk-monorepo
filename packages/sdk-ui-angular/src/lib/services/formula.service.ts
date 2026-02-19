import { Injectable } from '@angular/core';
import type { CalculatedMeasure } from '@sisense/sdk-data';
import {
  HookAdapter,
  type SharedFormulaState,
  useGetSharedFormulaInternal,
  type UseGetSharedFormulaParams as UseGetSharedFormulaParamsPreact,
} from '@sisense/sdk-ui-preact';

import { createSisenseContextConnector } from '../component-wrapper-helpers';
import { TrackableService } from '../decorators/trackable.decorator';
import { SisenseContextService } from './sisense-context.service';

/**
 * Parameters for retrieving a shared formula.
 */
export interface GetSharedFormulaParams extends Omit<UseGetSharedFormulaParamsPreact, 'enabled'> {}

/**
 * Service for working with shared formulas.
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<FormulaService>(['getSharedFormula'])
export class FormulaService {
  constructor(private sisenseContextService: SisenseContextService) {}

  /**
   * Fetch a [shared formula](https://docs.sisense.com/main/SisenseLinux/shared-formulas.htm) from a Fusion instance.
   *
   * The formula can be identified either by `oid` or by `name` and `dataSource` pair.
   *
   * When the retrieval is successful but the shared formula is not found, the result is `null`. When the retrieval is not successful, the promise is rejected with an error.
   *
   * ## Example
   *
   * Retrieve a shared formula by oid:
   *
   * ```ts
   * try {
   *   const formula = await formulaService.getSharedFormula({
   *     oid: 'd61c337b-fabc-4e9e-b4cc-a30116857153',
   *   });
   *
   *   if (formula) {
   *     console.log('Formula found:', formula);
   *   } else {
   *     console.log('Formula not found');
   *   }
   * } catch (error) {
   *   console.error('Error:', error);
   * }
   * ```
   *
   * ## Example
   *
   * Retrieve a shared formula by name and data source:
   *
   * ```ts
   * try {
   *   const formula = await formulaService.getSharedFormula({
   *     name: 'My Shared Formula',
   *     dataSource: DM.DataSource,
   *   });
   *
   *   if (formula) {
   *     console.log('Formula found:', formula);
   *   } else {
   *     console.log('Formula not found');
   *   }
   * } catch (error) {
   *   console.error('Error:', error);
   * }
   * ```
   *
   * @param params - Parameters for retrieving the shared formula. Must include either `oid` or both `name` and `dataSource`.
   * @returns Promise that resolves to the shared formula, or `null` if not found
   */
  async getSharedFormula(params: GetSharedFormulaParams): Promise<CalculatedMeasure | null> {
    const hookAdapter = new HookAdapter(useGetSharedFormulaInternal, [
      createSisenseContextConnector(this.sisenseContextService),
    ]);

    const resultPromise = new Promise<CalculatedMeasure | null>((resolve, reject) => {
      hookAdapter.subscribe((res: SharedFormulaState) => {
        const { formula, isError, isSuccess, error } = res;

        if (isError) {
          reject(error);
        } else if (isSuccess) {
          resolve(formula ?? null);
        }
      });
    });

    hookAdapter.run(params);

    return resultPromise.finally(() => {
      hookAdapter.destroy();
    });
  }
}
