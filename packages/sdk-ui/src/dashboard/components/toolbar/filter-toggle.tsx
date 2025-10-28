import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import IconButton from '@mui/material/IconButton';

import { useThemeContext } from '@/theme-provider';

export interface FilterToggleProps {
  /**
   * Whether the filter panel is currently collapsed
   */
  isFilterPanelCollapsed: boolean;
  /**
   * Callback function called when the filter toggle button is clicked
   */
  onToggleClick: () => void;
}

/**
 * Filter toggle button component for dashboard toolbar.
 * Displays appropriate icon and tooltip based on filter panel state.
 */
export const FilterToggle = memo<FilterToggleProps>(({ isFilterPanelCollapsed, onToggleClick }) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();

  return (
    <IconButton
      onClick={onToggleClick}
      size="small"
      aria-label="Toggle filters panel"
      aria-expanded={!isFilterPanelCollapsed}
      title={
        isFilterPanelCollapsed
          ? t('dashboard.toolbar.showFilters')
          : t('dashboard.toolbar.hideFilters')
      }
      sx={{
        color: themeSettings.dashboard.toolbar.secondaryTextColor,
      }}
    >
      {isFilterPanelCollapsed ? (
        <FilterAltIcon fontSize="medium" />
      ) : (
        <FilterAltOffIcon fontSize="medium" />
      )}
    </IconButton>
  );
});
