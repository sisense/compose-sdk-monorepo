import get from 'lodash-es/get';
import { CompleteThemeSettings, WidgetContainerStyleOptions } from '../../types';

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
  themeSettings: CompleteThemeSettings,
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
