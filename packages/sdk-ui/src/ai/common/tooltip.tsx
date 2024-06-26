import MuiTooltip, { type TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip';
import { useThemeContext } from '@/theme-provider';

type TooltipProps = Pick<MuiTooltipProps, 'title' | 'placement' | 'children'>;

export default function Tooltip({ title, placement = 'top', children }: TooltipProps) {
  const { themeSettings } = useThemeContext();
  return (
    <MuiTooltip
      title={title}
      placement={placement}
      disableInteractive={true}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: themeSettings.aiChat.tooltips.backgroundColor,
            color: themeSettings.aiChat.tooltips.textColor,
            paddingX: '16px',
            paddingY: '12px',
            fontSize: '13px',
            fontFamily: themeSettings.typography.fontFamily,
            fontWeight: 400,
            borderRadius: '4px',
            boxShadow: themeSettings.aiChat.tooltips.boxShadow,
          },
        },
        arrow: {
          sx: {
            color: themeSettings.aiChat.tooltips.backgroundColor,
          },
        },
      }}
      arrow
    >
      {children}
    </MuiTooltip>
  );
}
