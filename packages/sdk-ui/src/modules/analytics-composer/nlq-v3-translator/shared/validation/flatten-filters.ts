import { Filter, FilterRelations, FilterRelationsNode } from '@sisense/sdk-data';

function isFilterRelationsNode(node: FilterRelationsNode): node is FilterRelations {
  return (
    !Array.isArray(node) &&
    'operator' in node &&
    (node.operator === 'AND' || node.operator === 'OR') &&
    'left' in node &&
    'right' in node
  );
}

/**
 * Collects all leaf {@link Filter} instances from a filter list or relations tree.
 */
export function flattenFilters(filters: Filter[] | FilterRelations | null | undefined): Filter[] {
  if (!filters) {
    return [];
  }
  if (Array.isArray(filters)) {
    return filters.flatMap((node) => flattenFilterNode(node));
  }
  if (isFilterRelationsNode(filters)) {
    return [...flattenFilterNode(filters.left), ...flattenFilterNode(filters.right)];
  }
  return flattenFilterNode(filters);
}

function flattenFilterNode(node: FilterRelationsNode): Filter[] {
  if (Array.isArray(node)) {
    return node.flatMap((item) => flattenFilterNode(item));
  }
  if (isFilterRelationsNode(node)) {
    return [...flattenFilterNode(node.left), ...flattenFilterNode(node.right)];
  }
  return [node];
}
