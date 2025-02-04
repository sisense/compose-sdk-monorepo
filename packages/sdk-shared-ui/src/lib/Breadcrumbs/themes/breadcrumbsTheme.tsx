import { createTheme } from '@mui/material/styles';
import { Components } from '@mui/material/styles/components';

export const breadcrumbsTheme = createTheme({
  components: {
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          height: '24px',
        },
      },
    },
  },
});
export type BreadcrumbsTheme = Components['MuiBreadcrumbs'];
