import { useState } from 'react';
import { Attribute } from '@sisense/sdk-data';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

export const DrilldownBreadcrumbs = ({
  filtersDisplayValues,
  currentCategory,
  clearDrilldownSelections,
  sliceDrilldownSelections,
}: {
  filtersDisplayValues: string[][];
  currentCategory: Attribute;

  clearDrilldownSelections: () => void;
  sliceDrilldownSelections: (i: number) => void;
}) => {
  const [popperParams, setPopoverParams] = useState<{
    filterDisplayValues: string[];
    anchorEl: HTMLElement;
  } | null>(null);

  const handlePopperOpen =
    (filterDisplayValues: string[]) => (event: React.MouseEvent<HTMLElement>) => {
      setPopoverParams({ filterDisplayValues, anchorEl: event.currentTarget });
    };

  const handlePopperClose = () => {
    setPopoverParams(null);
  };

  if (!filtersDisplayValues.length) return null;

  const open = !!popperParams;

  return (
    <Breadcrumbs separator=">">
      <Button size="small" variant="outlined" onClick={clearDrilldownSelections}>
        X
      </Button>
      {filtersDisplayValues.map((filterDisplayValues, i) => (
        <Button
          key={i}
          size="small"
          variant="outlined"
          onMouseEnter={handlePopperOpen(filterDisplayValues)}
          onMouseLeave={handlePopperClose}
          onClick={
            i === filtersDisplayValues.length - 1
              ? undefined
              : () => {
                  sliceDrilldownSelections(i + 1);
                }
          }
        >
          {filterDisplayValues.slice(0, 2).join(', ')}
          {filterDisplayValues.length > 2 ? ', ...' : undefined}
        </Button>
      ))}{' '}
      <Button size="small" variant="outlined" disabled>
        {currentCategory.name} (All)
      </Button>
      <Popper open={open} anchorEl={popperParams?.anchorEl}>
        <Box sx={{ width: 300, height: 400 }}>
          <Paper sx={{ p: 1 }}>{popperParams?.filterDisplayValues.join(', ')}</Paper>
        </Box>
      </Popper>
    </Breadcrumbs>
  );
};
