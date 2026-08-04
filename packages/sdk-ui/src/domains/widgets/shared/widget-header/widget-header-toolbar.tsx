import { WidgetContainerStyleOptions } from '@/types';

import { InfoButtonConfig } from './types.js';
import WidgetHeaderInfoButton from './widget-header-info-button.js';

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

  onRefresh: () => void;
}

/**
 * Renders the widget header toolbar — the part of the header that `styleOptions.header.renderToolbar`
 * can replace. The header menu is rendered separately by {@link WidgetHeaderMenu}.
 */
export function WidgetHeaderToolbar({
  infoButtonConfig,
  styleOptions,
  onRefresh,
}: WidgetHeaderToolbarProps): JSX.Element | null {
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
    </>
  );

  return (
    <>
      {styleOptions?.renderToolbar
        ? styleOptions.renderToolbar(onRefresh, defaultToolbar)
        : defaultToolbar}
    </>
  );
}
