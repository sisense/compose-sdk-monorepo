import { WidgetModel } from '@/models';
import { CompleteThemeSettings } from '../types';

/** @internal */
export type WidgetPlugin<P = {}> = {
  name: string;
  component: (props: any) => any;
  createChartProps(w: WidgetModel, themeSettings: CompleteThemeSettings): P;
};
