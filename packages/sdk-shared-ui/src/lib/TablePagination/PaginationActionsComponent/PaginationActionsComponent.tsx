import Pagination, { type PaginationRenderItemParams } from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { TablePaginationActionsProps } from '@mui/material/TablePagination/TablePaginationActions';
import React, { ForwardedRef, useContext } from 'react';

import { Icon } from '../../Icon';
import { siColors } from '../../themes';
import { Typography } from '../../Typography';
import { TablePaginationContext } from '../TablePaginationContext';
import { paginationActionsComponentTheme } from './themes';

export type PaginationActionsComponentProps = Omit<
  TablePaginationActionsProps,
  'onPageChange' | 'color' | 'getItemAriaLabel'
> & {
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
};

const PAGE_START_INDEX = 1;
export const PaginationActionsComponent = React.forwardRef(
  (
    // { onPageChange, count, rowsPerPage, page, ...rest }: PaginationActionsComponentProps,
    { onPageChange, count, rowsPerPage, page }: PaginationActionsComponentProps,
    ref: ForwardedRef<HTMLElement>,
  ) => {
    const context = useContext(TablePaginationContext);

    const handleOnPageChange = (event: React.ChangeEvent<unknown>, page: number) =>
      onPageChange(null, page);

    return (
      <ThemeProvider theme={paginationActionsComponentTheme}>
        <Pagination
          //{...rest}
          ref={ref}
          count={Math.ceil(count / rowsPerPage)}
          page={Number(page) + PAGE_START_INDEX}
          siblingCount={context.siblingCount}
          onChange={handleOnPageChange}
          showFirstButton={true}
          showLastButton={true}
          size={'small'}
          boundaryCount={PAGE_START_INDEX}
          renderItem={(item: PaginationRenderItemParams) => (
            <PaginationItem
              components={{
                first: () => (
                  <Icon
                    sx={{ color: siColors.StUiColors.additional }}
                    name={'general-double-arrow-back'}
                  />
                ),
                last: () => (
                  <Icon
                    sx={{ color: siColors.StUiColors.additional }}
                    name={'general-double-arrow-front'}
                  />
                ),
                next: () => (
                  <Icon
                    sx={{ color: siColors.StUiColors.additional }}
                    name={'general-arrow-right'}
                  />
                ),
                previous: () => (
                  <Icon
                    sx={{ color: siColors.StUiColors.additional }}
                    name={'general-arrow-left'}
                  />
                ),
              }}
              {...item}
              page={
                <Typography variant="bodyLabel" dataTestId={`PaginationPage-${item.page}`}>
                  {item.page}
                </Typography>
              }
            />
          )}
          data-testid={'PaginationActionsComponent'}
        />
      </ThemeProvider>
    );
  },
);
