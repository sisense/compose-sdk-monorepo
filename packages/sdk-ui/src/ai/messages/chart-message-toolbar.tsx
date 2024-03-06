/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { IconButton as MuiIconButton, Menu, MenuItem, styled } from '@mui/material';
import { useMemo, useState } from 'react';

import { colors } from '../../themes/colors';
import Tooltip from '../common/tooltip';
import ExpandIcon from '../icons/expand-icon';
import InfoIcon from '../icons/info-icon';
import RefreshIcon from '../icons/refresh-icon';
import ThreeDotsIcon from '../icons/three-dots-icon';

const IconButton = styled(MuiIconButton)(() => ({
  padding: 2,
  '&.MuiIconButton-root:hover': {
    backgroundColor: colors.interaction.defaultHover,
  },
}));

const InfoTooltip = ({ title }: { title: string }) => (
  <Tooltip title={title}>
    <IconButton disableTouchRipple>
      <InfoIcon />
    </IconButton>
  </Tooltip>
);

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

  return (
    <>
      <IconButton onClick={handleClick} aria-label="three dots button">
        <ThreeDotsIcon />
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
              fontFamily: 'Open Sans',
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
  return (
    <Tooltip title="Preview">
      <IconButton onClick={onClick}>
        <ExpandIcon />
      </IconButton>
    </Tooltip>
  );
};

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
    <div className="csdk-flex csdk-py-1.5" aria-label="chatbot chart toolbar">
      <InfoTooltip title={infoTooltipText ?? ''} />
      <ThreeDotsMenu items={dropdownMenuItems} />
      <ExpandButton onClick={onExpand} />
    </div>
  );
}
