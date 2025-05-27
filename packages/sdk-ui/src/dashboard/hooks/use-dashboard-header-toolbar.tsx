import { useCallback, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useThemeContext } from '@/theme-provider';
import IconButton from '@/ai/common/icon-button';
import ThreeDotsIcon from '@/ai/icons/three-dots-icon';
import { getSlightlyDifferentColor } from '@/utils/color';

export interface DashboardHeaderToolbarMenuItem {
  title: string;
  icon?: JSX.Element;
  ariaLabel?: string;
  onClick: () => void;
}

export interface UseDashboardHeaderToolbarProps {
  menuItems: DashboardHeaderToolbarMenuItem[];
}

/**
 * Hook that returns a toolbar element for dashboard header
 */
export const useDashboardHeaderToolbar = ({ menuItems }: UseDashboardHeaderToolbarProps) => {
  const { themeSettings } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const getHoverColor = useCallback(() => {
    return getSlightlyDifferentColor(themeSettings.general.backgroundColor);
  }, [themeSettings.general.backgroundColor]);

  const toolbar = useCallback(
    () => (
      <>
        {menuItems.length > 0 && (
          <IconButton
            onClick={handleClick}
            $hoverColor={getHoverColor()}
            aria-label="dashboard toolbar menu"
          >
            <ThreeDotsIcon fill={themeSettings.typography.primaryTextColor} />
          </IconButton>
        )}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.title}
              onClick={() => {
                item.onClick();
                handleClose();
              }}
              sx={{
                fontSize: '13px',
                fontFamily: themeSettings.typography.fontFamily,
                color: themeSettings.typography.primaryTextColor,
              }}
              aria-label={item.ariaLabel}
              disableRipple
            >
              {item.icon && <span className="csdk-mr-2">{item.icon}</span>}
              <div>{item.title}</div>
            </MenuItem>
          ))}
        </Menu>
      </>
    ),
    [
      anchorEl,
      getHoverColor,
      handleClick,
      handleClose,
      menuItems,
      themeSettings.typography.primaryTextColor,
      themeSettings.typography.fontFamily,
    ],
  );

  return { toolbar };
};

export default useDashboardHeaderToolbar;
