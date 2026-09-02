import { asBuiltInHeaderItem, HeaderItem } from '@/domains/shared/header';
import { WidgetHeaderTargets } from '@/domains/widgets/shared/widget-header/widget-header-targets';

import { NarrativeTriggerButton } from './narrative-trigger-button';

/**
 * Builds the built-in narrative-toggle header item, which shows or hides the widget's generated
 * narrative on demand.
 *
 * @param options - The narrative's current visibility and how to flip it.
 * @param options.isVisible - Whether the narrative is currently shown; selects icon and tooltip.
 * @param options.onToggle - Called when the button is clicked.
 * @returns The header item, marked as a built-in so it may claim its reserved id.
 * @internal
 */
export const createNarrativeToggleItem = ({
  isVisible,
  onToggle,
}: {
  isVisible: boolean;
  onToggle: () => void;
}): HeaderItem =>
  asBuiltInHeaderItem({
    id: WidgetHeaderTargets.NarrativeToggle,
    component: () => <NarrativeTriggerButton isVisible={isVisible} onClick={onToggle} />,
  });
