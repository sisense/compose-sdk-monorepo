import type { NarrativeData, NarrativeState } from '@/domains/narrative/components/narrative';
import type { WidgetContainerStyleOptions } from '@/types';

import type { NarrativeWidgetChangeEvent } from '../../change-events';
import type { WidgetProps } from '../widget/types';
import type { NarrativeWidgetConfig } from '../widget/widget-config';

/**
 * Props for the dashboard narrative widget — an AI-generated, natural-language summary of the
 * dashboard the widget sits on.
 * @beta
 */
export interface NarrativeWidgetProps {
  /**
   * Title of the widget
   * @category Widget
   */
  title?: string;

  /**
   * Style options for the widget container and header
   * @category Widget
   */
  styleOptions?: WidgetContainerStyleOptions;

  /**
   * Widget configuration (e.g. the header menu)
   * @category Widget
   * @internal
   */
  config?: NarrativeWidgetConfig;

  /**
   * The widgets the narrative describes. Inside a dashboard the dashboard supplies them; for
   * standalone use pass them explicitly. Widgets that run no query are skipped.
   * @category Data
   * @internal
   */
  widgets?: readonly WidgetProps[];

  /**
   * Pre-supplied narrative. When present, the widget starts in the ready state and the
   * generate action resolves back to it.
   * @remarks
   * Until the narrative API is wired up, a widget without it reaches the failed state on generate.
   * @category Data
   * @internal
   */
  narrative?: NarrativeData;

  /**
   * When true, renders only the narrative content without the WidgetContainer chrome.
   * Use in contexts where the host (Fusion dashboard, widget editor) provides its own chrome.
   * The copy action lives in the container header, so the host owns it in this mode.
   * @category Widget
   * @internal
   */
  containerless?: boolean;

  /**
   * Fires once after mount. Fusion's render pipeline waits on it before PDF/image export —
   * without the callback the export of a dashboard holding this widget would hang.
   * @category Callbacks
   * @internal
   */
  onReady?: () => void;

  /**
   * Fires with the current narrative state on mount and whenever it changes. A host that
   * provides its own chrome (`containerless`) reads the copy text and status from it to drive
   * the header copy action and export behaviour.
   * @category Callbacks
   * @internal
   */
  onStateChange?: (state: NarrativeState) => void;

  /**
   * Fires on widget change events:
   *
   * - `'title/changed'` — the widget title was renamed inline
   *
   * Injected automatically when placed inside a Dashboard.
   * @category Callbacks
   * @internal
   */
  onChange?: (event: NarrativeWidgetChangeEvent) => void;
}
