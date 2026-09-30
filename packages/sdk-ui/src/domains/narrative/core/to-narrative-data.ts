import type {
  DashboardNarrativeInsightDto,
  DashboardNarrativeInsightStatusDto,
  DashboardNarrativeResponseDto,
} from '@/infra/api/narrative/dashboard-narrative-endpoints.js';

import type { NarrativeData, NarrativeInsight } from '../components/narrative/types.js';

/** Marker that opens each insight line of the copy text, so the status survives as plain text. */
const COPY_STATUS_MARKER: ReadonlyMap<string, string> = new Map<
  DashboardNarrativeInsightStatusDto,
  string
>([
  ['positive', '🟢'],
  ['negative', '🔴'],
  ['neutral', '⚪'],
]);

function isInsightDto(value: unknown): value is DashboardNarrativeInsightDto {
  if (typeof value !== 'object' || value === null) return false;
  const { text, status } = value as { text?: unknown; status?: unknown };
  return typeof text === 'string' && typeof status === 'string' && COPY_STATUS_MARKER.has(status);
}

/**
 * Tells whether a response body is a dashboard narrative rather than some other 200 payload.
 * @param body - Parsed response body.
 * @returns `true` when `overview` is a string, `insights` is an array of `{ text, status }` and
 *   `generatedAt`, if present, is a string.
 * @internal
 */
export function isDashboardNarrativeResponse(body: unknown): body is DashboardNarrativeResponseDto {
  if (typeof body !== 'object' || body === null) return false;
  const { overview, insights, generatedAt } = body as {
    overview?: unknown;
    insights?: unknown;
    generatedAt?: unknown;
  };
  return (
    typeof overview === 'string' &&
    Array.isArray(insights) &&
    insights.every(isInsightDto) &&
    (generatedAt === undefined || typeof generatedAt === 'string')
  );
}

function toInsight({ text, status }: DashboardNarrativeInsightDto): NarrativeInsight {
  return { text, status };
}

function toCopyText(overview: string, insights: readonly NarrativeInsight[]): string {
  if (insights.length === 0) return overview;
  const lines = insights.map(({ status, text }) => `${COPY_STATUS_MARKER.get(status)} ${text}`);
  return `${overview}\n\n${lines.join('\n')}`;
}

/**
 * Maps the wire response of the dashboard narrative service onto the view model the widget renders.
 * The only place that knows the wire shape.
 * @param response - Wire response.
 * @returns View model; `copyText` is assembled here from the overview and the insights, and a
 *   missing `generatedAt` becomes the time of the mapping.
 * @internal
 */
export function toNarrativeData(response: DashboardNarrativeResponseDto): NarrativeData {
  const insights = response.insights.map(toInsight);
  return {
    overview: response.overview,
    insights,
    generatedAt: response.generatedAt ?? new Date().toISOString(),
    copyText: toCopyText(response.overview, insights),
  };
}
