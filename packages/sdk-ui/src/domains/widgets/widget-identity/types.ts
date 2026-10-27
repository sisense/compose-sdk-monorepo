import type { ChartType } from '@/types';

import type {
  CsdkPluginWidgetType,
  FusionPluginWidgetType,
  FusionWidgetType,
} from '../components/widget-by-id/types';
import type { WidgetType } from '../components/widget/types';

/**
 * Key of a built-in widget type: one per chart type plus the non-chart widget types.
 * Plugins are not built-ins; the widget type family is `WidgetType`.
 *
 * @internal
 */
export type BuiltInWidgetKey = ChartType | 'pivot' | 'text' | 'filter' | 'narrative';

/**
 * Events a widget emits to its host.
 *
 * @sisenseInternal
 */
export type WidgetInteraction =
  | 'widgetClick'
  | 'dataPointClick'
  | 'dataPointContextMenu'
  | 'dataPointsSelect';

/**
 * Declared abilities of a widget type: facts about what the widget is and does, never about a
 * dashboard feature. Each feature reads them and applies its own policy.
 *
 * Resolved values are always complete: built-in widget types declare every field, plugins declare
 * only what differs from `PLUGIN_ABILITY_DEFAULTS`.
 *
 * @sisenseInternal
 */
export interface WidgetAbilities {
  /**
   * What data the widget works with: none, the members of an attribute (filter widgets) or the
   * result of a query.
   */
  readonly data: 'none' | 'members' | 'query';
  /** Events the widget emits to the host. */
  readonly interactions: readonly WidgetInteraction[];
  /** Renders dashboard selections as highlights; when `false`, they filter its data instead. */
  readonly highlights: boolean;
  /** Accepts drilled data options from the host ("drill into"). */
  readonly drilldown: boolean;
  /** Layout facts of the widget. */
  readonly layout: {
    /** Offers the "auto height" style option (the user still switches it on). */
    readonly autoHeight: boolean;
    /** Default size of the widget body, without the header. */
    readonly defaultSize: { readonly width: number; readonly height: number };
  };
}

/**
 * Identity of one built-in widget type across the widget namespaces: the `WidgetProps` discriminator
 * (`widgetType` + `chartType`) and the Fusion widget DTO `type`, plus its declared
 * {@link WidgetAbilities}.
 *
 * Feature participation (for example Jump To Dashboard) is owned by the feature as a list of
 * {@link BuiltInWidgetKey}s or as a policy over the abilities, not by the descriptor.
 *
 * @internal
 */
export interface BuiltInWidgetDescriptor {
  /** The key this record describes. */
  readonly key: BuiltInWidgetKey;
  /** Discriminator on `WidgetProps`. */
  readonly widgetType: WidgetType;
  /** Set only when `widgetType === 'chart'`. */
  readonly chartType?: ChartType;
  /**
   * Canonical Fusion DTO `type` for this widget type. Absent for chart types that have no
   * Fusion DTO type.
   */
  readonly fusionType?: FusionWidgetType;
  /** Additional Fusion DTO `type` values read as this widget type (e.g. `'tablewidgetagg'`, `'pivot'`). */
  readonly fusionTypeAliases?: readonly FusionWidgetType[];
  /** Declared abilities of the widget type. */
  readonly abilities: WidgetAbilities;
}

/**
 * An SDK-shipped widget that travels as a Fusion plugin widget DTO (for example the Tabber).
 *
 * @internal
 */
export interface OfficialPluginWidgetDescriptor {
  /** Custom widget type used in Compose SDK (`customWidgetType`). */
  readonly csdkType: CsdkPluginWidgetType;
  /** Plugin widget type used in the Fusion widget DTO. */
  readonly fusionType: FusionPluginWidgetType;
}
