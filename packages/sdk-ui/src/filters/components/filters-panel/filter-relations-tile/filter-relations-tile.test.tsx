import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterRelationsTile } from './filter-relations-tile';
import { filtersMock, relationsMock } from './__mocks__/filters-and-relations-mocks';

// Mock EditPencilIcon
vi.mock('@/common/icons/edit-pencil-icon', () => ({
  EditPencilIcon: () => <svg data-testid="edit-pencil-icon" />,
}));

describe('FilterRelationsTile Component', () => {
  it('should render the component with the correct text', () => {
    render(<FilterRelationsTile relations={relationsMock} filters={filtersMock} />);

    expect(screen.getByText('filterRelations.andOrFormulaApplied')).toBeInTheDocument();
    expect(screen.getByTestId('edit-pencil-icon')).toBeInTheDocument();
  });

  it('should render tooltip on hover', async () => {
    render(<FilterRelationsTile relations={relationsMock} filters={filtersMock} />);

    const container = screen.getByText('filterRelations.andOrFormulaApplied').closest('div');

    await userEvent.hover(container as HTMLElement);

    // Wait for the tooltip to appear
    await waitFor(() => {
      expect(screen.getByTestId('filter-relations-tooltip')).toBeInTheDocument();
    });
  });
});
