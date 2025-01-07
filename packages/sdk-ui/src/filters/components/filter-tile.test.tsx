/** @vitest-environment jsdom */
import { setup } from '@/__test-helpers__';
import { FilterTile } from './filter-tile';
import { screen } from '@testing-library/react';

describe('FilterTile', () => {
  it('should render delete button', async () => {
    setup(<FilterTile renderContent={() => <></>} onDelete={() => {}} />);
    const deleteButton = await screen.findByTestId('filter-delete-button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should not render delete button if onDelete is not provided', async () => {
    setup(<FilterTile renderContent={() => <></>} />);
    const deleteButton = screen.queryByTestId('filter-delete-button');
    expect(deleteButton).toBeNull();
  });

  it('should execute onDelete callback when delete button is clicked', async () => {
    const onDeleteMock = vi.fn();
    const { user } = setup(<FilterTile renderContent={() => <></>} onDelete={onDeleteMock} />);
    const deleteButton = await screen.findByTestId('filter-delete-button');
    await user.click(deleteButton);
    expect(onDeleteMock).toHaveBeenCalled();
  });

  it('should not render delete button by defult (no "onDelete" is not provided)', async () => {
    setup(<FilterTile renderContent={() => <></>} />);
    const editButton = screen.queryByTestId('filter-edit-button');
    expect(editButton).toBeNull();
  });

  it('should render edit button if "onEdit" is provided', async () => {
    setup(<FilterTile renderContent={() => <></>} onEdit={() => {}} />);
    const editButton = await screen.findByTestId('filter-edit-button');
    expect(editButton).toBeInTheDocument();
  });

  it('should execute "onEdit" callback when delete button is clicked', async () => {
    const onEditMock = vi.fn();
    const { user } = setup(<FilterTile renderContent={() => <></>} onEdit={onEditMock} />);
    const editButton = await screen.findByTestId('filter-edit-button');
    await user.click(editButton);
    expect(onEditMock).toHaveBeenCalled();
  });
});
