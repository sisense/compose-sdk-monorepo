import React from 'react';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';

interface DrilldownBreadcrumbsThemeProps {
  popperParams?: {
    filterDisplayValues: string[];
    anchorEl: HTMLElement;
  } | null;
  currentDimension: {
    expression: string;
  };
  themeProps: ThemeProps;
}

interface ThemeProps {
  primaryTextColor: string;
  secondaryTextColor: string;
  fontFamily: string;
  backgroundColor: string;
  brandColor: string;
  primaryButtonTextColor: string;
  chartBackgroundColor: string;
  activeDrillBackgroundColor: string;
  activeDrillHoverBackgroundColor: string;
}

const popperOptions = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 12],
      },
    },
  ],
};

const PopperContent: React.FC<{
  themeProps: ThemeProps;
  filterDisplayValues: string[];
  currentTable: string;
  currentColumn: string;
}> = ({ themeProps, filterDisplayValues, currentTable, currentColumn }) => (
  <div
    className="csdk-w-50 csdk-pl-4 csdk-pr-4 csdk-shadow-md csdk-shadow-gray-500 csdk-rounded-md csdk-bg-white"
    style={{ backgroundColor: themeProps.chartBackgroundColor, color: themeProps.primaryTextColor }}
  >
    <div className="csdk-border-b csdk-border-gray-300 csdk-p-3 csdk-pl-1">
      <Typography variant="body2" fontFamily={themeProps.fontFamily}>
        Members
      </Typography>
      <Typography variant="body2" fontFamily={themeProps.fontFamily}>
        {filterDisplayValues.join(', ')}
      </Typography>
    </div>
    <div className="csdk-border-b csdk-border-gray-300 csdk-p-3 csdk-pl-1">
      <Typography variant="body2" fontFamily={themeProps.fontFamily}>
        Table
      </Typography>
      <Typography variant="body2" fontFamily={themeProps.fontFamily}>
        {currentTable}
      </Typography>
    </div>
    <div className="csdk-p-3 csdk-pl-1">
      <Typography variant="body2" fontFamily={themeProps.fontFamily}>
        Column
      </Typography>
      <Typography variant="body2" fontFamily={themeProps.fontFamily}>
        {currentColumn}
      </Typography>
    </div>
  </div>
);

const DrillPopper: React.FC<DrilldownBreadcrumbsThemeProps> = ({
  popperParams,
  currentDimension,
  themeProps,
}) => {
  const match = currentDimension.expression.match(/\[(.*?)]/);
  const [currentTable, currentColumn] = match ? match[1].split('.') : ['', ''];
  const open = !!popperParams;

  return (
    <Popper
      open={open}
      anchorEl={popperParams?.anchorEl}
      placement="bottom"
      popperOptions={popperOptions}
    >
      {popperParams && (
        <PopperContent
          themeProps={themeProps}
          filterDisplayValues={popperParams.filterDisplayValues}
          currentTable={currentTable}
          currentColumn={currentColumn}
        />
      )}
    </Popper>
  );
};

export default DrillPopper;
