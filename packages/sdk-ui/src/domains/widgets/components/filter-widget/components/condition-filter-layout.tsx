/**
 * Layout primitives for the Condition filter panel — chaining rows, connectors, add/remove.
 * @internal
 */
import styled from '@emotion/styled';

import { FIELD_HEIGHT, spacing, typography } from './design-tokens';
import { IconButton } from './field';
import { fwFallback, fwVar } from './field-palette';

export const CONNECTOR_WIDTH = 80;

const RULE = `color-mix(in srgb, ${fwVar('border', fwFallback.border)} 55%, ${fwVar(
  'panelBg',
  fwFallback.panelBg,
)})`;

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.m};
  align-items: stretch;
`;

export const Row = styled.div`
  display: flex;
  gap: ${spacing.m};
  align-items: flex-start;
`;

export const RowGrow = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

export const ChainBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.m};
  padding-top: 6px;
  border-top: ${spacing.borderWidth} solid ${RULE};
`;

export const ConnectorSlot = styled.div`
  flex: 0 0 ${CONNECTOR_WIDTH}px;
  width: ${CONNECTOR_WIDTH}px;
`;

export const ConnectorText = styled.span`
  display: inline-flex;
  align-items: center;
  height: ${FIELD_HEIGHT.s};
  padding: 0 ${spacing.m};
  font-size: ${typography.label.size};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
`;

export const AddCondition = styled.button`
  align-self: flex-start;
  padding: 0;
  font-family: inherit;
  font-size: ${typography.label.size};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('accent', fwFallback.accent)};
  cursor: pointer;
  background: none;
  border: 0;

  &:hover {
    text-decoration: underline;
  }
`;

export const RemoveButton = styled(IconButton)`
  flex: 0 0 ${spacing.iconM};
  align-self: flex-start;
  height: ${spacing.iconM};
  margin-top: calc((${FIELD_HEIGHT.s} - ${spacing.iconM}) / 2);
`;
