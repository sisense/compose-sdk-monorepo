import { useMemo } from 'react';

import isUndefined from 'lodash-es/isUndefined';

import { WidgetContainerStyleOptions } from '@/types';

import { InfoButtonConfig, ToolbarConfig } from './types.js';
import WidgetHeaderInfoButton from './widget-header-info-button.js';
import { WidgetMenuButton } from './widget-menu-button.js';

export interface WidgetHeaderToolbarProps {
  /**
   * Configuration options for the info button
   * @deprecated - should be injected as a part of the button onClick handler instead
   */
  infoButtonConfig: InfoButtonConfig;

  /**
   * Style options for the whole widget header
   * TODO: should be specific to the toolbar instead
   */
  styleOptions?: WidgetContainerStyleOptions['header'];

  /**
   * Configuration options for the toolbar
   */
  config?: ToolbarConfig;

  onRefresh: () => void;
}

/**
 * Renders the widget header toolbar
 */
export function WidgetHeaderToolbar({
  infoButtonConfig,
  styleOptions,
  onRefresh,
  config,
}: WidgetHeaderToolbarProps): JSX.Element | null {
  const isMenuEnabled = useMemo(
    () => (isUndefined(config?.menu?.enabled) ? true : config?.menu?.enabled),
    [config?.menu?.enabled],
  );
  const defaultToolbar = (
    <>
      <WidgetHeaderInfoButton
        title={infoButtonConfig.dataSetName}
        description={infoButtonConfig.description}
        styleOptions={styleOptions}
        errorMessages={infoButtonConfig.errorMessages}
        warningMessages={infoButtonConfig.warningMessages}
        onRefresh={onRefresh}
      />
      {isMenuEnabled && config?.menu?.items && config?.menu?.items.length > 0 && (
        <WidgetMenuButton menuItems={config?.menu?.items} />
      )}
    </>
  );

  if (styleOptions?.renderToolbar) {
    return styleOptions.renderToolbar(onRefresh, defaultToolbar);
  }

  return defaultToolbar;
}
