export enum AlignPoints {
  topLeft = 'tl',
  topCenter = 'tc',
  topRight = 'tr',
  centerLeft = 'cl',
  centerCenter = 'cc',
  centerRight = 'cr',
  bottomLeft = 'bl',
  bottomCenter = 'bc',
  bottomRight = 'br',
}

export interface PositioningConfig {
  points?: AlignPoints[];
  offset?: number[];
  targetOffset?: string[]; // ['30%', '40%'] - the offset targetNode by 30% of targetNode width in x and 40% of targetNode height in y
  overflow?: { adjustX?: boolean; adjustY?: boolean };
}
