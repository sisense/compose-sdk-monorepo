import React, { ForwardedRef } from 'react';
import MuiTablePagination, {
  type TablePaginationProps as MuiTablePaginationProps,
} from '@mui/material/TablePagination';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { useMeasure } from 'react-use';
import { UsePaginationProps } from '@mui/material/usePagination/usePagination';

import { TablePaginationContext } from './TablePaginationContext';
import {
  getCurrentBreakpoint,
  RESPONSIVE_TABLE_PAGINATION_CLASS,
  tablePaginationResponsiveWidth,
} from './themes/tablePaginationResponsiveDesign';
import { PaginationActionsComponent } from './PaginationActionsComponent';
import { Typography } from '../Typography';
import { Icon, type IconProps } from '../Icon';

import { siColors } from '../themes';
import { tablePaginationTheme, type TablePaginationTheme } from './themes';

type MuiSelectDisplayProps = React.HTMLAttributes<HTMLDivElement> & {
  'data-testid'?: string;
};

export type TablePaginationProps = Omit<
  MuiTablePaginationProps,
  'onPageChange' | 'ActionsComponent' | 'labelRowsPerPage' | 'onRowsPerPageChange'
> & {
  displayedLabelRows: { conjunction: string; result: string };
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onPageChange: (page: number) => void;
  theme?: TablePaginationTheme;
  labelRowsPerPage: string;
  labelRowsPerPageShort?: string;
  dataTestId?: string;
};

const PAGE_START_ZERO_BASE_INDEX = 1;

const TablePagination = React.forwardRef(
  // eslint-disable-next-line max-lines-per-function
  (
    {
      count,
      page,
      rowsPerPage,
      onRowsPerPageChange,
      displayedLabelRows,
      onPageChange,
      labelRowsPerPage,
      labelRowsPerPageShort = 'Rows',
      rowsPerPageOptions = [10, 25, 50, 75],
      theme = tablePaginationTheme,
      dataTestId,
      style,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
      ...rest
    }: TablePaginationProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    // React sensor hook that tracks dimensions of an HTML element using the Resize Observer API
    const [measureRef, { width }] = useMeasure<HTMLDivElement>();
    const breakpointIsLessThanLg = width < tablePaginationResponsiveWidth.lg;

    const handleLabelDisplayedRows = ({
      from,
      to,
      count,
    }: {
      from: number;
      to: number;
      count: number;
    }) => {
      const msg = breakpointIsLessThanLg
        ? `${from}-${to} / ${count}`
        : `${from}-${to} ${displayedLabelRows.conjunction} ${count} ${displayedLabelRows.result}`;

      return (
        <Typography variant={'bodyParagraph'} sx={{ color: siColors.StTextColors.secondary }}>
          {msg}
        </Typography>
      );
    };

    const handleOnPageChange = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) =>
      onPageChange(page);

    const handleOnRowsPerPage = (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => onRowsPerPageChange(Number(event.target.value));

    const breakpoint = getCurrentBreakpoint(width);
    const paginationProps: UsePaginationProps = {
      siblingCount: breakpointIsLessThanLg ? 0 : 1,
    };

    return (
      <ThemeProvider theme={theme}>
        <TablePaginationContext.Provider value={paginationProps}>
          <div className={`${RESPONSIVE_TABLE_PAGINATION_CLASS} ${breakpoint}`} ref={measureRef}>
            <MuiTablePagination
              ref={ref}
              component={'div'}
              count={count}
              page={page - PAGE_START_ZERO_BASE_INDEX}
              ActionsComponent={PaginationActionsComponent}
              onPageChange={handleOnPageChange}
              onRowsPerPageChange={handleOnRowsPerPage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              labelDisplayedRows={handleLabelDisplayedRows}
              slotProps={{
                select: {
                  SelectDisplayProps: {
                    'data-testid': 'TablePaginationSelect',
                  } as MuiSelectDisplayProps,
                  IconComponent: (props: IconProps) => (
                    <Icon {...props} name="general-arrow-big-down" />
                  ),
                  renderValue: (value: unknown) => (
                    <Typography variant={'bodyParagraph'}>{String(value)}</Typography>
                  ),
                  MenuProps: {
                    sx: {
                      '.MuiPaper-root': {
                        fontFamily: style?.fontFamily,
                      },
                    },
                  },
                },
              }}
              labelRowsPerPage={
                <Typography variant={'bodyParagraph'}>
                  {breakpointIsLessThanLg ? labelRowsPerPageShort : labelRowsPerPage}
                </Typography>
              }
              data-testid={dataTestId}
            />
          </div>
        </TablePaginationContext.Provider>
      </ThemeProvider>
    );
  },
);

export default TablePagination;
export { TablePagination };
