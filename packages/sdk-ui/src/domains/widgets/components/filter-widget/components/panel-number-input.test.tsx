/** @vitest-environment jsdom */
import { type ComponentProps, useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanelNumberInput } from './panel-number-input.js';

function ControlledNumberInput(
  props: Omit<ComponentProps<typeof PanelNumberInput>, 'value' | 'onChange'> & {
    initialValue?: string;
    onChange?: (next: string) => void;
  },
) {
  const { initialValue = '', onChange, ...rest } = props;
  const [value, setValue] = useState(initialValue);
  return (
    <PanelNumberInput
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe('PanelNumberInput', () => {
  it('renders as a decimal text field without a native number spinner', () => {
    render(<PanelNumberInput value="100" onChange={vi.fn()} placeholder="Enter value..." />);

    const input = screen.getByTestId('filter-widget-condition-value');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).toHaveValue('100');
  });

  it('forwards edits to onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledNumberInput onChange={onChange} />);

    await user.type(screen.getByTestId('filter-widget-condition-value'), '42.5');
    expect(onChange).toHaveBeenLastCalledWith('42.5');
  });

  it('accepts non-numeric keystrokes so validation can flag them', async () => {
    const user = userEvent.setup();
    render(<ControlledNumberInput />);

    await user.type(screen.getByTestId('filter-widget-condition-value'), 'mkk');
    expect(screen.getByTestId('filter-widget-condition-value')).toHaveValue('mkk');
  });

  it('shows a field error message when provided', () => {
    render(
      <PanelNumberInput
        value="mkk"
        onChange={vi.fn()}
        error="filterEditor.validationErrors.invalidNumber"
      />,
    );

    expect(screen.getByText('filterEditor.validationErrors.invalidNumber')).toBeInTheDocument();
  });
});
