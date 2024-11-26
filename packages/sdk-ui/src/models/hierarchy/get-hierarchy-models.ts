import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api.js';
import { HierarchyModel, hierarchyModelTranslator } from '@/models';
import { DataSource } from '@sisense/sdk-data';
import { GetHierarchiesOptions } from './types.js';

/**
 * Options for retrieving hierarchy models.
 */
export type GetHierarchyModelsOptions = GetHierarchiesOptions;

/** @internal */
export async function getHierarchyModels(
  http: HttpClient,
  options: GetHierarchyModelsOptions,
  defaultDataSource?: DataSource,
): Promise<HierarchyModel[]> {
  const api = new RestApi(http, defaultDataSource);
  const rawHierarchies = await api.getHierarchies(options);
  return rawHierarchies?.map((rawHierarchy) =>
    hierarchyModelTranslator.fromHierarchyDto(rawHierarchy),
  );
}
