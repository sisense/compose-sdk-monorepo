import { useMemo } from 'react';

import { asBuiltInHeaderItem } from '@/domains/shared/header';
import { WidgetContainerStyleOptions } from '@/types';

import { withHeaderItemsInConfig } from '../../../helpers/header-items-utils.js';
import { useWidgetErrorsAndWarnings } from '../../widget-errors-and-warnings-context.js';
import { WidgetHeaderConfig } from '../types.js';
import WidgetHeaderInfoButton from '../widget-header-info-button.js';
import { WidgetHeaderTargets } from '../widget-header-targets.js';

/**
 * Params for {@link useWidgetHeaderInfoButton}.
 */
export interface UseWidgetHeaderInfoButtonParams {
  /** Name of the widget's dataset, shown as the popover's heading. */
  dataSetName?: string;
  /** The widget's description, shown in the popover. */
  description?: string;
  /** Style options for the widget header. */
  styleOptions?: WidgetContainerStyleOptions['header'];
  /** Re-runs the widget's query. */
  onRefresh?: () => void;
}

const noop = () => {};

/**
 * The info ("i") button's content.
 *
 * It reads the widget's errors and warnings from context rather than taking them as params: the item
 * renders inside `WidgetContainer`'s error/warning provider, which is where they are collected, so
 * threading them down from the widget component would only duplicate that channel.
 */
const InfoButtonContent = ({
  dataSetName,
  description,
  styleOptions,
  onRefresh,
}: UseWidgetHeaderInfoButtonParams) => {
  const { errors, warnings } = useWidgetErrorsAndWarnings();

  return (
    <WidgetHeaderInfoButton
      title={dataSetName}
      description={description}
      styleOptions={styleOptions}
      errorMessages={errors}
      warningMessages={warnings}
      onRefresh={onRefresh ?? noop}
    />
  );
};

/**
 * Adds the info button to a widget's header: a popover describing the widget's dataset, its
 * description and any errors or warnings, plus a refresh.
 *
 * Only widgets backed by a query call this. A filter control or a text widget has nothing to
 * describe and nothing to refresh, so it never creates the button in the first place — there is no
 * "disable the info button" switch to get wrong.
 *
 * @param headerConfig - The widget's header config so far.
 * @param params - Dataset name, description, header style options and the refresh callback.
 * @returns The header config carrying the info button.
 * @internal
 */
export const useWidgetHeaderInfoButton = (
  headerConfig: WidgetHeaderConfig | undefined,
  { dataSetName, description, styleOptions, onRefresh }: UseWidgetHeaderInfoButtonParams,
): WidgetHeaderConfig => {
  const infoButtonItem = useMemo(
    () =>
      asBuiltInHeaderItem({
        id: WidgetHeaderTargets.InfoButton,
        component: () => (
          <InfoButtonContent
            dataSetName={dataSetName}
            description={description}
            styleOptions={styleOptions}
            onRefresh={onRefresh}
          />
        ),
      }),
    [dataSetName, description, styleOptions, onRefresh],
  );

  return useMemo(
    () => withHeaderItemsInConfig([infoButtonItem])(headerConfig ?? {}),
    [headerConfig, infoButtonItem],
  );
};
