/** @vitest-environment jsdom */
import { I18nextProvider } from 'react-i18next';

import { screen } from '@testing-library/react';

import { setup } from '@/__test-helpers__';
import { i18nextInstance } from '@/infra/translation/initialize-i18n.js';

import { FilterTileContainer } from './filter-tile-container.js';

const minTouchTargetStyle = { minWidth: '24px', minHeight: '24px' };

describe('FilterTileContainer', () => {
  it('should render delete button', async () => {
    setup(<FilterTileContainer renderContent={() => <></>} onDelete={() => {}} />);
    const deleteButton = await screen.findByTestId('filter-delete-button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should not render delete button if onDelete is not provided', async () => {
    setup(<FilterTileContainer renderContent={() => <></>} />);
    const deleteButton = screen.queryByTestId('filter-delete-button');
    expect(deleteButton).toBeNull();
  });

  it('should execute onDelete callback when delete button is clicked', async () => {
    const onDeleteMock = vi.fn();
    const { user } = setup(
      <FilterTileContainer renderContent={() => <></>} onDelete={onDeleteMock} />,
    );
    const deleteButton = await screen.findByTestId('filter-delete-button');
    await user.click(deleteButton);
    expect(onDeleteMock).toHaveBeenCalled();
  });

  it('should not render delete button by defult (no "onDelete" is not provided)', async () => {
    setup(<FilterTileContainer renderContent={() => <></>} />);
    const editButton = screen.queryByTestId('filter-edit-button');
    expect(editButton).toBeNull();
  });

  it('should render edit button if "onEdit" is provided', async () => {
    setup(<FilterTileContainer renderContent={() => <></>} onEdit={() => {}} />);
    const editButton = await screen.findByTestId('filter-edit-button');
    expect(editButton).toBeInTheDocument();
  });

  it('should execute "onEdit" callback when delete button is clicked', async () => {
    const onEditMock = vi.fn();
    const { user } = setup(<FilterTileContainer renderContent={() => <></>} onEdit={onEditMock} />);
    const editButton = await screen.findByTestId('filter-edit-button');
    await user.click(editButton);
    expect(onEditMock).toHaveBeenCalled();
  });

  describe('A11Y-03 minimum touch target size', () => {
    it('applies 24×24 min dimensions to expand/collapse, edit, and delete IconButtons', async () => {
      setup(
        <FilterTileContainer renderContent={() => <></>} onDelete={() => {}} onEdit={() => {}} />,
      );

      const expandHost = screen.getByTestId('expand-collapse-button');
      const expandButton = expandHost.closest('button');
      expect(expandButton).not.toBeNull();
      // expand button achieves 24×24 via p:'4px' + 16px icon (padding-based, not min-size)
      const expandStyles = window.getComputedStyle(expandButton!);
      expect(parseInt(expandStyles.paddingTop)).toBeGreaterThanOrEqual(4);
      expect(parseInt(expandStyles.paddingBottom)).toBeGreaterThanOrEqual(4);

      const editButton = await screen.findByTestId('filter-edit-button');
      expect(editButton).toHaveStyle(minTouchTargetStyle);

      const deleteButton = await screen.findByTestId('filter-delete-button');
      expect(deleteButton).toHaveStyle(minTouchTargetStyle);
    });
  });

  describe('enable/disable switch', () => {
    it('should expose an accessible name on the switch', async () => {
      setup(
        <I18nextProvider i18n={i18nextInstance}>
          <FilterTileContainer renderContent={() => <></>} onToggleDisabled={() => {}} />
        </I18nextProvider>,
      );
      const tileSwitch = await screen.findByRole('switch', { name: 'Enable/disable filter' });
      expect(tileSwitch).toHaveAttribute('aria-label', 'Enable/disable filter');
    });

    it('should expose an accessible name even without onToggleDisabled callback', async () => {
      setup(
        <I18nextProvider i18n={i18nextInstance}>
          <FilterTileContainer renderContent={() => <></>} />
        </I18nextProvider>,
      );
      const tileSwitch = await screen.findByRole('switch', { name: 'Enable/disable filter' });
      expect(tileSwitch).toHaveAttribute('aria-label', 'Enable/disable filter');
    });

    it('should call onToggleDisabled when the switch is activated', async () => {
      const onToggleDisabled = vi.fn();
      const { user } = setup(
        <I18nextProvider i18n={i18nextInstance}>
          <FilterTileContainer renderContent={() => <></>} onToggleDisabled={onToggleDisabled} />
        </I18nextProvider>,
      );
      const tileSwitch = await screen.findByRole('switch', { name: 'Enable/disable filter' });
      await user.click(tileSwitch);
      expect(onToggleDisabled).toHaveBeenCalled();
    });

    it('should be checked when filter is not disabled', async () => {
      setup(
        <I18nextProvider i18n={i18nextInstance}>
          <FilterTileContainer renderContent={() => <></>} disabled={false} />
        </I18nextProvider>,
      );
      const tileSwitch = await screen.findByRole('switch', { name: 'Enable/disable filter' });
      expect(tileSwitch).toBeChecked();
    });

    it('should be unchecked when filter is disabled', async () => {
      setup(
        <I18nextProvider i18n={i18nextInstance}>
          <FilterTileContainer renderContent={() => <></>} disabled={true} />
        </I18nextProvider>,
      );
      const tileSwitch = await screen.findByRole('switch', { name: 'Enable/disable filter' });
      expect(tileSwitch).not.toBeChecked();
    });

    it('should not render the switch when the tile is locked', async () => {
      setup(
        <I18nextProvider i18n={i18nextInstance}>
          <FilterTileContainer renderContent={() => <></>} locked={true} />
        </I18nextProvider>,
      );
      const tileSwitch = screen.queryByRole('switch');
      expect(tileSwitch).toBeNull();
    });
  });
});
