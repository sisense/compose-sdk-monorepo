import { Chart, PointLabelObject } from '@sisense/sisense-charts';

export type ParentValues = {
  direction: number;
  height: number;
  val: number;
  width: number;
  x: number;
  y: number;
};

export type LayoutPointResult = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TreemapLayoutAlgorithmContext = {
  chart: Chart;
  squarified: (parent: ParentValues, children: PointLabelObject[]) => LayoutPointResult[];
};
