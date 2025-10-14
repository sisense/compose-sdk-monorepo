import { Attribute, createDimensionalElementFromJaql } from '@sisense/sdk-data';

import { type HierarchyDto } from '@/widget-by-id/types';

import { type HierarchyModel } from './hierarchy-model';

/**
 * Creates a new hierarchy model from a hierarchy DTO.
 *
 * @param hierarchyDto - The hierarchy DTO to be converted to a hierarchy model
 * @internal
 */
export function fromHierarchyDto(hierarchyDto: HierarchyDto): HierarchyModel {
  const { _id: id, title, levels } = hierarchyDto;

  return {
    id,
    title,
    levels: levels.map((level) => createDimensionalElementFromJaql(level) as Attribute),
  };
}
