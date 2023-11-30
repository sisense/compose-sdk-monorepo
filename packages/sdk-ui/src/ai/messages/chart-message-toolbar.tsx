/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import {
  IconButton as MuiIconButton,
  Menu,
  MenuItem,
  styled,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { colors } from '../../themes/colors';
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

const Tooltip = ({ title, children }: { title: string; children: JSX.Element }) => (
  <MuiTooltip
    title={title}
    placement="top"
    componentsProps={{
      tooltip: {
        sx: {
          bgcolor: colors.background.workspace,
          color: colors.text.content,
          paddingX: '16px',
          paddingY: '12px',
          fontSize: '13px',
          fontFamily: 'Open Sans',
          fontWeight: 400,
          borderRadius: '4px',
          boxShadow: '0px 4px 12px 0px rgba(9, 9, 10, 0.20), 0px 1px 4px 0px rgba(9, 9, 10, 0.10);',
        },
      },
      arrow: {
        sx: {
          color: colors.background.workspace,
        },
      },
    }}
    arrow
  >
    {children}
  </MuiTooltip>
);

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
      <IconButton onClick={handleClick}>
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
    <div className="csdk-flex csdk-py-1.5">
      <InfoTooltip title={infoTooltipText ?? ''} />
      <ThreeDotsMenu items={dropdownMenuItems} />
      <ExpandButton onClick={onExpand} />
    </div>
  );
}
