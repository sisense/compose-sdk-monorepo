import { ReactNode } from 'react';

import ListSubheader from '@mui/material/ListSubheader';

import { DEFAULT_TEXT_COLOR } from '@/const';
import { useThemeContext } from '@/theme-provider/theme-context';

type MenuSectionProps = {
  children: ReactNode;
};

export const MenuSection = ({ children }: MenuSectionProps) => {
  const { themeSettings } = useThemeContext();
  return (
    <ListSubheader
      sx={{
        width: '100%',
        minWidth: '170px',
        backgroundColor: '#f2f2f2',
        borderBottom: '1px solid #e6e6e6',
        height: '29px',
        lineHeight: '29px',
        fontFamily: themeSettings.typography.fontFamily,
        fontSize: '13px',
        paddingLeft: '15px',
        paddingRight: '15px',
        color: DEFAULT_TEXT_COLOR,
      }}
    >
      {children}
    </ListSubheader>
  );
};
