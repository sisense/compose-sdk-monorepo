import { type ReactNode, type RefObject, useMemo } from 'react';

import styled from '@emotion/styled';
import get from 'lodash-es/get';

import { ThemeProvider, useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types.js';
import { WidgetContainerStyleOptions } from '@/types';

import { WidgetErrorsAndWarningsProvider } from '../widget-errors-and-warnings-context.js';
import { WidgetHeaderConfig } from '../widget-header/types.js';
import { WidgetHeader } from '../widget-header/widget-header.js';
import { getShadowValue, WidgetCornerRadius, WidgetSpaceAround } from '../widget-style-utils.js';

type Styleable = {
  styleOptions?: WidgetContainerStyleOptions;
};

export interface WidgetContainerProps {
  styleOptions?: WidgetContainerStyleOptions;
  /**
   * The widget's **fully composed** header configuration — the single channel every header item
   * travels through: the items the widget composed from the header features it uses (marked as
   * built-ins), the items dashboard-level features contributed, the consumer's own items, and the
   * consumer's `onBeforeRender`. This is the end of the widget's feature chain, not the raw
   * `config.header` the widget received.
   */
  headerConfig?: WidgetHeaderConfig;
  topSlot?: ReactNode;
  bottomSlot?: ReactNode;
  children: ReactNode;
  /**
   * Ref attached to the content area below the header (topSlot + chart + bottomSlot).
   * Use to measure the available height for narrative-to-chart ratio calculations.
   * @internal
   */
  contentAreaRef?: RefObject<HTMLDivElement | null>;
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
  styleOptions,
  headerConfig,
  topSlot,
  bottomSlot,
  children,
  contentAreaRef,
}: WidgetContainerProps) => {
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
            <WidgetHeader styleOptions={styleOptions?.header} config={headerConfig} />
          )}
          <WidgetContentArea
            ref={contentAreaRef}
            styleOptions={styleOptions}
            theme={themeSettings}
            data-component="widget-content-area"
          >
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
          </WidgetContentArea>
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

const WidgetContentArea = styled.div<Styleable & Themable>`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: ${({ styleOptions, theme }) =>
    styleOptions?.backgroundColor || theme.chart?.backgroundColor};
`;

const WidgetContainerContent = styled.div<Styleable & Themable>`
  flex-grow: 1;
  min-width: 0;
  min-height: 0;
  background-color: ${({ styleOptions, theme }) =>
    styleOptions?.backgroundColor || theme.chart?.backgroundColor};
`;
