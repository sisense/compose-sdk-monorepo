/** @vitest-environment jsdom */
import { useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PanelCountInput } from './panel-count-input.js';

function ControlledCountInput({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return <PanelCountInput value={value} onChange={setValue} />;
}

describe('PanelCountInput', () => {
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
});
