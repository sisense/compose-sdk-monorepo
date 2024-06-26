export function isSupportedWidgetTypeByDashboard(widgetType: string) {
  return widgetType !== 'plugin';
}

export const getDividerStyle = (color: string, width: number) => `${width}px solid ${color}`;
