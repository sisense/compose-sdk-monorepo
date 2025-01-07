import {
  FilterRelationsDescription,
  isOpenBracketDescriptionNode,
  isCloseBracketDescriptionNode,
  isAttributeDescriptionNode,
  isOperatorDescriptionNode,
} from '@/utils/filter-relations';
import { TFunction } from '@sisense/sdk-common';
import { ReactNode } from 'react';

export function generateTooltipLines(
  filterRelationsDescription: FilterRelationsDescription,
  t: TFunction,
): ReactNode[] {
  const tooltipLines: ReactNode[] = [];
  let currentLine: ReactNode[] = [];
  const trimmedFilterRelationsDescription = trimUnnecessaryBrackets(filterRelationsDescription);
  trimmedFilterRelationsDescription.forEach((node) => {
    if (isOpenBracketDescriptionNode(node)) {
      currentLine.push(<>{'('}</>);
    } else if (isCloseBracketDescriptionNode(node)) {
      currentLine.push(<>{')'}</>);
    } else if (isAttributeDescriptionNode(node)) {
      currentLine.push(<i>{node.attribute}</i>);
    } else if (isOperatorDescriptionNode(node)) {
      // When encountering 'AND' or 'OR', push the current line and start a new one.
      tooltipLines.push(<>{...currentLine}</>);
      tooltipLines.push(
        <b>
          {node.operator === 'OR' ? <b>{t('filterRelations.or')}</b> : t('filterRelations.and')}
        </b>,
      );
      currentLine = [];
    }
  });
  tooltipLines.push(<>{...currentLine}</>);
  return tooltipLines;
}

/**
 * Recursively removes unnecessary "outermost" parentheses from the filter relations description.
 *
 * "Unnecessary" means a matching pair of open/close brackets that fully wraps
 * the entire expression, with no leftover operators or attributes outside.
 */
export function trimUnnecessaryBrackets(
  filterRelationsDescription: FilterRelationsDescription,
): FilterRelationsDescription {
  // If there's fewer than 2 nodes, it can't be wrapped in parentheses
  if (filterRelationsDescription.length < 2) {
    return filterRelationsDescription;
  }

  // Destructure the array into first node, middle slice, and last node
  const [first, ...rest] = filterRelationsDescription;
  const last = rest[rest.length - 1];
  const middle = rest.slice(0, -1);

  // If the first node isn't an open bracket or the last isn't a close bracket,
  // there's no "outermost" parentheses to remove
  if (!isOpenBracketDescriptionNode(first) || !isCloseBracketDescriptionNode(last)) {
    return filterRelationsDescription;
  }

  // Check if those outer parentheses fully wrap the expression inside.
  // We'll track bracket depth across the `middle` section using reduce.
  const { depth, isBalanced } = middle.reduce(
    (acc, node) => {
      // Increment or decrement depth when we see open or close brackets
      if (isOpenBracketDescriptionNode(node)) {
        return { ...acc, depth: acc.depth + 1 };
      }
      if (isCloseBracketDescriptionNode(node)) {
        const newDepth = acc.depth - 1;
        // If newDepth goes negative, it means the brackets aren't simply
        // wrapped at the outer level
        return {
          depth: newDepth,
          isBalanced: acc.isBalanced && newDepth >= 0,
        };
      }
      // For other node types, depth doesn’t change
      return acc;
    },
    { depth: 0, isBalanced: true },
  );

  // If the entire middle is properly balanced (never negative, ends in zero depth),
  // the outer brackets are truly "wrapping" the entire expression and can be removed.
  if (isBalanced && depth === 0) {
    return trimUnnecessaryBrackets(middle);
  }

  // Otherwise, it's not purely wrapped, so we leave it as is
  return filterRelationsDescription;
}
