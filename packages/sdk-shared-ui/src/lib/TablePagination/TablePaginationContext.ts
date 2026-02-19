import { createContext } from 'react';

import { UsePaginationProps } from '@mui/material/usePagination/usePagination';

export const TablePaginationContext = createContext<UsePaginationProps>({});
