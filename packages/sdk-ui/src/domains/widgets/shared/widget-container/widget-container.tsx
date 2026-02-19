import { type ReactNode, useMemo } from 'react';

import get from 'lodash-es/get';

import { ThemeProvider, useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types.js';
import styled from '@/infra/styled';
import { WidgetContainerStyleOptions } from '@/types';

import {
  useWidgetErrorsAndWarnings,
  WidgetErrorsAndWarningsProvider,
} from '../widget-errors-and-warnings-context.js';
import { WidgetHeaderConfig } from '../widget-header/types.js';
import { WidgetHeader } from '../widget-header/widget-header.js';
import { getShadowValue, WidgetCornerRadius, WidgetSpaceAround } from '../widget-style-utils.js';

type Styleable = {
  styleOptions?: WidgetContainerStyleOptions;
};

export interface WidgetContainerProps {
  dataSetName?: string;
  styleOptions?: WidgetContainerStyleOptions;
  /**
   * Header configuration (e.g. toolbar menu items). Passed to {@link WidgetHeader} as `config`.
   */
  headerConfig?: WidgetHeaderConfig;
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
  headerConfig,
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
    <WidgetContainerRoot className="csdk-accessible" data-component="widget-container-root">
      <WidgetContainerLayout
        styleOptions={styleOptions}
        theme={themeSettings}
        data-component="widget-container-layout"
      >
        <WidgetContainerCard
          styleOptions={styleOptions}
          theme={themeSettings}
          data-component="widget-container-card"
        >
          {!styleOptions?.header?.hidden && (
            <WidgetHeader
              title={title}
              infoButtonConfig={{
                dataSetName,
                description,
                errorMessages: errors,
                warningMessages: warnings,
              }}
              styleOptions={styleOptions?.header}
              config={headerConfig}
              onRefresh={onRefresh}
            />
          )}
          {topSlot}
          <ThemeProvider theme={contentTheme}>
            <WidgetContainerContent
              styleOptions={styleOptions}
              theme={themeSettings}
              data-component="widget-container-content"
            >
              {children}
            </WidgetContainerContent>
          </ThemeProvider>
          {bottomSlot}
        </WidgetContainerCard>
      </WidgetContainerLayout>
    </WidgetContainerRoot>
  );
};

const WidgetContainerRoot = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const WidgetContainerLayout = styled.div<Styleable & Themable>`
  box-sizing: border-box;
  height: 100%;
  padding: ${({ styleOptions, theme }) =>
    WidgetSpaceAround[get(styleOptions, 'spaceAround', theme.widget.spaceAround)] || '0px'};
`;

const WidgetContainerCard = styled.div<Styleable & Themable>`
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: ${({ styleOptions }) => styleOptions?.backgroundColor || 'unset'};
  border-width: ${({ styleOptions, theme }) =>
    get(styleOptions, 'border', theme.widget.border) ? '1px' : '0'};
  border-style: solid;
  border-color: ${({ styleOptions, theme }) =>
    styleOptions?.borderColor || theme.widget.borderColor};
  border-radius: ${({ styleOptions, theme }) =>
    WidgetCornerRadius[styleOptions?.cornerRadius || theme.widget.cornerRadius] || '0'};
  box-shadow: ${({ styleOptions, theme }) => getShadowValue(styleOptions, theme)};
`;

const WidgetContainerContent = styled.div<Styleable & Themable>`
  flex-grow: 1;
  min-width: 0;
  min-height: 0;
  background-color: ${({ styleOptions, theme }) =>
    styleOptions?.backgroundColor || theme.chart?.backgroundColor};
`;
