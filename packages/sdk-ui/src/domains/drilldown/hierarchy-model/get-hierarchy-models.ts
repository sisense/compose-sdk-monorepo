import { DataSource } from '@sisense/sdk-data';
import { HttpClient } from '@sisense/sdk-rest-client';

import { RestApi } from '@/infra/api/rest-api';

import { HierarchyDto } from '../../widgets/components/widget-by-id/types';
import { HierarchyModel } from './hierarchy-model';
import { fromHierarchyDto as hierarchyModelTranslator } from './hierarchy-model-translator';
import { GetHierarchiesOptions } from './types';

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
  return rawHierarchies?.map((rawHierarchy: HierarchyDto) =>
    hierarchyModelTranslator(rawHierarchy),
  );
}
