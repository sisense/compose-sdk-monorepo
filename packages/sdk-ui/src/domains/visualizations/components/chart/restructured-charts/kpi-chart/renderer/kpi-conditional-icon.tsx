import type { KpiIcon } from '@/types.js';

import {
  CONDITIONAL_ICON_EM,
  CONDITIONAL_ICON_GAP_PX,
  ConditionalIconSpan,
  ConditionalIconSvgSpan,
} from './kpi-card-styles.js';
import { KPI_ICON_ELEMENTS } from './kpi-icon-registry.js';
import type { AutoFitAffix } from './use-auto-fit-font-size.js';

/** Default grid for `svg-path` icons -- the Material 24-grid, per the public TSDoc contract. */
const DEFAULT_SVG_PATH_VIEW_BOX = '0 0 24 24';

/**
 * Defines the props of {@link KpiConditionalIcon}.
 * @internal
 */
export type KpiConditionalIconProps = {
  icon: KpiIcon;
  /** Host text color the icon inherits when it carries no `color` of its own. */
  color?: string;
};

/**
 * Renders one conditional icon next to the KPI headline value or comparison readout, switching
 * on the {@link KpiIcon} variant: `text` renders the glyph in the em-scaled span (the legacy
 * behavior); `built-in` renders the bundled SVG element; `svg-path` renders the caller's path
 * geometry on its declared grid. SVG variants fill with `currentColor`, so
 * `icon.color ?? color` drives every variant through the same span mechanism.
 * @internal
 */
export function KpiConditionalIcon({ icon, color }: KpiConditionalIconProps) {
  const iconColor = icon.color ?? color;
  if (icon.type === 'text') {
    return (
      <ConditionalIconSpan aria-hidden="true" $color={iconColor}>
        {icon.value}
      </ConditionalIconSpan>
    );
  }
  if (icon.type === 'built-in') {
    const element = KPI_ICON_ELEMENTS[icon.name];
    if (!element) {
      // TS makes this unreachable; plain-JS consumers can still pass an unknown name. Fail
      // closed (no icon), like malformed condition expressions do in `matchesCondition`.
      console.warn(`[compose-sdk] Unknown built-in KPI icon name: ${String(icon.name)}`);
      return null;
    }
    return (
      <ConditionalIconSvgSpan aria-hidden="true" $color={iconColor}>
        {element}
      </ConditionalIconSvgSpan>
    );
  }
  if (icon.type !== 'svg-path') {
    // Compile-time exhaustiveness: a new KpiIcon variant (e.g. a future 'image') must get an
    // explicit branch above -- falling through would read `.d` off a shape that lacks it. At
    // runtime (plain-JS consumers, where the annotation is erased) fail closed like the
    // unknown-name path instead of handing React a non-renderable object. Log only the type
    // tag -- serializing the whole object could leak consumer data or throw on cycles; the
    // cast widens `never` back to the shape a JS caller may actually pass.
    const exhaustiveCheck: never = icon;
    console.warn(
      `[compose-sdk] Unsupported KPI icon type: ${String(
        (exhaustiveCheck as { type?: unknown } | undefined)?.type,
      )}`,
    );
    return null;
  }
  return (
    <ConditionalIconSvgSpan aria-hidden="true" $color={iconColor}>
      <svg
        viewBox={icon.viewBox ?? DEFAULT_SVG_PATH_VIEW_BOX}
        fill="currentColor"
        focusable="false"
      >
        <path d={icon.d} />
      </svg>
    </ConditionalIconSvgSpan>
  );
}

/**
 * Builds the {@link AutoFitAffix} that budgets `icon`'s width into the headline auto-fit:
 * `text` icons are canvas-measured at their em scale (glyph widths vary); SVG variants occupy
 * a fixed {@link CONDITIONAL_ICON_EM}-square box. `extraGapPx` folds in the host's flex gap
 * (the comparison readout adds one per flex item; the value box does not).
 * @param icon - The resolved icon to budget into the fit
 * @param extraGapPx - Extra fixed gap the host layout adds around the icon, in px
 * @returns The affix entry describing the icon's width contribution
 * @internal
 */
export function toIconAffix(icon: KpiIcon, extraGapPx = 0): AutoFitAffix {
  const gapPx = CONDITIONAL_ICON_GAP_PX + extraGapPx;
  return icon.type === 'text'
    ? { text: icon.value, emScale: CONDITIONAL_ICON_EM, gapPx }
    : { widthEm: CONDITIONAL_ICON_EM, gapPx };
}
