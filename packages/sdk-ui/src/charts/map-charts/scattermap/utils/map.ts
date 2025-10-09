import { CompleteThemeSettings } from '@/index';

const DEFAULT_ANIMATION_DURATION = 250;

export function prepareFitBoundsAnimationOptions(themeSettings: CompleteThemeSettings): unknown {
  const duration =
    themeSettings.chart.animation.init.duration === 'auto'
      ? DEFAULT_ANIMATION_DURATION
      : themeSettings.chart.animation.init.duration;

  return {
    animate: duration !== 0,
    duration: duration / 1000,
  };
}

// eslint-disable-next-line no-unused-vars
export function fitMapToBounds(map: unknown, markers: unknown, options: unknown) {
  return;
}
