/**
 * Widget chrome sent with the XLSX JAQL export API (chart, pivot, custom widgets).
 *
 * - `widgetId` ← `ChartWidgetProps.id` when set (opaque string; Fusion `oid` when rendered via `Widget` / `toWidgetProps`)
 * - `widgetType` (request body) ← Compose `chartType` (e.g. `bar`, `line`)
 * - `language` ← resolved in {@link useExecuteExcelQueryInternal} from app settings
 */
export type XlsxExportWidgetContext = {
  widgetId: string;
  /** Compose chart `chartType` or other widget discriminator sent to export API. */
  widgetType: string;
  /** BCP 47 tag (e.g. `en-US`); use `app.settings.translationConfig.language` from {@link useSisenseContext}. */
  language: string;
};

/**
 * Request JSON body for `POST api/v1/export/jaql/xlsx`.
 */
export type XlsxExportRequestPayload = {
  widgetId: string;
  widgetType: string;
  jaql: Record<string, unknown>;
  mergeRows: boolean;
  language: string;
};

/**
 * Builds the XLSX JAQL export request body shared by chart, pivot, and custom widgets.
 *
 * @param widget - Widget id, type, and locale for the export body
 * @param jaql - JAQL root for the export body (typically from `buildJaqlForExcelExport`)
 * @param mergeRows - Repeat rows vs merge rows
 * @returns Payload for {@link HttpClient.post}
 */
export function buildXlsxExportPayload(
  widget: XlsxExportWidgetContext,
  jaql: Record<string, unknown>,
  mergeRows: boolean,
): XlsxExportRequestPayload {
  return {
    widgetId: widget.widgetId,
    widgetType: widget.widgetType,
    jaql,
    mergeRows,
    language: widget.language,
  };
}
