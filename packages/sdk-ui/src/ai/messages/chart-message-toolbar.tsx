import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { CompleteThemeSettings } from '@/index';
import styled from '@/styled';
import { useThemeContext } from '@/theme-provider';
import { getSlightlyDifferentColor } from '@/utils/color';

import { colors } from '../../themes/colors';
import IconButton from '../common/icon-button';
import Tooltip from '../common/tooltip';
import ExpandIcon from '../icons/expand-icon';
import InfoIcon from '../icons/info-icon';
import RefreshIcon from '../icons/refresh-icon';
import ThreeDotsIcon from '../icons/three-dots-icon';

const getHoverColor = (themeSettings: CompleteThemeSettings) =>
  getSlightlyDifferentColor(themeSettings.chart.backgroundColor);

const InfoTooltip = ({ title }: { title: string }) => {
  const { themeSettings } = useThemeContext();

  return (
    <Tooltip title={title}>
      <IconButton disableTouchRipple $hoverColor={getHoverColor(themeSettings)}>
        <InfoIcon fill={themeSettings.chart.textColor} />
      </IconButton>
    </Tooltip>
  );
};

type ThreeDotsMenuProps = {
  items: {
    title: string;
    icon?: JSX.Element;
    onClick: () => void;
  }[];
};

const ThreeDotsMenu = ({ items }: ThreeDotsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { themeSettings } = useThemeContext();

  return (
    <>
      <IconButton
        onClick={handleClick}
        $hoverColor={getHoverColor(themeSettings)}
        aria-label="three dots button"
      >
        <ThreeDotsIcon fill={themeSettings.chart.textColor} />
      </IconButton>
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
        {items.map((item) => (
          <MenuItem
            key={item.title}
            onClick={() => {
              item.onClick();
              handleClose();
            }}
            sx={{
              fontSize: '13px',
              fontFamily: themeSettings.typography.fontFamily,
              color: colors.text.content,
            }}
            disableRipple
          >
            {item.icon}
            <div className="csdk-ml-1">{item.title}</div>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const ExpandButton = ({ onClick }: { onClick: () => void }) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  return (
    <Tooltip title={t('ai.preview')}>
      <IconButton onClick={onClick} $hoverColor={getHoverColor(themeSettings)}>
        <ExpandIcon fill={themeSettings.chart.textColor} />
      </IconButton>
    </Tooltip>
  );
};

const ToolbarContainer = styled.div`
  display: flex;
  padding-top: 6px;
  padding-bottom: 6px;
`;

type ChartMessageToolbarProps = {
  infoTooltipText?: string;
  onRefresh: () => void;
  onExpand: () => void;
};

export default function ChartMessageToolbar({
  infoTooltipText,
  onRefresh,
  onExpand,
}: ChartMessageToolbarProps) {
  const dropdownMenuItems = useMemo(
    (): ThreeDotsMenuProps['items'] => [
      {
        title: 'Refresh',
        onClick: onRefresh,
        icon: <RefreshIcon />,
      },
    ],
    [onRefresh],
  );

  return (
    <ToolbarContainer aria-label="chatbot chart toolbar">
      <InfoTooltip title={infoTooltipText ?? ''} />
      <ThreeDotsMenu items={dropdownMenuItems} />
      <ExpandButton onClick={onExpand} />
    </ToolbarContainer>
  );
}
