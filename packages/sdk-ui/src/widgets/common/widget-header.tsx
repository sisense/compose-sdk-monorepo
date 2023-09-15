/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable max-lines */
import React from 'react';
import {
  IconButton,
  Tooltip,
  Popover,
  Card,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import { useThemeContext } from '../../components/theme-provider';
import { WidgetStyleOptions } from '../../types';
import classNames from 'classnames';

interface WidgetHeaderProps {
  onRefresh: () => void;
  title?: string;
  description?: string;
  dataSetName?: string;
  styleOptions?: WidgetStyleOptions['header'];
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  description,
  dataSetName,
  styleOptions,
  onRefresh,
}: WidgetHeaderProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const { themeSettings } = useThemeContext();

  const handleInfoButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <div
        className={'csdk-flex csdk-flex-row csdk-items-center csdk-px-2'}
        style={{
          backgroundColor: styleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
        }}
      >
        <div
          className={classNames(
            styleOptions?.titleAlignment === 'Center' ? 'csdk-text-center' : 'csdk-text-left',
            'csdk-w-full csdk-whitespace-nowrap csdk-overflow-hidden',
          )}
          style={{
            color: styleOptions?.titleTextColor || themeSettings.chart?.textColor,
            fontFamily: themeSettings.typography?.fontFamily,
          }}
        >
          {title || ''}
        </div>
        <div className={'csdk-ml-auto'}>
          <Tooltip
            title="Click to view full details"
            style={{
              backgroundColor: themeSettings.chart?.backgroundColor,
              color: themeSettings.chart?.textColor,
              fontFamily: themeSettings.typography?.fontFamily,
            }}
          >
            <IconButton
              onClick={handleInfoButtonClick}
              sx={{ p: 0 }}
              style={{
                backgroundColor:
                  styleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill={themeSettings.chart?.textColor}
                  d="M11.5 20a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zm0-1a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zm-.5-8h1v5h-1v-5zm0-1v-.998h1V10h-1z"
                />
              </svg>
            </IconButton>
          </Tooltip>
        </div>
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
        >
          <Card raised={true} className={'csdk-max-w-xs'}>
            <div
              className={
                'csdk-flex csdk-flex-row csdk-justify-between csdk-items-center csdk-p-2 csdk-pl-4'
              }
              style={{
                backgroundColor: themeSettings.chart?.secondaryTextColor,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold' }}
                style={{
                  color: themeSettings.chart?.textColor,
                  fontFamily: themeSettings.typography?.fontFamily,
                }}
              >
                Widget Details
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
            <CardContent style={{ backgroundColor: themeSettings.chart?.backgroundColor }}>
              {dataSetName && (
                <Typography
                  variant="body2"
                  style={{
                    color: themeSettings.chart?.textColor,
                    fontFamily: themeSettings.typography?.fontFamily,
                  }}
                >
                  {dataSetName}
                </Typography>
              )}
              <Divider
                sx={{ my: 2 }}
                style={{ backgroundColor: themeSettings.chart?.secondaryTextColor }}
              />
              <Typography
                variant="body2"
                style={{
                  color: themeSettings.chart?.textColor,
                  fontFamily: themeSettings.typography?.fontFamily,
                }}
              >
                {description || 'No description'}
              </Typography>
            </CardContent>
          </Card>
        </Popover>
      </div>
      {styleOptions?.dividerLine && (
        <Divider
          style={{
            backgroundColor:
              styleOptions?.dividerLineColor || themeSettings.chart?.secondaryTextColor,
          }}
        />
      )}
    </>
  );
};
