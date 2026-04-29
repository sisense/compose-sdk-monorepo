import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import type { StyleOptions } from '../../types';
import { LineDesignPanel } from './LineDesignPanel';

/** Props shape passed to mocked section components (enough for `mock.calls` / `mockImplementationOnce`). */
type DesignSectionProps = Record<string, unknown> & {
  onClick?: (value: unknown) => void;
};

type SectionMock = Mock<(props: DesignSectionProps) => null>;

const {
  mockLineTypeSection,
  mockLineWidthSection,
  mockLegendSection,
  mockValueLabelSection,
  mockMarkerSection,
  mockXAxisSection,
  mockYAxisSection,
  mockAutoZoomSection,
} = vi.hoisted(() => ({
  mockLineTypeSection: vi.fn((_: DesignSectionProps) => null) as SectionMock,
  mockLineWidthSection: vi.fn((_: DesignSectionProps) => null) as SectionMock,
  mockLegendSection: vi.fn((_: DesignSectionProps) => null) as SectionMock,
  mockValueLabelSection: vi.fn((_: DesignSectionProps) => null) as SectionMock,
  mockMarkerSection: vi.fn((_: DesignSectionProps) => null) as SectionMock,
  mockXAxisSection: vi.fn((_: DesignSectionProps) => null) as SectionMock,
  mockYAxisSection: vi.fn((_: DesignSectionProps) => null) as SectionMock,
  mockAutoZoomSection: vi.fn((_: DesignSectionProps) => null) as SectionMock,
}));

vi.mock('./AutoZoomSection', () => ({ AutoZoomSection: mockAutoZoomSection }));
vi.mock('./LegendSection', () => ({ LegendSection: mockLegendSection }));
vi.mock('./LineTypeSection', () => ({ LineTypeSection: mockLineTypeSection }));
vi.mock('./LineWidthSection', () => ({ LineWidthSection: mockLineWidthSection }));
vi.mock('./MarkerSection', () => ({ MarkerSection: mockMarkerSection }));
vi.mock('./ValueLabelSection', () => ({ ValueLabelSection: mockValueLabelSection }));
vi.mock('./XAxisSection', () => ({ XAxisSection: mockXAxisSection }));
vi.mock('./YAxisSection', () => ({ YAxisSection: mockYAxisSection }));

const baseStyleOptions: StyleOptions = {
  subtype: 'line/basic',
  legend: { enabled: true },
};

// React 19 passes `undefined` as the second argument to functional components;
// access props via lastCall![0].
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const lastProps = (mockFn: SectionMock) => mockFn.mock.lastCall![0] as Record<string, unknown>;

describe('LineDesignPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without error', () => {
    expect(() =>
      render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={vi.fn()} />),
    ).not.toThrow();
  });

  it('passes subtype to LineTypeSection as lineType', () => {
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={vi.fn()} />);
    expect(lastProps(mockLineTypeSection)).toMatchObject({ lineType: 'line/basic' });
  });

  it('passes line.width to LineWidthSection as lineWidth', () => {
    render(
      <LineDesignPanel
        styleOptions={{ ...baseStyleOptions, line: { width: 3 } }}
        onChange={vi.fn()}
      />,
    );
    expect(lastProps(mockLineWidthSection)).toMatchObject({ lineWidth: 3 });
  });

  it('passes legend to LegendSection', () => {
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={vi.fn()} />);
    expect(lastProps(mockLegendSection)).toMatchObject({ legend: { enabled: true } });
  });

  it('passes xAxis to XAxisSection', () => {
    const xAxis = { enabled: true, gridLines: true };
    render(<LineDesignPanel styleOptions={{ ...baseStyleOptions, xAxis }} onChange={vi.fn()} />);
    expect(lastProps(mockXAxisSection)).toMatchObject({ xAxis });
  });

  it('passes yAxis to the first YAxisSection with sectionTitle "Y-Axis"', () => {
    const yAxis = { enabled: true };
    render(<LineDesignPanel styleOptions={{ ...baseStyleOptions, yAxis }} onChange={vi.fn()} />);
    const [firstCall] = mockYAxisSection.mock.calls;
    expect(firstCall[0]).toMatchObject({ yAxis, sectionTitle: 'Y-Axis' });
  });

  it('passes y2Axis to the second YAxisSection with sectionTitle "Y2-Axis"', () => {
    const y2Axis = { enabled: false };
    render(<LineDesignPanel styleOptions={{ ...baseStyleOptions, y2Axis }} onChange={vi.fn()} />);
    const [, secondCall] = mockYAxisSection.mock.calls;
    expect(secondCall[0]).toMatchObject({ yAxis: y2Axis, sectionTitle: 'Y2-Axis' });
  });

  it('calls onChange("subtype", value) when LineTypeSection fires onClick', () => {
    const onChange = vi.fn();
    mockLineTypeSection.mockImplementationOnce((props) => {
      props.onClick?.('line/spline');
      return null;
    });
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('subtype', 'line/spline');
  });

  it('calls onChange("line", merged object) when LineWidthSection fires onClick', () => {
    const onChange = vi.fn();
    const styleWithLine: StyleOptions = { ...baseStyleOptions, line: { width: 2 } };
    mockLineWidthSection.mockImplementationOnce((props) => {
      props.onClick?.(5);
      return null;
    });
    render(<LineDesignPanel styleOptions={styleWithLine} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('line', { width: 5 });
  });

  it('calls onChange("line", {width}) when line is undefined and LineWidthSection fires onClick', () => {
    const onChange = vi.fn();
    mockLineWidthSection.mockImplementationOnce((props) => {
      props.onClick?.(3);
      return null;
    });
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('line', { width: 3 });
  });

  it('calls onChange("legend", value) when LegendSection fires onClick', () => {
    const onChange = vi.fn();
    mockLegendSection.mockImplementationOnce((props) => {
      props.onClick?.({ enabled: false });
      return null;
    });
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('legend', { enabled: false });
  });

  it('calls onChange("seriesLabels", value) when ValueLabelSection fires onClick', () => {
    const onChange = vi.fn();
    mockValueLabelSection.mockImplementationOnce((props) => {
      props.onClick?.({ enabled: true });
      return null;
    });
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('seriesLabels', { enabled: true });
  });

  it('calls onChange("markers", value) when MarkerSection fires onClick', () => {
    const onChange = vi.fn();
    mockMarkerSection.mockImplementationOnce((props) => {
      props.onClick?.({ enabled: true });
      return null;
    });
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('markers', { enabled: true });
  });

  it('calls onChange("xAxis", value) when XAxisSection fires onClick', () => {
    const onChange = vi.fn();
    mockXAxisSection.mockImplementationOnce((props) => {
      props.onClick?.({ enabled: true, gridLines: true });
      return null;
    });
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('xAxis', { enabled: true, gridLines: true });
  });

  it('calls onChange("yAxis", value) when the first YAxisSection fires onClick', () => {
    const onChange = vi.fn();
    mockYAxisSection
      .mockImplementationOnce((props) => {
        props.onClick?.({ enabled: true });
        return null;
      })
      .mockImplementationOnce((_props) => null);
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('yAxis', { enabled: true });
  });

  it('calls onChange("y2Axis", value) when the second YAxisSection fires onClick', () => {
    const onChange = vi.fn();
    mockYAxisSection
      .mockImplementationOnce((_props) => null)
      .mockImplementationOnce((props) => {
        props.onClick?.({ enabled: true });
        return null;
      });
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('y2Axis', { enabled: true });
  });

  it('calls onChange("navigator", value) when AutoZoomSection fires onClick', () => {
    const onChange = vi.fn();
    mockAutoZoomSection.mockImplementationOnce((props) => {
      props.onClick?.({ enabled: true });
      return null;
    });
    render(<LineDesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('navigator', { enabled: true });
  });
});
