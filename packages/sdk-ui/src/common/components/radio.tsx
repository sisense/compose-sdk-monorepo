import React from 'react';
import RadioMui from '@mui/material/Radio';

type ButtonProps = {
  checked?: boolean;
  value?: string;
  onChange?: (checked: boolean) => void;
};

/** @internal */
export const Radio = ({ checked, value, onChange }: ButtonProps) => {
  return (
    <RadioMui
      sx={{
        width: '28px',
        height: '28px',
        padding: '8px',
        marginRight: '4px',
        boxSizing: 'border-box',
        color: '#5B6372',
        '&.Mui-checked': {
          color: '#5B6372',
        },
        '& .MuiSvgIcon-root': {
          fontSize: 16,
        },
        '&:hover': {
          backgroundColor: 'rgba(91, 99, 114, .1)',
        },
      }}
      size="small"
      checked={checked}
      onChange={(event, isChecked) => onChange?.(isChecked)}
      value={value}
      inputProps={{ 'aria-label': value }}
    />
  );
};
