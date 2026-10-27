import {
  PLUGIN_ABILITY_DEFAULTS,
  WIDGET_DATA_KINDS,
  WIDGET_INTERACTIONS,
  type WidgetAbilities,
  type WidgetAbilityOverrides,
  withAbilityOverrides,
} from '@/domains/widgets/widget-identity';

type Guard<T> = (value: unknown) => value is T;

/** One validated field: its value when valid, and its path when it is ignored. */
type CheckedField<T> = { readonly value?: T; readonly invalid: readonly string[] };

type Layout = WidgetAbilities['layout'];

const ABILITY_FIELDS: readonly string[] = [
  'data',
  'interactions',
  'highlights',
  'drilldown',
  'layout',
] satisfies readonly (keyof WidgetAbilities)[];

const LAYOUT_FIELDS: readonly string[] = [
  'autoHeight',
  'defaultSize',
] satisfies readonly (keyof Layout)[];

const SIZE_FIELDS: readonly string[] = [
  'width',
  'height',
] satisfies readonly (keyof Layout['defaultSize'])[];

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOneOf =
  <T extends string>(allowed: readonly T[]): Guard<T> =>
  (value): value is T =>
    allowed.some((item) => item === value);

const isBoolean: Guard<boolean> = (value): value is boolean => typeof value === 'boolean';

const isPositiveNumber = (value: unknown): boolean =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const isDataKind = isOneOf(WIDGET_DATA_KINDS);

const isInteraction = isOneOf(WIDGET_INTERACTIONS);

const isInteractionList: Guard<WidgetAbilities['interactions']> = (
  value,
): value is WidgetAbilities['interactions'] => Array.isArray(value) && value.every(isInteraction);

const isSize: Guard<Layout['defaultSize']> = (value): value is Layout['defaultSize'] =>
  isRecord(value) && isPositiveNumber(value.width) && isPositiveNumber(value.height);

/**
 * Validates one field of an object. An absent (`undefined`) field is neither valid nor ignored.
 *
 * @param input - The object holding the field.
 * @param name - The field name.
 * @param guard - The guard the field value must pass.
 * @param pathPrefix - Prefix of the reported field path.
 * @returns The valid value, or the path of the ignored field.
 */
const checkField = <T>(
  input: Readonly<Record<string, unknown>>,
  name: string,
  guard: Guard<T>,
  pathPrefix = '',
): CheckedField<T> => {
  const value = input[name];
  if (value === undefined) {
    return { invalid: [] };
  }
  return guard(value) ? { value, invalid: [] } : { invalid: [pathPrefix + name] };
};

const unknownFields = (
  input: Readonly<Record<string, unknown>>,
  known: readonly string[],
  pathPrefix = '',
): readonly string[] =>
  Object.keys(input)
    .filter((name) => !known.includes(name))
    .map((name) => pathPrefix + name);

const validateLayout = (
  layout: unknown,
): { readonly layout?: Partial<Layout>; readonly invalid: readonly string[] } => {
  if (layout === undefined) {
    return { invalid: [] };
  }
  if (!isRecord(layout)) {
    return { invalid: ['layout'] };
  }
  const autoHeight = checkField(layout, 'autoHeight', isBoolean, 'layout.');
  const defaultSize = checkField(layout, 'defaultSize', isSize, 'layout.');
  // Keep only the declared size fields, so unknown keys never reach the resolved abilities.
  const size = defaultSize.value && {
    width: defaultSize.value.width,
    height: defaultSize.value.height,
  };
  const valid: Partial<Layout> = {
    ...(autoHeight.value !== undefined && { autoHeight: autoHeight.value }),
    ...(size && { defaultSize: size }),
  };
  return {
    ...(Object.keys(valid).length > 0 && { layout: valid }),
    invalid: [
      ...autoHeight.invalid,
      ...defaultSize.invalid,
      ...(defaultSize.value
        ? unknownFields(defaultSize.value, SIZE_FIELDS, 'layout.defaultSize.')
        : []),
      ...unknownFields(layout, LAYOUT_FIELDS, 'layout.'),
    ],
  };
};

/**
 * Validates the abilities declared by a plugin manifest, which is untrusted input.
 *
 * @param declared - The manifest's `customWidget.abilities`.
 * @returns The valid overrides and the paths of the ignored fields.
 */
const validateDeclaredAbilities = (
  declared: unknown,
): { readonly overrides: WidgetAbilityOverrides; readonly invalid: readonly string[] } => {
  if (declared === undefined) {
    return { overrides: {}, invalid: [] };
  }
  if (!isRecord(declared)) {
    return { overrides: {}, invalid: ['abilities'] };
  }
  const data = checkField(declared, 'data', isDataKind);
  const interactions = checkField(declared, 'interactions', isInteractionList);
  const highlights = checkField(declared, 'highlights', isBoolean);
  const drilldown = checkField(declared, 'drilldown', isBoolean);
  const layout = validateLayout(declared.layout);
  const overrides: WidgetAbilityOverrides = {
    ...(data.value !== undefined && { data: data.value }),
    ...(interactions.value !== undefined && { interactions: interactions.value }),
    ...(highlights.value !== undefined && { highlights: highlights.value }),
    ...(drilldown.value !== undefined && { drilldown: drilldown.value }),
    ...(layout.layout !== undefined && { layout: layout.layout }),
  };
  return {
    overrides,
    invalid: [
      ...data.invalid,
      ...interactions.invalid,
      ...highlights.invalid,
      ...drilldown.invalid,
      ...unknownFields(declared, ABILITY_FIELDS),
      ...layout.invalid,
    ],
  };
};

/**
 * Resolves the abilities of a plugin's custom widget: the manifest's `customWidget.abilities`
 * merged over `PLUGIN_ABILITY_DEFAULTS`.
 *
 * The manifest is untrusted, so each field is validated: an invalid or unknown field is ignored
 * with a console warning naming the plugin, and the default applies. Never throws.
 *
 * @param declared - The manifest's `customWidget.abilities`.
 * @param pluginName - The plugin name, for the warning.
 * @returns The complete, frozen abilities.
 * @internal
 */
export const resolvePluginAbilities = (declared: unknown, pluginName: string): WidgetAbilities => {
  const { overrides, invalid } = validateDeclaredAbilities(declared);
  if (invalid.length > 0) {
    console.warn(
      `[Plugin] Plugin "${pluginName}" declares invalid widget abilities (${invalid.join(
        ', ',
      )}); they are ignored and the defaults apply.`,
    );
  }
  return withAbilityOverrides(PLUGIN_ABILITY_DEFAULTS, overrides);
};
