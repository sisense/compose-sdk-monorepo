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
    className="csdk-w-50 csdk-px-[12px] csdk-shadow-md csdk-shadow-gray-500 csdk-rounded-md csdk-bg-white"
    style={{ backgroundColor: themeProps.chartBackgroundColor, color: themeProps.primaryTextColor }}
  >
    <div className="csdk-border-b csdk-border-[#e4e4e4] csdk-p-3 csdk-pl-1">
      <Typography variant="body2" fontFamily={themeProps.fontFamily} fontSize={11}>
        Members
      </Typography>
      <Typography variant="body2" fontFamily={themeProps.fontFamily} fontSize={13}>
        {filterDisplayValues.join(', ')}
      </Typography>
    </div>
    <div className="csdk-border-b csdk-border-[#e4e4e4] csdk-p-3 csdk-pl-1">
      <Typography variant="body2" fontFamily={themeProps.fontFamily} fontSize={11}>
        Table
      </Typography>
      <Typography variant="body2" fontFamily={themeProps.fontFamily} fontSize={13}>
        {currentTable}
      </Typography>
    </div>
    <div className="csdk-p-3 csdk-pl-1">
      <Typography variant="body2" fontFamily={themeProps.fontFamily} fontSize={11}>
        Column
      </Typography>
      <Typography variant="body2" fontFamily={themeProps.fontFamily} fontSize={13}>
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
