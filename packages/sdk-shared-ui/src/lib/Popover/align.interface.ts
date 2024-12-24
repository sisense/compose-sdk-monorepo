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

type OffsetType = number | `${number}%`;

export interface PositioningConfig {
  points?: AlignPoints[];
  offset?: OffsetType[];
  targetOffset?: OffsetType[]; // ['30%', '40%'] - the offset targetNode by 30% of targetNode width in x and 40% of targetNode height in y
  overflow?: { adjustX?: boolean; adjustY?: boolean };
}
