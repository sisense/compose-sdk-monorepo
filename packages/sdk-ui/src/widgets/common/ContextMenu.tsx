import Divider from '@mui/material/Divider';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export type MenuPosition = {
  left: number;
  top: number;
};

export type MenuItemSection = {
  /** Optional section title */
  sectionTitle?: string;
  /** Optional list of menu items */
  items?: { key?: string; onClick?: () => void; caption: string }[];
};

export const ContextMenu = ({
  position,
  closeContextMenu,
  itemSections,
  children,
}: {
  position?: MenuPosition | null;
  closeContextMenu: () => void;
  itemSections?: MenuItemSection[];
  children?: React.ReactNode;
}) => {
  const open = !!position;

  return (
    <Menu
      MenuListProps={{ dense: true }}
      anchorReference="anchorPosition"
      anchorPosition={position ?? { left: 0, top: 0 }}
      open={open}
      onClose={closeContextMenu}
    >
      {itemSections?.map(({ sectionTitle, items }) => {
        const result = [];
        if (sectionTitle) {
          result.push(
            <ListSubheader key={`subheader_${sectionTitle}`}>{sectionTitle}</ListSubheader>,
          );
          result.push(<Divider key={`divider_${sectionTitle}`} />);
        }

        return [
          ...result,
          ...(items?.map((item) => (
            <MenuItem
              key={item.key ?? item.caption}
              onClick={() => {
                closeContextMenu();
                item.onClick?.();
              }}
            >
              {item.caption}
            </MenuItem>
          )) ?? []),
        ];
      })}

      {children}
    </Menu>
  );
};
