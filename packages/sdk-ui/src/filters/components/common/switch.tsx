import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

export const SisenseSwitchButton = styled(Switch)(() => ({
  '& .MuiSwitch-switchBase': {
    transform: 'translateX(0px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(15px)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#FFC805',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    border: '1px solid rgba(38, 46, 61, 0.4)',
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    height: '8px',
    width: '20px',
    backgroundColor: '#6e737d',
    borderRadius: 9,
  },
}));
