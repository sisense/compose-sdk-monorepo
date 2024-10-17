import { CSSProperties, ReactNode } from 'react';
import MuiMenuItem from '@mui/material/MenuItem';
import { useThemeContext } from '@/theme-provider/theme-context';

type MenuItemProps = {
  children: ReactNode;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
};

export const MenuItem = ({ children, disabled, style, className = '', onClick }: MenuItemProps) => {
  const { themeSettings } = useThemeContext();
  return (
    <div className={`csdk-menu-item ${className}`}>
      <MuiMenuItem
        disabled={disabled}
        sx={{
          width: '100%',
          minWidth: '170px',
          height: '29px',
          minHeight: '29px',
          fontFamily: themeSettings.typography.fontFamily,
          fontSize: '13px',
          paddingLeft: '30px',
          paddingRight: '15px',
          color: '#5b6372',
          '&:hover': {
            backgroundColor: '#f4f4f8',
          },
          ...style,
        }}
        onClick={onClick}
      >
        <div className="csdk-menu-item-content">{children}</div>
      </MuiMenuItem>
    </div>
  );
};