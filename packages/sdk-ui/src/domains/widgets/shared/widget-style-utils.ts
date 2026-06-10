import get from 'lodash-es/get';

import { DEFAULT_WIDGET_HEADER_HEIGHT } from '@/domains/widgets/constants';
import { CompleteThemeSettingsInternal, WidgetContainerStyleOptions } from '@/types';

export enum WidgetCornerRadius {
  'None' = '',
  'Large' = '30px',
  'Medium' = '20px',
  'Small' = '10px',
}

enum WidgetShadowOpacity {
  'None' = '',
  'Light' = '0.15',
  'Medium' = '0.3',
  'Dark' = '0.7',
}

enum WidgetShadowSize {
  'None' = '',
  'Large' = '3px 12px',
  'Medium' = '2px 8px',
  'Small' = '1px 4px',
}

export enum WidgetSpaceAround {
  'None' = '',
  'Large' = '15px',
  'Medium' = '10px',
  'Small' = '5px',
}

export const getShadowValue = (
  styleOptions: WidgetContainerStyleOptions | undefined,
  themeSettings: CompleteThemeSettingsInternal,
): string => {
  const shadow = get(styleOptions, 'shadow', themeSettings.widget.shadow);
  const spaceAround = get(styleOptions, 'spaceAround', themeSettings.widget.spaceAround);

  if (shadow === 'None' || spaceAround === 'None') {
    return 'none';
  }

  if (shadow in WidgetShadowOpacity && spaceAround in WidgetShadowSize) {
    const shadowOpacity = WidgetShadowOpacity[`${shadow}`];
    const shadowSize = WidgetShadowSize[`${spaceAround}`];

    return `0px ${shadowSize} rgba(9, 9, 10, ${shadowOpacity})`;
  }

  return 'none';
};

/**
 * Resolves the effective "space around" value, in pixels, that the widget container applies
 * as padding on each side. Reads from the widget's style options first, then falls back to
 * the theme's widget settings.
 *
 * @param styleOptions - The widget container style options.
 * @param themeSettings - The complete theme settings.
 * @returns The space around value in pixels (0 when unset or "None").
 * @internal
 */
export const getSpaceAroundPx = (
  styleOptions: WidgetContainerStyleOptions | undefined,
  themeSettings: CompleteThemeSettingsInternal,
): number => {
  const spaceAround = get(styleOptions, 'spaceAround', themeSettings.widget.spaceAround);
  return parseInt(WidgetSpaceAround[`${spaceAround}`] || '0', 10) || 0;
};

/**
 * Calculates the total non-content vertical space, in pixels, that the widget container reserves —
 * the header (when visible) plus the top and bottom "space around" padding.
 *
 * Auto-sized widget content must add this overhead to its measured content height so that the
 * visible content area (after the container subtracts its padding and header) matches the
 * content's intended height. Without it, the bottom of the content is clipped by the container's
 * `overflow: hidden`.
 *
 * @param options - The overhead height options.
 * @returns The total overhead height in pixels.
 * @internal
 */
export const getWidgetOverheadHeight = ({
  styleOptions,
  themeSettings,
  hasHeader,
}: {
  styleOptions: WidgetContainerStyleOptions | undefined;
  themeSettings: CompleteThemeSettingsInternal;
  hasHeader: boolean;
}): number => {
  const headerHeight = hasHeader ? DEFAULT_WIDGET_HEADER_HEIGHT : 0;
  return headerHeight + 2 * getSpaceAroundPx(styleOptions, themeSettings);
};
