import { useCallback, useEffect, useState } from 'react';
import { ContextMenuProps, MenuItemSection } from '../../../../props';
import { Menu } from './menu';
import { MenuItem } from './menu-item';
import { MenuSection } from './menu-section';
import { NestedMenuItem } from './nested-menu-item';

/**
 * Context menu
 *
 * @group Drilldown
 */
export const ContextMenu = ({
  position,
  itemSections,
  children,
  closeContextMenu,
  alignment,
}: ContextMenuProps) => {
  const [innerItemSections, setInnerItemSections] = useState(itemSections);
  const open = !!position;

  // Note: prevents the immediate removal of the "itemSections" value, which causes flickering during the menu close animation.
  useEffect(() => {
    if (itemSections) {
      setInnerItemSections(itemSections);
    }
  }, [itemSections]);

  const renderMenuItemSection = useCallback(
    (itemSection: MenuItemSection, key?: string | number) => {
      const { sectionTitle, items = [] } = itemSection;

      return (
        <div key={key ?? sectionTitle} className="csdk-menu-section">
          {sectionTitle && <MenuSection>{sectionTitle}</MenuSection>}

          {items.map((item, index) => {
            const { subItems } = item;
            const hasSubItems = subItems && subItems.length;

            if (hasSubItems) {
              return (
                <NestedMenuItem
                  key={index}
                  label={item.caption}
                  allowOpen={open}
                  style={item.style}
                  className={item.class}
                >
                  {subItems.map(renderMenuItemSection)}
                </NestedMenuItem>
              );
            }

            return (
              <MenuItem
                key={index}
                disabled={item.disabled}
                style={item.style}
                className={item.class}
                onClick={() => {
                  closeContextMenu();
                  item.onClick?.();
                }}
              >
                {item.caption}
              </MenuItem>
            );
          })}
        </div>
      );
    },
    [closeContextMenu, open],
  );

  return (
    <>
      <Menu
        position={position ?? null}
        open={open}
        onClose={closeContextMenu}
        alignment={alignment}
      >
        {innerItemSections?.map(renderMenuItemSection)}
        {children}
      </Menu>
    </>
  );
};
