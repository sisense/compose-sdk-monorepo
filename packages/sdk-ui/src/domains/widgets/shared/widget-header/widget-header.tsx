import Divider from '@mui/material/Divider';
import get from 'lodash-es/get';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types.js';
import styled from '@/infra/styled';
import { AlignmentTypes, WidgetContainerStyleOptions } from '@/types';

import { InfoButtonConfig, WidgetHeaderConfig } from './types.js';
import { WidgetHeaderToolbar } from './widget-header-toolbar.js';

export interface WidgetHeaderProps {
  onRefresh: () => void;
  title?: string;
  /** Configuration options for the info button */
  infoButtonConfig: InfoButtonConfig;
  /** Style options for the widget header */
  styleOptions?: WidgetContainerStyleOptions['header'];
  /** Header/toolbar configuration (e.g. toolbar menu). */
  config?: WidgetHeaderConfig;
}

function getTextAlignment(type: AlignmentTypes): 'left' | 'center' | 'right' {
  return type.toLowerCase() as 'left' | 'center' | 'right';
}

type WidgetHeaderStyleable = {
  styleOptions?: WidgetContainerStyleOptions['header'];
};

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  infoButtonConfig,
  styleOptions,
  onRefresh,
  config,
}: WidgetHeaderProps) => {
  const { themeSettings } = useThemeContext();
  const showDivider = get(styleOptions, 'dividerLine', themeSettings.widget.header.dividerLine);

  return (
    <div data-component="widget-header">
      <HeaderContainer
        styleOptions={styleOptions}
        theme={themeSettings}
        data-component="header-container"
      >
        <Title styleOptions={styleOptions} theme={themeSettings} data-component="title">
          {styleOptions?.renderTitle?.(title) ?? title}
        </Title>
        <ToolbarContainer data-component="toolbar-container">
          <WidgetHeaderToolbar
            infoButtonConfig={infoButtonConfig}
            styleOptions={styleOptions}
            onRefresh={onRefresh}
            config={config?.toolbar}
          />
        </ToolbarContainer>
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
  min-height: 32px;
  background-color: ${({ styleOptions, theme }) =>
    styleOptions?.backgroundColor || theme.widget.header.backgroundColor};
`;

const Title = styled.div<WidgetHeaderStyleable & Themable>`
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-align: ${({ styleOptions, theme }) =>
    getTextAlignment(styleOptions?.titleAlignment || theme.widget.header.titleAlignment)};
  color: ${({ styleOptions, theme }) =>
    styleOptions?.titleTextColor || theme.widget.header.titleTextColor};
  font-family: ${({ theme }) => theme.typography?.fontFamily ?? 'inherit'};
  font-size: ${({ theme }) => {
    const size = theme.widget.header.titleFontSize;
    return typeof size === 'number' ? `${size}px` : size;
  }};
`;

const ToolbarContainer = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const WidgetHeaderDivider = styled(Divider)<WidgetHeaderStyleable & Themable>`
  background-color: ${({ styleOptions, theme }) =>
    styleOptions?.dividerLineColor || theme.widget.header.dividerLineColor || '#e6e6e6'};
`;
