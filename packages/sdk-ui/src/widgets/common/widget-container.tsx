import { type ReactNode, useMemo } from 'react';

import get from 'lodash-es/get';

import { ThemeProvider, useThemeContext } from '../../theme-provider';
import { WidgetContainerStyleOptions } from '../../types';
import {
  useWidgetErrorsAndWarnings,
  WidgetErrorsAndWarningsProvider,
} from './widget-errors-and-warnings-context';
import { WidgetHeader } from './widget-header';
import { getShadowValue, WidgetCornerRadius, WidgetSpaceAround } from './widget-style-utils';

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
export const WidgetContainer: React.FC<WidgetContainerProps> = (props) => {
  return (
    <WidgetErrorsAndWarningsProvider>
      <RawWidgetContainer {...props} />
    </WidgetErrorsAndWarningsProvider>
  );
};

/** @internal */
export const RawWidgetContainer: React.FC<WidgetContainerProps> = ({
  dataSetName,
  styleOptions,
  title,
  description,
  topSlot,
  bottomSlot,
  children,
  onRefresh = () => {},
}: WidgetContainerProps) => {
  const { errors, warnings } = useWidgetErrorsAndWarnings();
  const { themeSettings } = useThemeContext();

  const contentTheme = useMemo(
    () => ({
      chart: {
        backgroundColor: styleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
      },
    }),
    [styleOptions?.backgroundColor, themeSettings.chart?.backgroundColor],
  );

  return (
    <div className="csdk-w-full csdk-h-full csdk-overflow-hidden csdk-accessible">
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
              errorMessages={errors}
              warningMessages={warnings}
              styleOptions={styleOptions?.header}
              onRefresh={onRefresh}
            />
          )}
          {topSlot}
          <ThemeProvider theme={contentTheme}>
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
