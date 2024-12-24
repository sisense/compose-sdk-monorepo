import { UsePaginationProps } from '@mui/material/usePagination/usePagination';
import { createContext } from 'react';

export const TablePaginationContext = createContext<UsePaginationProps>({});
