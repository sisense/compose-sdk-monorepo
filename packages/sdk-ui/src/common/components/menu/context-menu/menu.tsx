import { ReactNode } from 'react';
import MuiMenu from '@mui/material/Menu';
import { useThemeContext } from '@/theme-provider/theme-context';
import { MenuPosition } from '@/index';

type MenuProps = {
  children: ReactNode;
  open: boolean;
  position: MenuPosition | null;
  onClose: () => void;
};

export const Menu = ({ children, open, position, onClose }: MenuProps) => {
  const { themeSettings } = useThemeContext();

  return (
    <MuiMenu
      MenuListProps={{
        dense: true,
        sx: {
          paddingTop: 0,
          paddingBottom: 0,
          fontFamily: themeSettings.typography.fontFamily,
        },
      }}
      anchorReference="anchorPosition"
      anchorPosition={position ?? { left: 0, top: 0 }}
      disableEnforceFocus
      disableRestoreFocus
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 0,
            border: '1px solid #bababa',
            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.3)',
            fontFamily: themeSettings.typography.fontFamily,
          },
        },
      }}
    >
      {children}
    </MuiMenu>
  );
};
