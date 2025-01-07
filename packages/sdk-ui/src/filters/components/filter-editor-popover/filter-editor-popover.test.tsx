/** @vitest-environment jsdom */
import { screen } from '@testing-library/react';
import { filterFactory } from '@sisense/sdk-data';
import { setup } from '@/__test-helpers__';
import { FilterEditorPopover } from './filter-editor-popover';
import * as DM from '@/__test-helpers__/sample-ecommerce';

const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18']);

describe('FilterEditorPopover', () => {
  it('should render filter editor popover', async () => {
    setup(<FilterEditorPopover filter={filter} position={{ anchorEl: document.body }} />);
    const filterEditorPopover = await screen.findByTestId('filter-editor-popover');
    expect(filterEditorPopover).toBeInTheDocument();
  });

  it('should contain valid filter information in header', async () => {
    setup(<FilterEditorPopover filter={filter} position={{ anchorEl: document.body }} />);
    const headerAttribute = await screen.findByTestId('filter-editor-popover-header-attribute');
    const headerDatasource = await screen.findByTestId('filter-editor-popover-header-datasource');
    expect(headerAttribute).toHaveTextContent(filter.attribute.name);
    expect(headerDatasource).toHaveTextContent(filter.attribute.dataSource!.title);
  });

  it('should execute "onChange" callback when apply button is clicked', async () => {
    const onChangeMock = vi.fn();
    const { user } = setup(
      <FilterEditorPopover
        filter={filter}
        position={{ anchorEl: document.body }}
        onChange={onChangeMock}
      />,
    );
    const applyButton = await screen.findByTestId('filter-editor-popover-apply-button');
    await user.click(applyButton);
    expect(onChangeMock).toHaveBeenCalled();
  });

  it('should execute "onClose" callback when cancel button is clicked', async () => {
    const onCloseMock = vi.fn();
    const { user } = setup(
      <FilterEditorPopover
        filter={filter}
        position={{ anchorEl: document.body }}
        onClose={onCloseMock}
      />,
    );
    const applyButton = await screen.findByTestId('filter-editor-popover-cancel-button');
    await user.click(applyButton);
    expect(onCloseMock).toHaveBeenCalled();
  });
});
