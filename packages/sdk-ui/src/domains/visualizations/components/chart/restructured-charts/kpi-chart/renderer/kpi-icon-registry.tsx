import { ReactElement } from 'react';

import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Check from '@mui/icons-material/Check';
import Circle from '@mui/icons-material/Circle';
import Close from '@mui/icons-material/Close';
import Flag from '@mui/icons-material/Flag';
import Info from '@mui/icons-material/Info';
import NorthEast from '@mui/icons-material/NorthEast';
import Remove from '@mui/icons-material/Remove';
import SouthEast from '@mui/icons-material/SouthEast';
import Square from '@mui/icons-material/Square';
import Star from '@mui/icons-material/Star';
import Warning from '@mui/icons-material/Warning';

import type { KpiIconName } from '@/types.js';

/*
 * Material ships no filled-primitive triangle/diamond (ChangeHistory is outlined; Diamond is a
 * jewel glyph), so the two traffic-light shapes are drawn locally on the same 24-grid.
 */
const triangleElement = (
  <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
    <path d="M12 3.5 22 20.5H2Z" />
  </svg>
);
const diamondElement = (
  <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
    <path d="M12 2 22 12 12 22 2 12Z" />
  </svg>
);

/**
 * Maps every {@link KpiIconName} to its rendered SVG element. All elements are square on a
 * 24-grid and fill with `currentColor`, so the surrounding span's `color`/`font-size` fully
 * drive them (`fontSize="inherit"` sizes the MUI icons at 1em; `ConditionalIconSvgSpan`'s
 * `& > svg` rule does the same for the local shapes). Names are the SDK's public contract --
 * the underlying source can change without an API break.
 * @internal
 */
export const KPI_ICON_ELEMENTS: Readonly<Record<KpiIconName, ReactElement>> = {
  'arrow-up': <ArrowUpward fontSize="inherit" />,
  'arrow-down': <ArrowDownward fontSize="inherit" />,
  'arrow-right': <ArrowForward fontSize="inherit" />,
  'arrow-up-right': <NorthEast fontSize="inherit" />,
  'arrow-down-right': <SouthEast fontSize="inherit" />,
  check: <Check fontSize="inherit" />,
  cross: <Close fontSize="inherit" />,
  warning: <Warning fontSize="inherit" />,
  info: <Info fontSize="inherit" />,
  minus: <Remove fontSize="inherit" />,
  circle: <Circle fontSize="inherit" />,
  triangle: triangleElement,
  diamond: diamondElement,
  square: <Square fontSize="inherit" />,
  star: <Star fontSize="inherit" />,
  flag: <Flag fontSize="inherit" />,
};
