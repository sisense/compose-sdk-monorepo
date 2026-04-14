import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react';

import type { Filter, Measure } from '@sisense/sdk-data';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { QueryPill } from '../query-pill';
import type { QueryPillItem } from '../types';

const pill = (label: string, extra: Record<string, unknown>): QueryPillItem => ({
  type: 'pill',
  label,
  category: 'measure',
  id: label,
  tooltipData: { position: label, ...extra } as unknown as Measure,
});

const pillManyLines: QueryPillItem = {
  type: 'pill',
  label: 'Center — many lines',
  category: 'filter',
  id: 'many',
  tooltipData: { a: 1, b: 2, c: 3, d: 4, e: 5 } as unknown as Filter,
};

const frame: CSSProperties = {
  position: 'relative',
  width: 720,
  minHeight: 420,
  border: '1px solid #c5c9d0',
  borderRadius: 8,
  background: '#f8f9fb',
  margin: 16,
  overflow: 'auto',
};

const meta: Meta = {
  title: 'Visualizations/QueryDefinition/Tooltip positioning',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'The gray panel ref is passed as tooltip boundary — tooltips clamp inside it (not just the Storybook viewport). Default placement is above; JSON with more than 3 lines prefers below.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

function TooltipPositioningDemo() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [boundary, setBoundary] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setBoundary(panelRef.current);
  }, []);

  return (
    <div ref={panelRef} style={frame}>
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <QueryPill
          item={pill('Top-left', { note: 'boundary = gray panel' })}
          tooltipBoundaryElement={boundary}
        />
      </div>
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <QueryPill item={pill('Top-right', {})} tooltipBoundaryElement={boundary} />
      </div>
      <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
        <QueryPill item={pill('Bottom-left', {})} tooltipBoundaryElement={boundary} />
      </div>
      <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
        <QueryPill item={pill('Bottom-right', {})} tooltipBoundaryElement={boundary} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <QueryPill item={pillManyLines} tooltipBoundaryElement={boundary} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 24,
          transform: 'translateX(-50%)',
        }}
      >
        <QueryPill
          item={pill('Center', { note: 'short JSON → tooltip above' })}
          tooltipBoundaryElement={boundary}
        />
      </div>
    </div>
  );
}

export const CornersAndCenter: Story = {
  render: () => <TooltipPositioningDemo />,
};
