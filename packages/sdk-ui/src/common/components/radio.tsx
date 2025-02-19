import React from 'react';
import RadioMui from '@mui/material/Radio';

type ButtonProps = {
  checked?: boolean;
  value?: string;
  onChange?: (checked: boolean) => void;
};

/** @internal */
export const Radio = (props: ButtonProps) => {
  const { checked, value, onChange } = props;
  return (
    <RadioMui
      sx={{
        width: '28px',
        height: '28px',
        padding: '8px',
        marginRight: '4px',
        boxSizing: 'border-box',
        color: 'inherit',
        '&.Mui-checked': {
          color: 'inherit',
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
      inputProps={{ ...(props['aria-label'] && { 'aria-label': props['aria-label'] }) }}
    />
  );
};
