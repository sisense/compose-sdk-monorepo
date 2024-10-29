import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useThemeContext } from '../../theme-provider';
import { WidgetContainerStyleOptions } from '../../types';
import { getSlightlyDifferentColor } from '@/utils/color';
import { useTranslation } from 'react-i18next';

export default function WidgetHeaderInfoButton({
  title,
  description,
  styleOptions,
  onRefresh,
}: {
  title?: string;
  description?: string;
  styleOptions?: WidgetContainerStyleOptions['header'];
  onRefresh: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  const handleInfoButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip
        title={t('widgetHeader.info.tooltip')}
        style={{
          color: themeSettings.chart?.textColor,
          fontFamily: themeSettings.typography?.fontFamily,
        }}
      >
        <IconButton onClick={handleInfoButtonClick} sx={{ p: 0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path
              fill={styleOptions?.titleTextColor || themeSettings.widget.header.titleTextColor}
              d="M11.5 20a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zm0-1a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zm-.5-8h1v5h-1v-5zm0-1v-.998h1V10h-1z"
            />
          </svg>
        </IconButton>
      </Tooltip>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          root: {
            sx: {
              '.MuiPaper-root': {
                boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.25)',
                borderRadius: 0,
              },
            },
          },
        }}
      >
        <Card raised={true} className={'csdk-max-w-xs csdk-w-[300px]'}>
          <div
            className={
              'csdk-flex csdk-flex-row csdk-justify-between csdk-items-center csdk-py-[5px] csdk-px-[12px]'
            }
            style={{
              backgroundColor: getSlightlyDifferentColor(themeSettings.general.backgroundColor),
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 'bold' }}
              style={{
                color: themeSettings.typography.primaryTextColor,
                fontFamily: themeSettings.typography.fontFamily,
              }}
            >
              {t('widgetHeader.info.details')}
            </Typography>
            <IconButton onClick={onRefresh} sx={{ p: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill={themeSettings.chart?.textColor}
                  d="M20 12a8 8 0 0 1-15.259 3.368l1.004-.222a7 7 0 0 0 13.252-2.925L20 12zm0 0a8 8 0 0 1-15.259 3.368l1.004-.222a7 7 0 0 0 13.252-2.925L20 12zm-8-7a7 7 0 0 1 6.267 3.877l1.003-.22A8.001 8.001 0 0 0 4 12l1.003-.22A7 7 0 0 1 12 5zm6.998 3.12A8 8 0 0 0 4 12l1.003-.22a7 7 0 0 1 13.264-2.903l.73-.16v.28l-2.98.016-.017.971h3.985V6h-.987v2.12zm-14.01 9.864H4V14h3.985l-.016.971-2.981.017v2.996z"
                ></path>
              </svg>
            </IconButton>
          </div>
          <Divider
            sx={{ borderColor: themeSettings.typography.secondaryTextColor, opacity: 0.3 }}
          />
          <CardContent
            style={{
              backgroundColor: themeSettings.general.backgroundColor,
              padding: 12,
            }}
          >
            {title && (
              <Typography
                variant="body2"
                style={{
                  color: themeSettings.typography.primaryTextColor,
                  fontFamily: themeSettings.typography.fontFamily,
                  fontSize: 13,
                }}
              >
                {title}
              </Typography>
            )}

            {!!description && (
              <>
                <Divider
                  sx={{
                    my: 1,
                    borderColor: themeSettings.typography.secondaryTextColor,
                    opacity: 0.3,
                  }}
                />
                <Typography
                  variant="body2"
                  style={{
                    color: themeSettings.typography.primaryTextColor,
                    fontFamily: themeSettings.typography.fontFamily,
                    fontSize: 13,
                  }}
                >
                  {description}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Popover>
    </>
  );
}
