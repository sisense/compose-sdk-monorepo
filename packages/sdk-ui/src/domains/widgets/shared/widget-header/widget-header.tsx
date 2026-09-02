import styled from '@emotion/styled';
import Divider from '@mui/material/Divider';
import get from 'lodash-es/get';

import { HeaderItemsRenderer } from '@/domains/shared/header';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types.js';
import { WidgetContainerStyleOptions } from '@/types';

import {
  WIDGET_HEADER_ITEM_SIZE,
  WIDGET_HEADER_ITEMS_GAP,
  WIDGET_HEADER_MIN_HEIGHT,
} from './constants.js';
import { WidgetHeaderConfig } from './types.js';
import { useResolvedWidgetHeaderItems } from './use-resolved-widget-header-items.js';

export interface WidgetHeaderProps {
  /** Style options for the widget header */
  styleOptions?: WidgetContainerStyleOptions['header'];
  /**
   * Header configuration: every item that lands in the header — the widget's own (marked built-ins),
   * the consumer's, and `onBeforeRender`.
   */
  config?: WidgetHeaderConfig;
}

type WidgetHeaderStyleable = {
  styleOptions?: WidgetContainerStyleOptions['header'];
};

/**
 * Widget header.
 *
 * Pure layout: {@link useResolvedWidgetHeaderItems} orders the widget's items into the header's slots
 * and applies the consumer's {@link WidgetHeaderConfig}, and this draws the result as a single row
 * plus the divider underneath.
 */
export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  styleOptions,
  config,
}: WidgetHeaderProps) => {
  const { themeSettings } = useThemeContext();
  const showDivider = get(styleOptions, 'dividerLine', themeSettings.widget.header.dividerLine);

  const resolvedItems = useResolvedWidgetHeaderItems({ config, styleOptions });

  return (
    <div data-component="widget-header">
      <HeaderContainer
        styleOptions={styleOptions}
        theme={themeSettings}
        data-component="header-container"
      >
        <HeaderItemsRenderer
          items={resolvedItems}
          defaultSize={WIDGET_HEADER_ITEM_SIZE}
          gap={WIDGET_HEADER_ITEMS_GAP}
        />
      </HeaderContainer>
      {showDivider && (
        <WidgetHeaderDivider
          styleOptions={styleOptions}
          theme={themeSettings}
          data-component="widget-header-divider"
        />
      )}
    </div>
  );
};

const HeaderContainer = styled.div<WidgetHeaderStyleable & Themable>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 8px;
  padding-right: 8px;
  min-height: ${WIDGET_HEADER_MIN_HEIGHT}px;
  background-color: ${({ styleOptions, theme }) =>
    styleOptions?.backgroundColor || theme.widget.header.backgroundColor};
`;

const WidgetHeaderDivider = styled(Divider)<WidgetHeaderStyleable & Themable>`
  background-color: ${({ styleOptions, theme }) =>
    styleOptions?.dividerLineColor || theme.widget.header.dividerLineColor || '#e6e6e6'};
`;
