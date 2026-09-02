/**
 * The filter widget's control set — the purpose-built selector components.
 *
 * Self-contained by design: nothing here imports from the filter-widget folder above
 * it, so the primitives stay extractable if other filter UI migrates to them.
 * @internal
 */

export {
  Chip,
  Field,
  FieldInput,
  IconButton,
  SecondaryGlyph,
  Trailing,
  Value,
  resolveFieldState,
} from './field';
export type {
  FieldOwnProps,
  FieldRadius,
  FieldSize,
  FieldState,
  ResolvedFieldState,
} from './field';

export { Selector } from './selector';
export type { SelectorProps } from './selector';

export { Dropdown } from './dropdown';
export type { DropdownItem, DropdownMode, DropdownProps, DropdownScrollEvent } from './dropdown';

export { FilterSelect } from './filter-select';
export type { FilterSelectProps } from './filter-select';

export { PeriodFilter } from './period-filter';
export type { PeriodFilterProps } from './period-filter';

export { useTriggerLabel } from './use-trigger-label';
export type { TriggerLabel } from './use-trigger-label';

export { getMembersFilterSelectTriggerLabel } from './trigger-label';
export type { MembersTriggerLabelInput } from './trigger-label';

export { Icon } from './icons';
export type { IconName, IconProps } from './icons';

export {
  FIELD_HEIGHT,
  FIELD_PADDING_X,
  FIELD_RADIUS,
  controlWidth,
  panel,
  spacing,
  typography,
} from './design-tokens';

export {
  fieldPaletteVars,
  fwFallback,
  fwFieldShadow,
  fwVar,
  useFieldPalette,
} from './field-palette';
export type { FieldPalette, FilterControlStyle } from './field-palette';

export { createTextMeasurer, fitNames } from './fit-names';
export type { FittedNames, MeasureText } from './fit-names';

export { useDismiss } from './use-dismiss';
export { useFieldId } from './use-field-id';
export { useHover } from './use-hover';

export { PanelBetweenInputs } from './panel-between-inputs.js';
export type { PanelBetweenInputsProps } from './panel-between-inputs.js';

export { PanelNumberInput } from './panel-number-input.js';
export type { PanelNumberInputProps } from './panel-number-input.js';

export { ConditionFilter } from './condition-filter.js';
export type { ConditionFilterProps, ConditionKind } from './condition-filter.js';

export {
  TEXT_CHAIN_OPERATORS,
  TEXT_CONDITION_OPERATORS,
  defaultTextConditionDraft,
  filterToTextConditionDraft,
  isEditableTextConditionFilter,
  isTextConditionChainable,
  isTextConditionComplete,
  isTextConditionPrimaryFilled,
  newTextConditionRowId,
  describeTextCondition,
  summariseTextCondition,
  summariseTextConditionDraft,
  textConditionToFilter,
} from './condition-text.js';
export type {
  TextConditionConnector,
  TextConditionDraft,
  TextConditionOp,
  TextConditionOperator,
  TextConditionRow,
} from './condition-text.js';

export {
  NUMERIC_CHAIN_OPERATORS,
  NUMERIC_CONDITION_OPERATORS,
  defaultNumericConditionDraft,
  filterToNumericConditionDraft,
  isEditableNumericConditionFilter,
  isNumericConditionChainable,
  isNumericConditionComplete,
  isNumericConditionPrimaryFilled,
  newNumericConditionRowId,
  numericConditionToFilter,
  numericOperatorOf,
  describeNumericCondition,
  summariseNumericCondition,
  summariseNumericConditionDraft,
} from './condition-numeric.js';
export type {
  NumericConditionConnector,
  NumericConditionDraft,
  NumericConditionOp,
  NumericConditionOperator,
  NumericConditionRow,
  NumericConditionShape,
} from './condition-numeric.js';
