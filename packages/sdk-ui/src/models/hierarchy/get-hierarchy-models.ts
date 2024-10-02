import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api.js';
import { hierarchyModelTranslator } from '@/models';
import { DataSource } from '@sisense/sdk-data';
import { GetHierarchiesOptions } from './types.js';

/** @internal */
export async function getHierarchyModels(
  http: HttpClient,
  options: GetHierarchiesOptions,
  defaultDataSource?: DataSource,
) {
  const api = new RestApi(http, defaultDataSource);
  const rawHierarchies = await api.getHierarchies(options);
  return rawHierarchies?.map((rawHierarchy) =>
    hierarchyModelTranslator.fromHierarchyDto(rawHierarchy),
  );
}
