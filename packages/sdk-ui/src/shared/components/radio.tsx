import React from 'react';

import RadioMui from '@mui/material/Radio';

type ButtonProps = {
  checked?: boolean;
  value?: string;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

/** @internal */
export const Radio = (props: ButtonProps) => {
  const { checked, value, disabled, onChange } = props;
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
        '&.Mui-disabled': {
          color: 'inherit',
          opacity: 0.5,
        },
      }}
      size="small"
      checked={checked}
      onChange={(event, isChecked) => onChange?.(isChecked)}
      value={value}
      inputProps={{ ...(props['aria-label'] && { 'aria-label': props['aria-label'] }) }}
      disabled={disabled}
    />
  );
};
