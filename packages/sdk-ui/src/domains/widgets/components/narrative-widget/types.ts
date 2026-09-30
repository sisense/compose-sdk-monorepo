import type { NarrativeState } from '@/domains/narrative/components/narrative';
import type { WidgetContainerStyleOptions } from '@/types';

import type { NarrativeWidgetChangeEvent } from '../../change-events';
import type { WidgetProps } from '../widget/types';
import type { NarrativeWidgetConfig } from '../widget/widget-config';

/**
 * Style options of the dashboard narrative widget: its container and header, and whether its height
 * follows the content.
 * @beta
 */
export type NarrativeWidgetStyleOptions = WidgetContainerStyleOptions & {
  /**
   * Sizes the widget to its content — no scrolling, no empty space — instead of the size its
   * container gives it. Inside a dashboard it applies to a row whose widgets all have it on.
   * @default false
   */
  isAutoHeight?: boolean;
};

/**
 * Props for the dashboard narrative widget — an AI-generated, natural-language summary of the
 * dashboard the widget sits on.
 * @beta
 */
export interface NarrativeWidgetProps {
  /**
   * Title of the widget.
   * @category Widget
   */
  title?: string;

  /**
   * Style options for the widget container and header.
   * @category Widget
   */
  styleOptions?: NarrativeWidgetStyleOptions;

  /**
   * Widget configuration, such as the header menu.
   * @category Widget
   * @internal
   */
  config?: NarrativeWidgetConfig;

  /**
   * The widgets the narrative describes. Inside a dashboard the dashboard supplies them; for
   * standalone use pass them explicitly. Widgets that run no query are skipped. Not sent when
   * `dashboardId` is set.
   * @category Data
   * @internal
   */
  widgets?: readonly WidgetProps[];

  /**
   * Id of the saved dashboard the widget sits on. When set, the narrative is requested for that
   * dashboard by id — the service reads its widgets, number formats and AI context — instead of
   * from `widgets`.
   * @category Data
   * @internal
   */
  dashboardId?: string;

  /**
   * Whether the dashboard of `dashboardId` is open in shared mode (co-authoring), so that the
   * narrative is requested for its shared copy. Has no effect without `dashboardId`.
   * @category Data
   * @internal
   */
  sharedMode?: boolean;

  /**
   * Whether the dashboard of `dashboardId` is open through Admin Access (an admin viewing a
   * dashboard not shared with them), so that the narrative is requested with admin rights. Has no
   * effect without `dashboardId`.
   * @category Data
   * @internal
   */
  adminAccess?: boolean;

  /**
   * When true, renders only the narrative content without the WidgetContainer chrome.
   * Use in contexts where the host (Fusion dashboard, widget editor) provides its own chrome.
   * The copy action lives in the container header, so the host owns it in this mode.
   * @category Widget
   * @internal
   */
  containerless?: boolean;

  /**
   * Generates the narrative once on mount, without waiting for the generate action — for
   * rendering that has no user to click, such as a server-side export.
   * @category Data
   * @internal
   */
  generateOnMount?: boolean;

  /**
   * Fires once after mount — with `generateOnMount`, once the generation has settled (ready or
   * error). Fusion's render pipeline waits on it before PDF/image export — without the callback
   * the export of a dashboard holding this widget would hang.
   * @category Callbacks
   * @internal
   */
  onReady?: () => void;

  /**
   * Called with the height the narrative content needs to show without scrolling, in pixels —
   * the design's paddings included, the widget header excluded — whenever it changes. Not called
   * while loading. A host that sizes the widget to its content (Fusion's automatic height) reads it.
   * @category Callbacks
   * @internal
   */
  onContentHeightChange?: (height: number) => void;

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
   * - `'title/changed'` — the widget title was renamed inline.
   *
   * Injected automatically when placed inside a Dashboard.
   * @category Callbacks
   * @internal
   */
  onChange?: (event: NarrativeWidgetChangeEvent) => void;
}
