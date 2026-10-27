import type { WidgetAbilities } from '../widget-identity/types';
import type { WidgetKey } from '../widget-identity/widget-key';
import type { Condition } from './condition';

/**
 * A coloring mode a data panel input offers for its items:
 *
 * - `'single'` — one color for the item.
 * - `'range'` — a color gradient over the item's values.
 * - `'condition'` — colors chosen by conditional rules on the item's values.
 *
 * New values may be added in later versions; existing values keep their meaning.
 *
 * @group Plugin System
 * @example
 * ```ts
 * import type { DataPanelInput } from '@sisense/sdk-ui';
 * import type { DataPanelColoringMode } from '@sisense/sdk-ui/sisense-internal';
 *
 * const coloringModes: DataPanelColoringMode[] = ['single', 'range'];
 * const value: DataPanelInput = { name: 'value', type: 'measure', canColor: true, coloringModes };
 * ```
 * @sisenseInternal
 */
export type DataPanelColoringMode = 'single' | 'range' | 'condition';

/**
 * An option the editor offers in the menu of an item of a data panel input:
 *
 * - `'y2Axis'` — show the item on the secondary Y axis.
 * - `'seriesType'` — choose the series type (for example line or column) of the item.
 * - `'dataBars'` — show data bars for the item's values.
 * - `'continuous'` — treat a date item as a continuous axis. For date items only.
 * - `'nullAsZero'` — treat missing values of the item as zero.
 *
 * The SDK editor offers `'seriesType'` and `'nullAsZero'` for built-in chart types only; hosts may
 * not offer them for plugins.
 *
 * This is a closed list: new values may be added in later versions; existing values keep their
 * meaning.
 *
 * @group Plugin System
 * @example
 * ```ts
 * import type { DataPanelInput } from '@sisense/sdk-ui';
 * import type { DataPanelItemCapability } from '@sisense/sdk-ui/sisense-internal';
 *
 * const itemCapabilities: DataPanelItemCapability[] = ['y2Axis', 'dataBars'];
 * const value: DataPanelInput = { name: 'value', type: 'measure', itemCapabilities };
 * ```
 * @sisenseInternal
 */
export type DataPanelItemCapability =
  | 'y2Axis'
  | 'seriesType'
  | 'dataBars'
  | 'continuous'
  | 'nullAsZero';

/**
 * Describes one data slot (input) of a custom widget's data panel.
 *
 * Each input declares which kind of data item it accepts and how many items can be dropped into it.
 * The custom visualization receives the selected items in `dataOptions`, keyed by the input name.
 *
 * A list of inputs is a persistence format: a saved widget stores only each input's name and items,
 * and hosts may restore an input's other properties by its position in the list. So, once a widget
 * type is in use:
 *
 * - Never rename or remove an input; deprecate it instead.
 * - Add new inputs only at the end of the list; never insert or reorder inputs.
 * - Never change an input's `type`.
 * - Only ever raise `maxItems`.
 * - Only ever turn on `canColor`, `allowDimensionColor` and `canColorMembers`: they own saved data.
 *
 * @group Plugin System
 * @example
 * ```ts
 * import { DataPanelInput } from '@sisense/sdk-ui';
 *
 * const inputs: DataPanelInput[] = [
 *   { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
 *   { name: 'value', displayName: 'Value', type: 'measure', minItems: 1 },
 * ];
 * ```
 * @beta
 */
export interface DataPanelInput {
  /**
   * The name of the input, used as the key of the input's items in `dataOptions`.
   *
   * The name is a persistence key: a saved widget stores the input's items under this name, and
   * loading the widget reads them back into `dataOptions` under `camelCase(name)`. Use a camelCase
   * name, so that `camelCase(name) === name` (for example `breakBy`, not `break-by`); any other name
   * is renamed to its camelCase form after the first save and load.
   *
   * The name must not be `filters` or `color`, which hosts reserve.
   *
   * Registering a plugin logs a warning for each input name that breaks these rules.
   *
   * @example 'category'
   */
  name: string;
  /**
   * The display name of the input, shown in the data panel. Must not equal the `name` of another
   * input.
   *
   * @example 'Category'
   */
  displayName?: string;
  /**
   * The type of data item the input accepts: a dimension (attribute) or a measure.
   */
  type: 'dimension' | 'measure';
  /**
   * Whether the input also accepts items of the other type than `type`.
   *
   * - `{ mixed: false }` — the items can be dimensions or measures, but all items are of one type.
   * - `{ mixed: true }` — dimensions and measures can be combined in the input.
   *
   * Hosts that do not support it accept only items of `type`.
   *
   * @example
   * ```ts
   * { mixed: true }
   * ```
   * @sisenseInternal
   */
  acceptsBoth?: { readonly mixed: boolean };
  /**
   * The minimum number of items that must be selected.
   *
   * @example 1
   */
  minItems?: number;
  /**
   * The maximum number of items that can be selected: a whole number of at least 1. Omit for no
   * limit.
   *
   * @example 5
   */
  maxItems?: number;
  /**
   * Whether the input holds a list of items (`'array'`, the default) or at most one item
   * (`'single'`).
   *
   * For a fixed number of items, use `'array'` with `minItems` and `maxItems`.
   *
   * @sisenseInternal
   * @example 'single'
   */
  cardinality?: 'array' | 'single';
  /**
   * Whether the input accepts range measures (a lower and an upper value per data point).
   *
   * @sisenseInternal
   */
  allowRange?: boolean;
  /**
   * Whether the input also accepts a fixed number instead of a measure.
   *
   * @internal
   */
  acceptsConstant?: boolean;
  /**
   * The data types of the dimension items the input accepts. Omit to accept every data type.
   *
   * @sisenseInternal
   * @example ['datetime']
   */
  dataTypes?: readonly ('datetime' | 'text' | 'numeric')[];
  /**
   * Whether the items can be sorted.
   */
  canSort?: boolean;
  /**
   * How many items of the input can be sorted at once. Omit for no limit.
   *
   * @sisenseInternal
   */
  maxSortedItems?: number;
  /**
   * Whether the items can be formatted.
   */
  canFormat?: boolean;
  /**
   * Whether the items can be colored.
   */
  canColor?: boolean;
  /**
   * The coloring modes offered for the items when `canColor` is `true`. Defaults to `['single']`.
   *
   * @sisenseInternal
   * @example ['single', 'range']
   */
  coloringModes?: readonly DataPanelColoringMode[];
  /**
   * Whether dimension items of the input can carry a color.
   *
   * @sisenseInternal
   */
  allowDimensionColor?: boolean;
  /**
   * Whether each member of a dimension item gets its own color, listed and edited under the item
   * in the data panel (for example the categories of a pie chart).
   *
   * Hosts that do not support it do not offer member colors; the input stays a dimension input.
   *
   * @sisenseInternal
   */
  canColorMembers?: boolean;
  /**
   * The options the editor offers in the menu of each item of the input.
   *
   * @sisenseInternal
   * @example ['y2Axis', 'dataBars']
   */
  itemCapabilities?: readonly DataPanelItemCapability[];
  /**
   * When the input is shown in the data panel. Omit to always show it.
   *
   * A condition the SDK cannot read (malformed, or written for a newer SDK version) never hides the
   * input: it is shown, and registering the plugin logs a warning naming the plugin and the input.
   *
   * @example
   * ```ts
   * { path: 'styleOptions.mode', equals: 'advanced' }
   * ```
   * @sisenseInternal
   */
  visibleWhen?: Condition;
  /**
   * Whether the input is filled by the host rather than by the user. The editor shows it with a
   * masked title and its items cannot be dragged.
   *
   * @sisenseInternal
   */
  autoPopulated?: boolean;
  /**
   * A description of the input, for example for an editor tooltip.
   *
   * @sisenseInternal
   */
  description?: string;
}

/**
 * A JSON Schema object (draft 7 or later), as plain data.
 *
 * @sisenseInternal
 */
export type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Configuration of a widget type's data panel.
 *
 * @sisenseInternal
 */
export interface DataPanelConfig {
  /** Data slots, in display order. */
  readonly inputs?: readonly DataPanelInput[];
  /**
   * Cross-slot rules: for each rule, at least one of the named inputs must have items.
   *
   * @example
   * ```ts
   * [{ anyOf: ['x', 'y'] }]
   * ```
   */
  readonly constraints?: readonly { readonly anyOf: readonly string[] }[];
  /**
   * JSON Schema of the data options that are not slots (for example a mode selector). A setting
   * can show or hide slots through their `visibleWhen`.
   */
  readonly settings?: JsonSchema;
  /**
   * Names of the inputs whose items drive cross-filter selection. Names only existing dimension
   * inputs. Default: every dimension input.
   */
  readonly selection?: readonly string[];
}

/**
 * React-free description of a widget type: its identity and its data slots.
 *
 * This is the minimal skeleton a `WidgetDefinition` builds on. The widget type family is not
 * stored; it is derived from the key with `familyOfKey`.
 *
 * @internal
 */
export interface WidgetMetadata {
  /** Registry key of the widget type. */
  readonly key: WidgetKey;
  /** Human-readable name of the widget type. */
  readonly displayName: string;
  /** Short description of the widget type. */
  readonly description?: string;
  /** Data slots the widget type accepts. */
  readonly dataPanel?: {
    /** Configuration of the data panel. */
    readonly config?: DataPanelConfig;
  };
  /**
   * Resolved abilities of the widget type, always complete. Set where the definition is built, not
   * by the plugin author: built-in definitions declare them, plugin and legacy custom widget
   * definitions get `customWidget.abilities` merged over `PLUGIN_ABILITY_DEFAULTS`.
   */
  readonly abilities: WidgetAbilities;
}
