/**
 * Layout primitives for the Condition filter panel — chaining rows, connectors, add/remove.
 * @internal
 */
import styled from '@emotion/styled';

import { FIELD_HEIGHT, FIELD_PADDING_X, FIELD_RADIUS, spacing, typography } from './design-tokens';
import type { FieldRadius } from './design-tokens';
import { IconButton } from './field';
import { fwFallback, fwVar } from './field-palette';

export const CONNECTOR_WIDTH = 80;

const RULE = fwVar('divider', fwFallback.divider);

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

/* The connector on rows after the first — the chain's one connector, chosen on the first
   row and shown here as a settled label rather than a control. It fills the same 80px slot
   as that picker, with the field's own height and text inset, so the operator column stays
   aligned; the lightest fill and no border say "not editable here". Corners follow the
   Corner Radius setting like the fields beside it. */
export const ConnectorText = styled.span<{ $radius?: FieldRadius }>`
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: ${FIELD_HEIGHT.s};
  padding: 0 ${FIELD_PADDING_X.s};
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  background: ${fwVar('surfaceMuted', fwFallback.surfaceMuted)};
  border-radius: ${({ $radius = 's' }) => FIELD_RADIUS[$radius]};
`;

/* `+ Add condition` — a text button, not a link: 28px tall with its own 12px inset, so its
   hover fill reads as a button the panel's Small controls sit with. Pulled 4px left so the
   label still lines up with the values in the fields above. The corners follow the
   widget's Corner Radius setting, like every other control in the panel. */
export const AddCondition = styled.button<{ $radius?: FieldRadius }>`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  height: ${FIELD_HEIGHT.s};
  padding: 0 12px;
  margin-inline-start: -4px;
  font-family: inherit;
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.label.lineHeight};
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: ${({ $radius = 's' }) => FIELD_RADIUS[$radius]};

  /* The widget's primary text, not the accent — this is a text button, and the accent is
     reserved for what is chosen (the selected day, Apply). Doubled so a host \`button\`
     reset cannot keep its own ink on this native button (see \`FieldInput\`, field.tsx). */
  && {
    color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  }

  &:hover {
    background: ${fwVar('surfaceMuted', fwFallback.surfaceMuted)};
  }
`;

export const RemoveButton = styled(IconButton)`
  flex: 0 0 ${spacing.iconM};
  align-self: flex-start;
  height: ${spacing.iconM};
  margin-top: calc((${FIELD_HEIGHT.s} - ${spacing.iconM}) / 2);
`;
