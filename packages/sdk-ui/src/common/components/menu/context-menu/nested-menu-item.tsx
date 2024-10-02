import { CSSProperties, ReactNode, useCallback, useRef, useState } from 'react';
import { useThemeContext } from '@/theme-provider/theme-context';
import RightArrowIcon from './right-arrow-icon';
import { Menu, MenuItem } from '@mui/material';

type NestedMenuItemProps = {
  children: ReactNode;
  label: string | ReactNode;
  allowOpen: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
};

export const NestedMenuItem = ({
  children,
  label,
  allowOpen,
  disabled,
  style,
  className = '',
}: NestedMenuItemProps) => {
  const { themeSettings } = useThemeContext();
  const menuItemRef = useRef<HTMLDivElement | null>(null);
  const nestedMenuRef = useRef<HTMLDivElement | null>(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const handleMenuItemMouseEnter = useCallback(() => {
    if (!disabled) {
      setIsSubMenuOpen(true);
    }
  }, [disabled]);
  const handleMenuItemMouseLeave = useCallback(() => setIsSubMenuOpen(false), []);
  const handleNestedMenuMouseEnter = useCallback(() => setIsSubMenuOpen(true), []);
  const handleNestedMenuMouseLeave = useCallback(() => setIsSubMenuOpen(false), []);

  const open = isSubMenuOpen && allowOpen;

  return (
    <div ref={menuItemRef} className={`csdk-menu-item ${className}`}>
      <MenuItem
        disabled={disabled}
        sx={{
          width: '100%',
          minWidth: '170px',
          height: '29px',
          minHeight: '29px',
          fontFamily: themeSettings.typography.fontFamily,
          fontSize: '13px',
          paddingLeft: '30px',
          paddingRight: '0px',
          color: '#5b6372',
          '&:hover': {
            backgroundColor: '#f4f4f8',
          },
          ...style,
        }}
        onMouseEnter={handleMenuItemMouseEnter}
        onMouseLeave={handleMenuItemMouseLeave}
      >
        <div
          className="csdk-menu-item-content"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: `space-between`,
          }}
        >
          {label}
          <RightArrowIcon />
        </div>
      </MenuItem>
      <Menu
        ref={nestedMenuRef}
        style={{ pointerEvents: 'none' }}
        anchorEl={menuItemRef.current}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        transformOrigin={{
          horizontal: 'left',
          vertical: 'top',
        }}
        open={open}
        autoFocus={false}
        disableAutoFocus
        disableEnforceFocus
        MenuListProps={{
          sx: {
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
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
        onClose={() => {
          setIsSubMenuOpen(false);
        }}
        onMouseEnter={handleNestedMenuMouseEnter}
        onMouseLeave={handleNestedMenuMouseLeave}
      >
        <div style={{ pointerEvents: 'auto' }}>{children}</div>
      </Menu>
    </div>
  );
};
