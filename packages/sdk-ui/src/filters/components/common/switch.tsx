import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

export const SisenseSwitchButton = styled(Switch)(() => ({
  height: '23px',
  width: '33px',
  '& .MuiSwitch-switchBase': {
    transform: 'translateX(1px)',
    top: '2px',
    transition: 'all .3s ease',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(13px)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#FFC805',
      },
      '&:hover': {
        background: 'transparent',
      },
    },
    '&:hover': {
      background: 'transparent',
    },
  },
  '&:hover': {
    '& .MuiSwitch-thumb': {
      transform: 'scale(1.2)',
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#fff',
    width: 11,
    height: 11,
    border: '1px solid #c4c8cd',
    boxShadow: 'none',
    transition: 'all .3s ease',
    boxSizing: 'border-box',
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    height: '9px',
    width: '19px',
    backgroundColor: '#6e737d',
    borderRadius: 9,
  },
}));
