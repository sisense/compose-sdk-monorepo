import { Tooltip as MuiTooltip, type TooltipProps as MuiTooltipProps } from '@mui/material';

import { colors } from '@/themes/colors';

type TooltipProps = Pick<MuiTooltipProps, 'title' | 'children'>;

export default function Tooltip({ title, children }: TooltipProps) {
  return (
    <MuiTooltip
      title={title}
      placement="top"
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: colors.background.workspace,
            color: colors.text.content,
            paddingX: '16px',
            paddingY: '12px',
            fontSize: '13px',
            fontFamily: 'Open Sans',
            fontWeight: 400,
            borderRadius: '4px',
            boxShadow:
              '0px 4px 12px 0px rgba(9, 9, 10, 0.20), 0px 1px 4px 0px rgba(9, 9, 10, 0.10);',
          },
        },
        arrow: {
          sx: {
            color: colors.background.workspace,
          },
        },
      }}
      arrow
    >
      {children}
    </MuiTooltip>
  );
}
