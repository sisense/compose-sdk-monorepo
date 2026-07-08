import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import IconButton from '@mui/material/IconButton';

import { DASHBOARD_HEADER_ITEM_SIZE } from '@/domains/dashboarding/components/dashboard-header/constants';
import { useThemeContext } from '@/infra/contexts/theme-provider';

const FILTER_TOGGLE_ICON_FONT_SIZE = 20;

export interface FilterToggleProps {
  /**
   * Whether the filter panel is currently collapsed
   */
  isFilterPanelCollapsed: boolean;
  /**
   * Color of the filter toggle button
   */
  color?: string;
  /**
   * Size (px) of the square button box, provided by the header layout. Defaults to the dashboard
   * header item size.
   */
  size?: number;
  /**
   * Callback function called when the filter toggle button is clicked
   */
  onToggleClick: () => void;
}

/**
 * Filter toggle button component for dashboard toolbar.
 * Displays appropriate icon and tooltip based on filter panel state.
 */
export const FilterToggle = memo<FilterToggleProps>(
  ({ isFilterPanelCollapsed, color, size = DASHBOARD_HEADER_ITEM_SIZE, onToggleClick }) => {
    const { t } = useTranslation();
    const { themeSettings } = useThemeContext();

    return (
      <IconButton
        onClick={onToggleClick}
        aria-label="Toggle filters panel"
        aria-expanded={!isFilterPanelCollapsed}
        title={
          isFilterPanelCollapsed
            ? t('dashboard.toolbar.showFilters')
            : t('dashboard.toolbar.hideFilters')
        }
        sx={{
          width: size,
          height: size,
          padding: 0,
          color: color ?? themeSettings.typography.primaryTextColor,
        }}
      >
        {isFilterPanelCollapsed ? (
          <FilterAltIcon sx={{ fontSize: FILTER_TOGGLE_ICON_FONT_SIZE }} />
        ) : (
          <FilterAltOffIcon sx={{ fontSize: FILTER_TOGGLE_ICON_FONT_SIZE }} />
        )}
      </IconButton>
    );
  },
);
