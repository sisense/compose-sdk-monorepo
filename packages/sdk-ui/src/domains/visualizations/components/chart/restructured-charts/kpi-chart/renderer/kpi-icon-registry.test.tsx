/** @vitest-environment jsdom */
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
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { KpiIconName } from '@/types.js';

import { KPI_ICON_ELEMENTS } from './kpi-icon-registry.js';

const ALL_NAMES: readonly KpiIconName[] = [
  'arrow-up',
  'arrow-down',
  'arrow-right',
  'arrow-up-right',
  'arrow-down-right',
  'check',
  'cross',
  'warning',
  'info',
  'minus',
  'circle',
  'triangle',
  'diamond',
  'square',
  'star',
  'flag',
];

// Expected MUI icon sources to verify identity; detects transposition bugs (e.g. arrow-up ↔ arrow-down).
const EXPECTED_MUI_SOURCES: Partial<Record<KpiIconName, ReactElement>> = {
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
  square: <Square fontSize="inherit" />,
  star: <Star fontSize="inherit" />,
  flag: <Flag fontSize="inherit" />,
};

describe('KPI_ICON_ELEMENTS', () => {
  it.each(ALL_NAMES)('renders a 24-grid currentColor svg for %s', (name) => {
    const { container } = render(KPI_ICON_ELEMENTS[name]);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it('covers exactly the sixteen built-in names', () => {
    expect(Object.keys(KPI_ICON_ELEMENTS).sort()).toEqual([...ALL_NAMES].sort());
  });

  // Identity tests ensure that icon names map to their correct MUI glyphs; a transposition
  // (e.g. arrow-up ↔ arrow-down) would fail the suite.
  // Object.keys widens to string[]; the cast is safe -- the literal above is keyed by KpiIconName.
  it.each(Object.keys(EXPECTED_MUI_SOURCES) as KpiIconName[])(
    'maps %s to the exact MUI glyph (path data identity)',
    (name) => {
      const registry = render(KPI_ICON_ELEMENTS[name]).container.querySelector('path');
      // Non-null is safe: `name` iterates this map's own keys.
      const expected = render(EXPECTED_MUI_SOURCES[name]!).container.querySelector('path');
      expect(registry?.getAttribute('d')).toBeTruthy();
      expect(registry?.getAttribute('d')).toBe(expected?.getAttribute('d'));
    },
  );

  it('draws the local triangle and diamond with the expected 24-grid geometry', () => {
    expect(
      render(KPI_ICON_ELEMENTS.triangle).container.querySelector('path')?.getAttribute('d'),
    ).toBe('M12 3.5 22 20.5H2Z');
    expect(
      render(KPI_ICON_ELEMENTS.diamond).container.querySelector('path')?.getAttribute('d'),
    ).toBe('M12 2 22 12 12 22 2 12Z');
  });
});
