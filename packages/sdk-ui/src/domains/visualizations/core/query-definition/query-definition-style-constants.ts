/**
 * Shared typography for the query-definition row, pill labels, and tooltip body.
 *
 * @internal
 */
export const QUERY_DEFINITION_TEXT_STYLE = {
  fontSize: '13px',
} as const;

/**
 * Pill label line height matches design spec on top of {@link QUERY_DEFINITION_TEXT_STYLE}.
 *
 * @internal
 */
export const QUERY_PILL_LABEL_STYLE = {
  ...QUERY_DEFINITION_TEXT_STYLE,
  lineHeight: '16px',
} as const;
