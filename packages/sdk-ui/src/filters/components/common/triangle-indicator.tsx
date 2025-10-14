import { useThemeContext } from '@/theme-provider';
import { getSlightlyDifferentColor, TRIANGLE_COLOR_ADJUSTMENT } from '@/utils/color';

export const TriangleIndicator = () => {
  const { themeSettings } = useThemeContext();
  const { backgroundColor: bgColor } = themeSettings.general;
  const triangleColor = getSlightlyDifferentColor(bgColor, TRIANGLE_COLOR_ADJUSTMENT);
  return (
    <div className="csdk-flex csdk-justify-center" data-testid="triangle-indicator">
      <div
        style={{ borderTopColor: triangleColor }}
        className={`csdk-border-l-[70px] csdk-border-l-[transparent] csdk-border-r-[70px] csdk-border-r-[transparent] csdk-border-t-[13px]`}
      ></div>
    </div>
  );
};
