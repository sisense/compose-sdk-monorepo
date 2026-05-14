import type { ChangeEvent, CSSProperties } from 'react';

import type { DesignPanelProps, LineSubtype } from '@sisense/sdk-ui';

import type { StyleOptions } from '../types.js';

const LINE_SUBTYPES = ['line/basic', 'line/spline', 'line/step'] as const;

const STYLES: Record<string, CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 13,
    color: '#2c3236',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    color: '#5b6b73',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#2c3236',
  },
  control: {
    height: 28,
    padding: '0 8px',
    border: '1px solid #d0d6da',
    borderRadius: 4,
    background: '#fff',
    color: '#2c3236',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    boxSizing: 'border-box',
    width: '100%',
  },
  checkbox: { width: 16, height: 16 },
};

/**
 * Design panel for the line-chart widget plugin.
 *
 * Demonstrates the recommended pattern for plugin design panels: read the
 * current `styleOptions`, render controls for the keys you want to expose,
 * and emit the full next `styleOptions` from `onChange`. Keep the panel
 * self-contained — split into sub-components only once it grows.
 */
export const DesignPanel = ({ styleOptions, onChange }: DesignPanelProps<StyleOptions>) => {
  const handleSubtypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    onChange({ ...styleOptions, subtype: value as LineSubtype });
  };

  const handleWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const width = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(width)) return;
    onChange({ ...styleOptions, line: { ...styleOptions.line, width } });
  };

  const handleLegendChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...styleOptions,
      legend: { ...styleOptions.legend, enabled: event.target.checked },
    });
  };

  return (
    <div style={STYLES.panel}>
      <label style={STYLES.field}>
        Line type
        <select
          style={STYLES.control}
          value={styleOptions.subtype ?? 'line/basic'}
          onChange={handleSubtypeChange}
        >
          {LINE_SUBTYPES.map((subtype) => (
            <option key={subtype} value={subtype}>
              {subtype}
            </option>
          ))}
        </select>
      </label>

      <label style={STYLES.field}>
        Line width
        <input
          type="number"
          min={1}
          max={10}
          style={STYLES.control}
          value={styleOptions.line?.width ?? 1}
          onChange={handleWidthChange}
        />
      </label>

      <label style={STYLES.toggle}>
        <input
          type="checkbox"
          style={STYLES.checkbox}
          checked={styleOptions.legend?.enabled ?? false}
          onChange={handleLegendChange}
        />
        Show legend
      </label>
    </div>
  );
};
