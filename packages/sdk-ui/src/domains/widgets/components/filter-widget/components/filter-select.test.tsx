import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Member } from '@/domains/filters/components/member-filter-tile/members-reducer';

import { FilterSelect } from './filter-select';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return { ...actual, useTranslation: () => ({ t: (key: string) => key }) };
});

const MEMBERS: Member[] = [
  { key: 'France', title: 'France' },
  { key: 'Italy', title: 'Italy' },
  { key: 'Spain', title: 'Spain' },
];

const renderSelect = (overrides: Partial<Parameters<typeof FilterSelect>[0]> = {}) => {
  const onSelectMember = vi.fn();
  const view = render(
    <FilterSelect
      members={MEMBERS}
      selectedMembers={[]}
      excludeMembers={false}
      enableMultiSelection={true}
      onSelectMember={onSelectMember}
      onSelectAll={vi.fn()}
      onClearAll={vi.fn()}
      {...overrides}
    />,
  );
  return { ...view, onSelectMember };
};

const openList = () => {
  fireEvent.click(screen.getByRole('combobox'));
  return screen.getByRole('listbox');
};

describe('FilterSelect', () => {
  it('opens its list from the trigger', () => {
    renderSelect();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    openList();

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(MEMBERS.length);
  });

  it('closes on Escape', () => {
    renderSelect();
    openList();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on a pointer down outside the control', () => {
    renderSelect();
    openList();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  /**
   * The list is portaled out of the control, so containment against the trigger alone
   * would call every click on a row an outside click — the panel would vanish the instant
   * a reader tried to use it.
   */
  it('stays open when the pointer goes down inside its portaled list', () => {
    renderSelect();
    const list = openList();

    fireEvent.pointerDown(list);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('selects a member with the keyboard', () => {
    const { onSelectMember } = renderSelect();
    const combobox = screen.getByRole('combobox');

    // The first press opens; the second moves onto the first row.
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(onSelectMember).toHaveBeenCalledTimes(1);
    expect(onSelectMember.mock.calls[0][0].key).toBe('France');
    // The second argument is membership of the selection list, not "checked" — in include
    // mode a freshly picked row joins it.
    expect(onSelectMember.mock.calls[0][1]).toBe(true);
  });

  /**
   * The ✕ only renders while the control is hovered or focused, so tracking focus on the
   * input alone unmounted it exactly when a keyboard user tabbed onto it.
   */
  it('keeps the clear action mounted while focus moves onto it', () => {
    renderSelect({ selectedMembers: [{ key: 'France', title: 'France' }] });
    const combobox = screen.getByRole('combobox');

    fireEvent.focus(combobox);
    const clear = screen.getByTestId('filter-widget-select-clear');

    // Focus moving from the input onto the ✕ is still focus inside the control.
    fireEvent.blur(combobox, { relatedTarget: clear });

    expect(screen.getByTestId('filter-widget-select-clear')).toBeInTheDocument();
  });

  it('hides the clear action once focus leaves the control entirely', () => {
    renderSelect({ selectedMembers: [{ key: 'France', title: 'France' }] });
    const combobox = screen.getByRole('combobox');

    fireEvent.focus(combobox);
    expect(screen.getByTestId('filter-widget-select-clear')).toBeInTheDocument();

    fireEvent.blur(combobox, { relatedTarget: document.body });

    expect(screen.queryByTestId('filter-widget-select-clear')).not.toBeInTheDocument();
  });

  it('hides the clear action when focus goes nowhere at all', () => {
    renderSelect({ selectedMembers: [{ key: 'France', title: 'France' }] });
    const combobox = screen.getByRole('combobox');

    fireEvent.focus(combobox);
    expect(screen.getByTestId('filter-widget-select-clear')).toBeInTheDocument();

    // No relatedTarget — focus left the document rather than moving within the control.
    fireEvent.blur(combobox);

    expect(screen.queryByTestId('filter-widget-select-clear')).not.toBeInTheDocument();
  });

  it('reads a selection back in the trigger', () => {
    renderSelect({ selectedMembers: [{ key: 'France', title: 'France' }] });

    expect(screen.getByRole('combobox')).toHaveValue('France');
  });

  it('does not put a native title on a selection that already fits', async () => {
    const user = userEvent.setup();
    renderSelect({ selectedMembers: [{ key: 'France', title: 'France' }] });
    const box = screen.getByRole('combobox').parentElement;
    if (!box) {
      throw new Error('Expected combobox to have a parentElement');
    }
    expect(box).not.toHaveAttribute('title');

    await user.hover(box);

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();
  });

  it('reads the select-all state back as include-all rather than naming nothing', () => {
    renderSelect({ selectedMembers: [], excludeMembers: true });

    expect(screen.getByRole('combobox')).toHaveValue('includeAll');
  });

  // A deactivated member sits in the selection without narrowing anything, so a selection that
  // holds every value but has some turned off is NOT a filter on everything.
  it('does not read a partly deactivated selection back as include-all', () => {
    renderSelect({
      selectedMembers: [
        { key: 'France', title: 'France' },
        { key: 'Italy', title: 'Italy' },
        { key: 'Spain', title: 'Spain', inactive: true },
      ],
      totalMembersCount: 3,
    });

    expect(screen.getByRole('combobox')).toHaveValue('France, Italy, Spain');
  });

  it('still reads include-all when every member of the level is filtering', () => {
    renderSelect({
      selectedMembers: [
        { key: 'France', title: 'France' },
        { key: 'Italy', title: 'Italy' },
        { key: 'Spain', title: 'Spain' },
      ],
      totalMembersCount: 3,
    });

    expect(screen.getByRole('combobox')).toHaveValue('includeAll');
  });

  it('offers no bulk actions in single-select, since one choice is the most it can hold', () => {
    renderSelect({ enableMultiSelection: false });
    openList();

    expect(screen.queryByText('filterEditor.buttons.selectAll')).not.toBeInTheDocument();
    expect(screen.queryByText('filterEditor.buttons.clearAll')).not.toBeInTheDocument();
  });

  /**
   * The wrapper the list is portaled into is what "inside the panel" means for dismissal, so
   * it has to hug the panel. When it carried the trigger's width as a `min-width`, a field
   * wider than its panel left a band of invisible overlay beside the panel, and a pointer
   * down there read as inside and would not close the list. The band itself is a layout fact
   * jsdom cannot measure, so this guards the stretch that produced it.
   */
  it('does not stretch the portaled wrapper to the trigger width', () => {
    renderSelect({ width: 400 });
    const list = openList();

    // The wrapper is the portaled node that carries the control's palette.
    let wrapper: HTMLElement | null = list.parentElement;
    while (wrapper && !wrapper.style.getPropertyValue('--csdk-fw-bg')) {
      wrapper = wrapper.parentElement;
    }

    expect(wrapper).not.toBeNull();
    expect(wrapper!.style.minWidth).toBe('');
    expect(wrapper!.style.width).toBe('');
  });
});
