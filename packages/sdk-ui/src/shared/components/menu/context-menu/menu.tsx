import { ReactNode, useMemo } from 'react';

import MuiMenu, { MenuProps as MuiMenuProps } from '@mui/material/Menu';

import { MenuAlignment, MenuPosition } from '@/index';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';

type MenuProps = {
  children: ReactNode;
  open: boolean;
  position: MenuPosition | null;
  onClose: () => void;
  /** @internal */
  alignment?: MenuAlignment;
};

// Converts the alignment to the anchor origin and transform origin for the MuiMenu component
const getOrigins = (
  alignment?: MenuAlignment,
): Pick<MuiMenuProps, 'anchorOrigin' | 'transformOrigin'> => {
  const horizontalTransform = alignment?.horizontal === 'right' ? 'right' : 'left';
  const verticalTransform = alignment?.vertical === 'bottom' ? 'bottom' : 'top';

  return {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: verticalTransform,
      horizontal: horizontalTransform,
    },
  };
};

export const Menu = ({ children, open, position, onClose, alignment }: MenuProps) => {
  const { themeSettings } = useThemeContext();
  const origins = useMemo(() => getOrigins(alignment), [alignment]);

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
      anchorOrigin={origins.anchorOrigin}
      transformOrigin={origins.transformOrigin}
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
