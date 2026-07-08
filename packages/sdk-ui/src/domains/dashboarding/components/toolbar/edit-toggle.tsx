import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/Monitor';
import IconButton from '@mui/material/IconButton';

import { DASHBOARD_HEADER_ITEM_SIZE } from '@/domains/dashboarding/components/dashboard-header/constants';
import { useThemeContext } from '@/infra/contexts/theme-provider';

const EDIT_TOGGLE_ICON_FONT_SIZE = 20;

/**
 * Props for the EditToggle component
 *
 * @internal
 */
export interface EditToggleProps {
  /**
   * Whether the edit mode is currently active
   */
  isEditMode: boolean;
  /**
   * Whether the history is currently enabled
   */
  isHistoryEnabled: boolean;
  /**
   * Color of the edit toggle button
   */
  color?: string;
  /**
   * Size (px) of the square button box, provided by the header layout. Defaults to the dashboard
   * header item size.
   */
  size?: number;
  /**
   * Callback function called when the edit toggle button is clicked
   */
  onToggleClick: () => void;
}

/**
 * Edit toggle button component for dashboard toolbar.
 * Displays appropriate icon and tooltip based on edit mode state.
 */
export const EditToggle = memo<EditToggleProps>(
  ({ isEditMode, isHistoryEnabled, color, size = DASHBOARD_HEADER_ITEM_SIZE, onToggleClick }) => {
    const { t } = useTranslation();
    const { themeSettings } = useThemeContext();

    if (isHistoryEnabled && isEditMode) return null;

    return (
      <IconButton
        onClick={onToggleClick}
        aria-label="Toggle edit mode"
        aria-expanded={isEditMode}
        title={isEditMode ? t('dashboard.toolbar.viewMode') : t('dashboard.toolbar.editLayout')}
        sx={{
          width: size,
          height: size,
          padding: 0,
          color: color ?? themeSettings.typography.primaryTextColor,
        }}
      >
        {isEditMode ? (
          <EditOffIcon sx={{ fontSize: EDIT_TOGGLE_ICON_FONT_SIZE }} />
        ) : (
          <EditIcon sx={{ fontSize: EDIT_TOGGLE_ICON_FONT_SIZE }} />
        )}
      </IconButton>
    );
  },
);
