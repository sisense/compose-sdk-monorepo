import type { FunctionComponent, ReactNode } from 'react';

import { FILTER_CHIP_SEPARATOR } from './filter-to-readable-label';
import { QUERY_TOOLTIP_LABEL_STYLE } from './query-definition-style-constants';
import type { RelationsTooltipNode } from './types';

/** Indent of a nested AND/OR group. */
const NESTED_GROUP_INDENT_PX = 12;

/**
 * Counts the filter rows of a relations tooltip tree.
 *
 * @param node - Relations tooltip tree.
 * @returns Number of filter rows.
 * @internal
 */
export function countRelationsTooltipLines(node: RelationsTooltipNode): number {
  return 'operator' in node
    ? node.items.reduce((sum, item) => sum + countRelationsTooltipLines(item), 0)
    : 1;
}

function renderNode(node: RelationsTooltipNode, path: string): ReactNode {
  if (!('operator' in node)) {
    return (
      <div key={path}>
        <strong style={QUERY_TOOLTIP_LABEL_STYLE}>{node.column}</strong>
        {node.value ? `${FILTER_CHIP_SEPARATOR}${node.value}` : null}
      </div>
    );
  }
  const items = node.items.flatMap((item, index) => [
    ...(index > 0 ? [<div key={`${path}-${index}-operator`}>{node.operator}</div>] : []),
    renderNode(item, `${path}-${index}`),
  ]);
  if (path === 'root') {
    return items;
  }
  return (
    <div key={path}>
      <div>(</div>
      <div style={{ paddingLeft: NESTED_GROUP_INDENT_PX }}>{items}</div>
      <div>)</div>
    </div>
  );
}

type FilterRelationsTooltipProps = {
  node: RelationsTooltipNode;
};

/**
 * Filter-relations tooltip body: filter rows (column bold, then value) joined by AND/OR, with
 * nested groups in brackets.
 *
 * @param props - Component props with the relations tooltip tree.
 * @returns Tooltip body.
 * @internal
 */
export const FilterRelationsTooltip: FunctionComponent<FilterRelationsTooltipProps> = (props) => (
  <div
    className="csdk-m-0 csdk-max-h-64 csdk-overflow-auto csdk-whitespace-pre-wrap csdk-break-all"
    style={{ margin: 0 }}
  >
    {renderNode(props.node, 'root')}
  </div>
);
