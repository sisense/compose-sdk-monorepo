/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DrillChoiceList } from './drill-choice-list.js';
import type { DrillChoiceListProps } from './drill-choice-list.js';

const ITEMS = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta', disabled: true },
  { id: 'c', label: 'Gamma' },
  { id: 'd', label: 'Delta' },
];

const renderList = (overrides: Partial<DrillChoiceListProps> = {}) => {
  const onSelect = vi.fn();
  const view = render(
    <DrillChoiceList label="Letters" items={ITEMS} onSelect={onSelect} {...overrides} />,
  );
  const group = screen.getByRole('group', { name: 'Letters' });
  const active = () => group.getAttribute('aria-activedescendant')?.split('-').pop();
  return { ...view, onSelect, group, active };
};

describe('DrillChoiceList highlight', () => {
  /* The tint is an emotion rule keyed on the row's active state, so a row's generated class tells
     whether it is styled as active — jsdom cannot resolve the palette variable behind it. */
  const styleOf = (label: string) => screen.getByRole('option', { name: label }).className;

  it('styles the active row apart from the others and moves that style with the arrow keys', async () => {
    const user = userEvent.setup();
    renderList();

    expect(styleOf('Alpha')).not.toBe(styleOf('Gamma'));
    expect(styleOf('Gamma')).toBe(styleOf('Delta'));
    const idle = styleOf('Gamma');

    await user.keyboard('{ArrowDown}');

    expect(styleOf('Gamma')).not.toBe(idle);
    expect(styleOf('Alpha')).toBe(idle);
  });
});

describe('DrillChoiceList keyboard', () => {
  it('takes focus on mount so the keys reach it', () => {
    const { group } = renderList();

    expect(group).toHaveFocus();
  });

  it('starts on the selected row, or on the first enabled row when nothing is selected', () => {
    expect(renderList({ selected: ['c'] }).active()).toBe('c');
  });

  it('starts on the first row when nothing is selected', () => {
    expect(renderList().active()).toBe('a');
  });

  it('skips disabled rows going down and up, and stops at the ends', async () => {
    const user = userEvent.setup();
    const { active } = renderList();

    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('c');
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(active()).toBe('d');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('c');
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(active()).toBe('a');
  });

  it('jumps to the first and last enabled rows with Home and End', async () => {
    const user = userEvent.setup();
    const { active } = renderList({ selected: ['c'] });

    await user.keyboard('{End}');
    expect(active()).toBe('d');
    await user.keyboard('{Home}');
    expect(active()).toBe('a');
  });

  it('picks the highlighted row with Enter or Space and never a disabled one', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderList();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith('c');
    await user.keyboard('{ }');
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).not.toHaveBeenCalledWith('b');
  });

  it('leaves other keys alone', async () => {
    const user = userEvent.setup();
    const { onSelect, active } = renderList();

    await user.keyboard('x{Tab}');

    expect(onSelect).not.toHaveBeenCalled();
    expect(active()).toBe('a');
  });

  it('falls back to the first row when a search removes the highlighted one', () => {
    const { rerender, group } = renderList({ selected: ['d'] });
    expect(group.getAttribute('aria-activedescendant')).toMatch(/-d$/);

    rerender(
      <DrillChoiceList
        label="Letters"
        items={ITEMS.slice(0, 3)}
        selected={['d']}
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('group', { name: 'Letters' }).getAttribute('aria-activedescendant'),
    ).toMatch(/-a$/);
  });

  it('has no highlight and ignores Enter when every row is disabled', async () => {
    const user = userEvent.setup();
    const { onSelect, group } = renderList({ items: [{ id: 'x', label: 'X', disabled: true }] });

    await user.keyboard('{ArrowDown}{Enter}');

    expect(group).not.toHaveAttribute('aria-activedescendant');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('picks a row by click as well', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderList();

    await user.click(screen.getByRole('option', { name: 'Delta' }));

    expect(onSelect).toHaveBeenCalledWith('d');
  });
});
