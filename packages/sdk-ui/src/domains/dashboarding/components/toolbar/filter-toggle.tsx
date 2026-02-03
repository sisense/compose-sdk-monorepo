import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import IconButton from '@mui/material/IconButton';

import { useThemeContext } from '@/infra/contexts/theme-provider';

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
   * Callback function called when the filter toggle button is clicked
   */
  onToggleClick: () => void;
}

/**
 * Filter toggle button component for dashboard toolbar.
 * Displays appropriate icon and tooltip based on filter panel state.
 */
export const FilterToggle = memo<FilterToggleProps>(
  ({ isFilterPanelCollapsed, color, onToggleClick }) => {
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
          color: color ?? themeSettings.typography.primaryTextColor,
        }}
      >
        {isFilterPanelCollapsed ? (
          <FilterAltIcon fontSize="medium" />
        ) : (
          <FilterAltOffIcon fontSize="medium" />
        )}
      </IconButton>
    );
  },
);
