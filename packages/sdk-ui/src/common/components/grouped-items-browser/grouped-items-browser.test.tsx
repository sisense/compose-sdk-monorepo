import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupedItemsBrowser } from './grouped-items-browser';
import type { Item, ItemsGroup } from './types';
import type { ItemActionConfig, ItemSecondaryActionConfig } from './types';

// Sample grouped items data
const groupedItems: ItemsGroup[] = [
  {
    id: 'group1',
    title: 'Group One',
    items: [
      { id: 'item1', title: 'Item One' },
      { id: 'item2', title: 'Item Two' },
    ],
  },
  {
    id: 'group2',
    title: 'Group Two',
    items: [{ id: 'item3', title: 'Item Three' }],
  },
];

// Dummy SecondaryActionButtonIcon components for group and item actions.
const DummyGroupSecondaryActionButton: React.FC<{
  group: ItemsGroup;
}> = ({ group }) => {
  return <button data-testid="group-secondary-action">{group.title} Group Action</button>;
};

const DummyItemSecondaryActionButton: React.FC<{
  item: Item;
}> = ({ item }) => {
  return <button data-testid="item-secondary-action">{item.title} Item Action</button>;
};

// Dummy action props
const dummyItemAction: ItemActionConfig = {
  onClick: vi.fn(),
};

const dummyItemSecondaryAction: ItemSecondaryActionConfig = {
  SecondaryActionButtonIcon: DummyItemSecondaryActionButton,
  onClick: vi.fn(),
};

const dummyGroupSecondaryAction = {
  SecondaryActionButtonIcon: DummyGroupSecondaryActionButton,
  onClick: vi.fn(),
};

describe('GroupedItemsBrowser', () => {
  // Reset mock function calls before each test.
  beforeEach(() => {
    dummyItemAction.onClick = vi.fn();
    dummyItemSecondaryAction.onClick = vi.fn();
    dummyGroupSecondaryAction.onClick = vi.fn();
  });

  it('renders groups and items correctly', () => {
    render(<GroupedItemsBrowser groupedItems={groupedItems} />);

    // Check that each group title is rendered.
    expect(screen.getByText('Group One')).toBeInTheDocument();
    expect(screen.getByText('Group Two')).toBeInTheDocument();

    // Since groups are open by default, check that each item is rendered.
    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
    expect(screen.getByText('Item Three')).toBeInTheDocument();
  });

  it('calls itemActionConfig on item click', () => {
    render(<GroupedItemsBrowser groupedItems={groupedItems} itemActionConfig={dummyItemAction} />);

    // Click on "Item One"
    const itemOne = screen.getByText('Item One');
    fireEvent.click(itemOne);

    // Verify that the itemActionConfig.onClick callback is called with the item.
    expect(dummyItemAction.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'item1', title: 'Item One' }),
    );
  });

  it('calls itemSecondaryActionConfig on item secondary button click', () => {
    render(
      <GroupedItemsBrowser
        groupedItems={groupedItems}
        itemSecondaryActionConfig={dummyItemSecondaryAction}
      />,
    );

    // Hover over "Item Two" to show the secondary action button.
    const itemTwo = screen.getByText('Item Two');
    fireEvent.mouseEnter(itemTwo);
    const secBtn = screen.getByTestId('item-secondary-action');
    expect(secBtn).toBeInTheDocument();

    // Click the secondary action button.
    fireEvent.click(secBtn);

    // Verify that the itemSecondaryActionConfig.onClick callback is called with the item.
    expect(dummyItemSecondaryAction.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'item2', title: 'Item Two' }),
    );
  });

  it('calls groupSecondaryActionConfig on group secondary button click', () => {
    render(
      <GroupedItemsBrowser
        groupedItems={groupedItems}
        groupSecondaryActionConfig={dummyGroupSecondaryAction}
      />,
    );

    // Hover over the group header for "Group One" to reveal its secondary action.
    const groupOneHeader = screen.getByText('Group One');
    fireEvent.mouseEnter(groupOneHeader);
    const groupSecBtn = screen.getByTestId('group-secondary-action');
    expect(groupSecBtn).toBeInTheDocument();

    // Click the secondary action button.
    fireEvent.click(groupSecBtn);

    // Verify that the groupSecondaryActionConfig.onClick callback is called with the group.
    expect(dummyGroupSecondaryAction.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'group1', title: 'Group One' }),
    );
  });

  it('toggles group collapse on header click', async () => {
    render(<GroupedItemsBrowser groupedItems={groupedItems} />);

    // Initially the items for "Group One" should be visible.
    expect(screen.getByText('Item One')).toBeInTheDocument();

    // Click on the group header for "Group One" to collapse the group.
    const groupOneHeader = screen.getByText('Group One');
    fireEvent.click(groupOneHeader);

    // After collapse, items inside "Group One" should be removed from the document.
    await waitFor(() => {
      expect(screen.queryByText('Item One')).not.toBeInTheDocument();
    });

    // Click the header again to expand.
    fireEvent.click(groupOneHeader);
    await waitFor(() => {
      expect(screen.getByText('Item One')).toBeInTheDocument();
    });
  });
});
