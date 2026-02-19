import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/Monitor';
import IconButton from '@mui/material/IconButton';

import { useThemeContext } from '@/infra/contexts/theme-provider';

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
   * Callback function called when the edit toggle button is clicked
   */
  onToggleClick: () => void;
}

/**
 * Edit toggle button component for dashboard toolbar.
 * Displays appropriate icon and tooltip based on edit mode state.
 */
export const EditToggle = memo<EditToggleProps>(
  ({ isEditMode, isHistoryEnabled, color, onToggleClick }) => {
    const { t } = useTranslation();
    const { themeSettings } = useThemeContext();

    if (isHistoryEnabled && isEditMode) return null;

    return (
      <IconButton
        onClick={onToggleClick}
        size="small"
        aria-label="Toggle edit mode"
        aria-expanded={isEditMode}
        title={isEditMode ? t('dashboard.toolbar.viewMode') : t('dashboard.toolbar.editLayout')}
        sx={{
          color: color ?? themeSettings.typography.primaryTextColor,
        }}
      >
        {isEditMode ? <EditOffIcon fontSize="medium" /> : <EditIcon fontSize="medium" />}
      </IconButton>
    );
  },
);
