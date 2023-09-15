import { WidgetStyleOptions } from '../../types';

export enum WidgetCornerRadius {
  'Large' = '30px',
  'Medium' = '20px',
  'Small' = '10px',
}

enum WidgetShadowOpacity {
  'Light' = '0.15',
  'Medium' = '0.3',
  'Dark' = '0.7',
}

enum WidgetShadowSize {
  'Large' = '3px 12px',
  'Medium' = '2px 8px',
  'Small' = '1px 4px',
}

export enum WidgetSpaceAround {
  'Large' = '15px',
  'Medium' = '10px',
  'Small' = '5px',
  'None' = '0px',
}

export const getShadowValue = (widgetStyleOptions: WidgetStyleOptions | undefined): string => {
  if (!widgetStyleOptions || !widgetStyleOptions.shadow || !widgetStyleOptions.spaceAround) {
    return 'none';
  }

  const { shadow, spaceAround } = widgetStyleOptions;

  if (shadow in WidgetShadowOpacity && spaceAround in WidgetShadowSize) {
    // eslint-disable-next-line security/detect-object-injection
    const shadowOpacity = WidgetShadowOpacity[shadow];
    // eslint-disable-next-line security/detect-object-injection
    const shadowSize = WidgetShadowSize[spaceAround];
    return `0px ${shadowSize} rgba(9, 9, 10, ${shadowOpacity})`;
  }

  return 'none';
};
