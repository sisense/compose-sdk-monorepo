/** @vitest-environment jsdom */
import { type ComponentProps, useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanelBetweenInputs } from './panel-between-inputs.js';

function ControlledBetweenInputs(
  props: Omit<
    ComponentProps<typeof PanelBetweenInputs>,
    'min' | 'max' | 'onMinChange' | 'onMaxChange'
  > & {
    initialMin?: string;
    initialMax?: string;
    onMinChange?: (next: string) => void;
    onMaxChange?: (next: string) => void;
  },
) {
  const { initialMin = '', initialMax = '', onMinChange, onMaxChange, ...rest } = props;
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  return (
    <PanelBetweenInputs
      {...rest}
      min={min}
      max={max}
      onMinChange={(next) => {
        setMin(next);
        onMinChange?.(next);
      }}
      onMaxChange={(next) => {
        setMax(next);
        onMaxChange?.(next);
      }}
    />
  );
}

describe('PanelBetweenInputs', () => {
  it('renders min and max inputs with an en-dash between them', () => {
    render(
      <PanelBetweenInputs
        min="10"
        max="20"
        onMinChange={vi.fn()}
        onMaxChange={vi.fn()}
        placeholder="Enter value..."
      />,
    );

    expect(screen.getByTestId('filter-widget-condition-between')).toBeInTheDocument();
    expect(screen.getByText('–')).toBeInTheDocument();
    expect(screen.getByTestId('filter-widget-condition-between-min')).toHaveValue('10');
    expect(screen.getByTestId('filter-widget-condition-between-max')).toHaveValue('20');
  });

  it('exposes distinct accessible names for min and max', () => {
    render(<PanelBetweenInputs min="10" max="20" onMinChange={vi.fn()} onMaxChange={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Minimum' })).toHaveAttribute(
      'data-testid',
      'filter-widget-condition-between-min',
    );
    expect(screen.getByRole('textbox', { name: 'Maximum' })).toHaveAttribute(
      'data-testid',
      'filter-widget-condition-between-max',
    );
  });

  it('forwards min and max edits separately', async () => {
    const user = userEvent.setup();
    const onMinChange = vi.fn();
    const onMaxChange = vi.fn();
    render(<ControlledBetweenInputs onMinChange={onMinChange} onMaxChange={onMaxChange} />);

    await user.type(screen.getByTestId('filter-widget-condition-between-min'), '5');
    await user.type(screen.getByTestId('filter-widget-condition-between-max'), '9');

    expect(onMinChange).toHaveBeenLastCalledWith('5');
    expect(onMaxChange).toHaveBeenLastCalledWith('9');
  });

  it('shows a full-width range order error under the row', () => {
    render(
      <PanelBetweenInputs
        min="100"
        max="50"
        onMinChange={vi.fn()}
        onMaxChange={vi.fn()}
        rangeError="Second value must be greater than the first"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Second value must be greater than the first',
    );
    expect(screen.getByTestId('filter-widget-condition-between-min')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByTestId('filter-widget-condition-between-max')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
