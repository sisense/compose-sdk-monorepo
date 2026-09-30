/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SwitchToChartIcon, SwitchToTableIcon } from './chart-table-toggle-icons';

describe('chart-table-toggle icons', () => {
  it('renders both glyphs as currentColor svgs for host reuse', () => {
    const { container: tableContainer } = render(<SwitchToTableIcon className="host-table" />);
    const { container: chartContainer } = render(<SwitchToChartIcon className="host-chart" />);

    const tableSvg = tableContainer.querySelector('svg');
    const chartSvg = chartContainer.querySelector('svg');

    expect(tableSvg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(tableSvg).toHaveClass('host-table');
    expect(tableSvg?.querySelector('path')).toHaveAttribute('fill', 'currentColor');

    expect(chartSvg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(chartSvg).toHaveClass('host-chart');
    expect(chartSvg?.querySelector('path')).toHaveAttribute('fill', 'currentColor');
  });
});
