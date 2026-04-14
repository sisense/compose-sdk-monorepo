import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import type { DesignPanelProps } from '@sisense/sdk-ui';

import type { StyleOptions } from './types';

const DEFAULT_STYLE_OPTIONS: StyleOptions = {
  headerBackgroundColor: '#1976d2',
  headerTextColor: '#ffffff',
  cellPadding: 4,
  fontSize: 14,
};

/**
 * Design panel for customizing simple-table widget style options.
 */
export const SimpleTableDesignPanel: React.FC<DesignPanelProps<StyleOptions>> = ({
  styleOptions,
  onChange,
}) => {
  const initialOptions: StyleOptions = useMemo(
    () => ({
      ...DEFAULT_STYLE_OPTIONS,
      ...styleOptions,
    }),
    [styleOptions],
  );
  const [options, setOptions] = useState<StyleOptions>(initialOptions);

  useEffect(() => {
    onChange(options);
  }, [onChange, options]);

  const handleChange = useCallback((key: keyof StyleOptions, value: string | number) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const colorDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
    },
    [],
  );

  const handleColorChange = useCallback(
    (key: keyof StyleOptions, value: string) => {
      if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
      colorDebounceRef.current = setTimeout(() => handleChange(key, value), 300);
    },
    [handleChange],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, minWidth: 240 }}>
      <FormControl size="small" fullWidth>
        <InputLabel shrink>Header Background Color</InputLabel>
        <TextField
          type="color"
          value={options.headerBackgroundColor ?? DEFAULT_STYLE_OPTIONS.headerBackgroundColor}
          onChange={(e) => handleColorChange('headerBackgroundColor', e.target.value)}
          size="small"
          inputProps={{ 'aria-label': 'Header Background Color' }}
          sx={{ mt: 1, '& input': { height: 36, cursor: 'pointer' } }}
        />
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel shrink>Header Text Color</InputLabel>
        <TextField
          type="color"
          value={options.headerTextColor ?? DEFAULT_STYLE_OPTIONS.headerTextColor}
          onChange={(e) => handleColorChange('headerTextColor', e.target.value)}
          size="small"
          inputProps={{ 'aria-label': 'Header Text Color' }}
          sx={{ mt: 1, '& input': { height: 36, cursor: 'pointer' } }}
        />
      </FormControl>

      <TextField
        label="Cell Padding (px)"
        type="number"
        value={options.cellPadding ?? DEFAULT_STYLE_OPTIONS.cellPadding}
        onChange={(e) =>
          handleChange('cellPadding', Math.min(32, Math.max(0, parseInt(e.target.value, 10) || 0)))
        }
        size="small"
        inputProps={{ min: 0, max: 32 }}
      />

      <TextField
        label="Font Size (px)"
        type="number"
        value={options.fontSize ?? DEFAULT_STYLE_OPTIONS.fontSize}
        onChange={(e) =>
          handleChange('fontSize', Math.min(24, Math.max(1, parseInt(e.target.value, 10) || 1)))
        }
        size="small"
        inputProps={{ min: 1, max: 24 }}
      />
    </Box>
  );
};
