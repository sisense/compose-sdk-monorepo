/** @vitest-environment jsdom */
import type { CSSProperties } from 'react';

import type Highcharts from '@sisense/sisense-charts';
import { act, render } from '@testing-library/react';

import { KpiSparkline } from './kpi-sparkline.js';
import type { SparklinePoint } from './sparkline-options.js';

const optionsSpy = vi.fn();

vi.mock('highcharts-react-official', () => ({
  default: (props: { options: Highcharts.Options; containerProps?: { style?: CSSProperties } }) => {
    optionsSpy(props.options);
    return <div data-testid="mock-highcharts-container" style={props.containerProps?.style} />;
  },
}));

const points: SparklinePoint[] = [
  { x: 1, y: 100 },
  { x: 2, y: 90 },
];

describe('KpiSparkline', () => {
  beforeEach(() => {
    optionsSpy.mockClear();
    vi.mocked(ResizeObserver).mockClear();
  });

  it('omits an explicit chart size before the cell is measured (0x0)', () => {
    render(<KpiSparkline points={points} chartType="line" color="#123456" />);

    const options = optionsSpy.mock.calls.at(-1)?.[0] as Highcharts.Options;
    expect(options.chart?.width).toBeUndefined();
    expect(options.chart?.height).toBeUndefined();
  });

  it('sets an explicit chart.width/height matching the measured cell, avoiding the sparkline-overflow bug', () => {
    const { container } = render(<KpiSparkline points={points} chartType="line" color="#123456" />);

    const sparklineArea = container.querySelector('[data-kpi-area="sparkline"]') as HTMLElement;
    Object.defineProperty(sparklineArea, 'getBoundingClientRect', {
      value: () => ({
        width: 274,
        height: 32,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
      configurable: true,
    });

    const observerCallback = vi.mocked(ResizeObserver).mock.calls[0]?.[0];
    act(() => {
      observerCallback?.([], {} as ResizeObserver);
    });

    const options = optionsSpy.mock.calls.at(-1)?.[0] as Highcharts.Options;
    expect(options.chart?.width).toBe(274);
    expect(options.chart?.height).toBe(32);
  });

  it('re-applies the explicit size when the cell resizes to a new size', () => {
    const { container } = render(<KpiSparkline points={points} chartType="line" color="#123456" />);
    const sparklineArea = container.querySelector('[data-kpi-area="sparkline"]') as HTMLElement;

    const setRect = (width: number, height: number) =>
      Object.defineProperty(sparklineArea, 'getBoundingClientRect', {
        value: () => ({
          width,
          height,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }),
        configurable: true,
      });
    const observerCallback = vi.mocked(ResizeObserver).mock.calls[0]?.[0];

    setRect(274, 32);
    act(() => {
      observerCallback?.([], {} as ResizeObserver);
    });
    expect((optionsSpy.mock.calls.at(-1)?.[0] as Highcharts.Options).chart).toMatchObject({
      width: 274,
      height: 32,
    });

    setRect(500, 120);
    act(() => {
      observerCallback?.([], {} as ResizeObserver);
    });
    expect((optionsSpy.mock.calls.at(-1)?.[0] as Highcharts.Options).chart).toMatchObject({
      width: 500,
      height: 120,
    });
  });

  it('keeps the sparkline container aria-hidden, and its wrapped Highcharts container stretches to 100% of the cell', () => {
    const { getByLabelText, getByTestId, container } = render(
      <div aria-label="card">
        <KpiSparkline points={points} chartType="line" color="#123456" />
      </div>,
    );
    const sparklineArea = container.querySelector('[data-kpi-area="sparkline"]');
    expect(sparklineArea).toHaveAttribute('aria-hidden', 'true');
    expect(getByLabelText('card')).toBeTruthy();
    expect(getByTestId('mock-highcharts-container')).toHaveStyle({
      width: '100%',
      height: '100%',
    });
  });
});
