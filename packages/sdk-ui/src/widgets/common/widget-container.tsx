import { type ReactNode } from 'react';
import { ThemeProvider, useThemeContext } from '../../theme-provider';
import { WidgetContainerStyleOptions } from '../../types';
import { getShadowValue, WidgetCornerRadius, WidgetSpaceAround } from './widget-style-utils';
import { WidgetHeader } from './widget-header';
import get from 'lodash/get';

interface WidgetContainerProps {
  dataSetName?: string;
  styleOptions?: WidgetContainerStyleOptions;
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
          padding:
            WidgetSpaceAround[get(styleOptions, 'spaceAround', themeSettings.widget.spaceAround)] ||
            '0px',
        }}
      >
        <div
          className="csdk-h-full csdk-overflow-hidden"
          style={{
            backgroundColor: styleOptions?.backgroundColor || 'unset',
            borderWidth: get(styleOptions, 'border', themeSettings.widget.border) ? '1px' : 0,
            borderColor: styleOptions?.borderColor || themeSettings.widget.borderColor,
            borderRadius:
              WidgetCornerRadius[styleOptions?.cornerRadius || themeSettings.widget.cornerRadius] ||
              0,
            boxShadow: getShadowValue(styleOptions, themeSettings),
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
