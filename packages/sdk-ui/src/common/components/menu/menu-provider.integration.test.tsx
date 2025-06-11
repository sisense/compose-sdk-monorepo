// integration test of MenuProvider + useCombinedMenu

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuProvider } from './menu-provider';
import { useCombinedMenu } from '@/common/hooks/use-combined-menu';
import { MenuOptions } from './types';

describe('MenuProvider + useCombinedMenu', () => {
  const TestComponent = ({ menuOptions }: { menuOptions: MenuOptions }) => {
    const { openMenu } = useCombinedMenu({
      combineMenus: ([currentMenuOptions, capturedMenuOptions]) => ({
        ...currentMenuOptions,
        itemSections: currentMenuOptions.itemSections.concat(capturedMenuOptions.itemSections),
      }),
    });

    const onBeforeMenuOpen = (menuOptions: MenuOptions) => {
      openMenu(menuOptions);
      return null;
    };

    return (
      <MenuProvider onBeforeMenuOpen={onBeforeMenuOpen}>
        <div>
          <button
            data-testid="open-menu-button"
            onClick={() => {
              openMenu(menuOptions);
            }}
          />
        </div>
      </MenuProvider>
    );
  };
  it('should open the combined menu and close it when an item is clicked', async () => {
    const result = render(
      <MenuProvider>
        <TestComponent
          menuOptions={{
            position: {
              left: 42,
              top: 69,
            },
            itemSections: [{ sectionTitle: 'Some Section', items: [{ caption: 'Menu item 1' }] }],
          }}
        />
      </MenuProvider>,
    );
    const openMenuButton = result.getByTestId('open-menu-button');
    expect(openMenuButton).not.toBeNull();
    openMenuButton.click();

    await waitFor(() => {
      expect(result.getByRole('menu')).toBeInTheDocument();
      expect(result.getByText('Some Section')).toBeInTheDocument();
      expect(result.getByText('Menu item 1')).toBeInTheDocument();
    });

    //close the menu
    result.getByText('Menu item 1').click();
    await waitFor(() => {
      expect(result.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('should open the combined menu with the nested menu items, and close it when an item is clicked', async () => {
    const result = render(
      <MenuProvider>
        <TestComponent
          menuOptions={{
            position: {
              left: 42,
              top: 69,
            },
            itemSections: [
              {
                sectionTitle: 'Some Section',
                items: [
                  {
                    caption: 'Menu item 1',
                    subItems: [
                      {
                        sectionTitle: 'Nested Section',
                        items: [{ caption: 'Nested Menu item 1' }],
                      },
                    ],
                  },
                ],
              },
            ],
          }}
        />
      </MenuProvider>,
    );
    const openMenuButton = result.getByTestId('open-menu-button');
    expect(openMenuButton).not.toBeNull();
    openMenuButton.click();

    await waitFor(() => {
      expect(result.getByRole('menu')).toBeInTheDocument();
      expect(result.getByText('Some Section')).toBeInTheDocument();
      expect(result.getByText('Menu item 1')).toBeInTheDocument();
    });

    // hover on 'Menu item 1' to open the nested menu
    await userEvent.hover(result.getByText('Menu item 1'));

    await waitFor(() => {
      // nested menu should be open together with the parent menu
      expect(result.getByRole('menu')).toBeInTheDocument();
      expect(result.getByText('Some Section')).toBeInTheDocument();
      expect(result.getByText('Menu item 1')).toBeInTheDocument();
      expect(result.getByText('Nested Section')).toBeInTheDocument();
      expect(result.getByText('Nested Menu item 1')).toBeInTheDocument();
    });

    // re-hover on 'Nested Menu item 1'
    await userEvent.hover(result.getByText('Nested Menu item 1'));
    await waitFor(() => {
      // nested menu should still be open
      expect(result.getByText('Nested Section')).toBeInTheDocument();
      expect(result.getByText('Nested Menu item 1')).toBeInTheDocument();
    });

    // unhover on 'Menu item 1' to hide the nested menu
    await userEvent.unhover(result.getByText('Nested Menu item 1'));
    await waitFor(() => {
      // nested menu should be closed, original menu should still be open
      expect(result.queryByText('Nested Section')).not.toBeInTheDocument();
      expect(result.queryByText('Nested Menu item 1')).not.toBeInTheDocument();
    });

    // hover again on 'Menu item 1' to open the nested menu
    await userEvent.hover(result.getByText('Menu item 1'));
    await waitFor(() => {
      // nested menu should be open again
      expect(result.getByText('Nested Section')).toBeInTheDocument();
      expect(result.getByText('Nested Menu item 1')).toBeInTheDocument();
    });
    // unhover on 'Menu item 1' to hide the nested menu
    await userEvent.unhover(result.getByText('Menu item 1'));
    await waitFor(() => {
      // nested menu should be closed, original menu should still be open
      expect(result.getByRole('menu')).toBeInTheDocument();
      expect(result.getByText('Some Section')).toBeInTheDocument();
      expect(result.getByText('Menu item 1')).toBeInTheDocument();
      expect(result.queryByText('Nested Section')).not.toBeInTheDocument();
      expect(result.queryByText('Nested Menu item 1')).not.toBeInTheDocument();
    });

    // hover again on 'Menu item 1' to open the nested menu
    // click on 'Nested Menu item 1' to close the menu
    await userEvent.hover(result.getByText('Menu item 1'));
    result.getByText('Nested Menu item 1').click();
    await waitFor(() => {
      expect(result.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
