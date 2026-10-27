/** @vitest-environment jsdom */
import { useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanelCountInput } from './panel-count-input.js';

function ControlledCountInput({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return <PanelCountInput value={value} onChange={setValue} />;
}

describe('PanelCountInput', () => {
  it('shows the placeholder it is given while the count is empty', () => {
    render(<PanelCountInput value="" onChange={() => undefined} placeholder="Enter a value" />);

    expect(screen.getByTestId('filter-widget-condition-count')).toHaveAttribute(
      'placeholder',
      'Enter a value',
    );
  });

  it('takes digits only — a typed letter never lands in the count', async () => {
    const user = userEvent.setup();
    render(<ControlledCountInput />);
    const input = screen.getByTestId('filter-widget-condition-count');

    await user.type(input, 'r2x2');

    expect(input).toHaveValue('22');
  });

  it('strips everything but digits from a pasted value', async () => {
    const user = userEvent.setup();
    render(<ControlledCountInput />);
    const input = screen.getByTestId('filter-widget-condition-count');

    await user.click(input);
    await user.paste(' 1,5 days');

    expect(input).toHaveValue('15');
  });

  it('still lets the count be emptied, to stay incomplete until Apply', async () => {
    const user = userEvent.setup();
    render(<ControlledCountInput initialValue="3" />);
    const input = screen.getByTestId('filter-widget-condition-count');

    await user.clear(input);

    expect(input).toHaveValue('');
  });

  it('drops leading zeroes, keeping a lone 0 so it can be flagged', async () => {
    const user = userEvent.setup();
    render(<ControlledCountInput />);
    const input = screen.getByTestId('filter-widget-condition-count');

    await user.type(input, '007');
    expect(input).toHaveValue('7');

    await user.clear(input);
    await user.type(input, '00');
    expect(input).toHaveValue('0');
  });

  it('caps a pasted count at 15 digits, so it is always a safe integer', async () => {
    const user = userEvent.setup();
    render(<ControlledCountInput />);
    const input = screen.getByTestId('filter-widget-condition-count');

    await user.click(input);
    await user.paste('12345678901234567890');

    expect(input).toHaveValue('123456789012345');
  });

  describe('step', () => {
    const FIVES = (value: string, delta: 1 | -1) => String(Number(value || 0) + delta * 5);

    function SteppedCountInput({ step }: { step?: (value: string, delta: 1 | -1) => string }) {
      const [value, setValue] = useState('10');
      return <PanelCountInput value={value} onChange={setValue} step={step} />;
    }

    it('steps with ArrowUp and ArrowDown through the step it is given', async () => {
      const user = userEvent.setup();
      render(<SteppedCountInput step={FIVES} />);
      const input = screen.getByTestId('filter-widget-condition-count');

      await user.click(input);
      await user.keyboard('{ArrowUp}');
      expect(input).toHaveValue('15');
      await user.keyboard('{ArrowDown}{ArrowDown}');
      expect(input).toHaveValue('5');
    });

    it('steps the stepper buttons through it as well, with the value and the direction', async () => {
      const user = userEvent.setup();
      const step = vi.fn(FIVES);
      render(<SteppedCountInput step={step} />);

      await user.click(screen.getByTestId('filter-widget-condition-count-up'));
      await user.click(screen.getByTestId('filter-widget-condition-count-down'));

      expect(step).toHaveBeenNthCalledWith(1, '10', 1);
      expect(step).toHaveBeenNthCalledWith(2, '15', -1);
    });

    it('leaves the arrow keys alone when no step is given, and nudges by one from the buttons', async () => {
      const user = userEvent.setup();
      render(<SteppedCountInput />);
      const input = screen.getByTestId('filter-widget-condition-count');

      await user.click(input);
      await user.keyboard('{ArrowUp}');
      expect(input).toHaveValue('10');
      await user.click(screen.getByTestId('filter-widget-condition-count-up'));
      expect(input).toHaveValue('11');
    });
  });

  describe('normalize', () => {
    it('replaces the digits-only rule with the one it is given', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <PanelCountInput value="" onChange={onChange} normalize={(text) => text.toUpperCase()} />,
      );

      await user.type(screen.getByTestId('filter-widget-condition-count'), 'ab');

      expect(onChange).toHaveBeenNthCalledWith(1, 'A');
      expect(onChange).toHaveBeenNthCalledWith(2, 'B');
    });
  });
});
