import { type ReactNode } from 'react';
import { ThemeProvider, useThemeContext } from '../../theme-provider';
import { WidgetStyleOptions } from '../../types';
import { getShadowValue, WidgetCornerRadius, WidgetSpaceAround } from './widget-style-utils';
import { WidgetHeader } from './widget-header';

interface WidgetContainerProps {
  dataSetName?: string;
  styleOptions?: WidgetStyleOptions;
  title?: string;
  description?: string;
  topSlot?: ReactNode;
  bottomSlot?: ReactNode;
  children: ReactNode;
  onRefresh?: () => void;
}

/** @internal */
export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  dataSetName,
  styleOptions,
  title,
  description,
  topSlot,
  bottomSlot,
  children,
  onRefresh = () => {},
}: WidgetContainerProps) => {
  const { themeSettings } = useThemeContext();

  return (
    <div className="csdk-w-full csdk-h-full csdk-overflow-hidden">
      <div
        className="csdk-h-full"
        style={{
          padding: WidgetSpaceAround[styleOptions?.spaceAround || 'None'],
        }}
      >
        <div
          className="csdk-h-full csdk-overflow-hidden"
          style={{
            borderWidth: styleOptions?.border ? '1px' : 0,
            borderColor: styleOptions?.borderColor || themeSettings.chart.textColor,
            borderRadius: styleOptions?.cornerRadius
              ? WidgetCornerRadius[styleOptions.cornerRadius]
              : 0,
            boxShadow: getShadowValue(styleOptions),
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!styleOptions?.header?.hidden && (
            <WidgetHeader
              title={title}
              description={description}
              dataSetName={dataSetName}
              styleOptions={styleOptions?.header}
              onRefresh={onRefresh}
            />
          )}
          {topSlot}
          <ThemeProvider
            theme={{
              chart: {
                backgroundColor:
                  styleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
              },
            }}
          >
            <div
              style={{
                flexGrow: 1,
                // prevents 'auto' behavior of using content size as minimal size for container
                minWidth: 0,
                minHeight: 0,
                backgroundColor:
                  styleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
              }}
            >
              {children}
            </div>
          </ThemeProvider>

          {bottomSlot}
        </div>
      </div>
    </div>
  );
};
