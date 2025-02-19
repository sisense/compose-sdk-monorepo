import { CSSProperties, ReactNode } from 'react';
import MuiMenuItem from '@mui/material/MenuItem';
import { useThemeContext } from '@/theme-provider/theme-context';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from '@/const';

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
          color: DEFAULT_TEXT_COLOR,
          '&:hover': {
            backgroundColor: DEFAULT_BACKGROUND_COLOR,
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
