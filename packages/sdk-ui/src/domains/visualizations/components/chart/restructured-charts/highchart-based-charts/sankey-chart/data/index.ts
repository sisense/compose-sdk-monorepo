import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor';

import { loadDataBySingleQuery } from '../../../helpers/data-loading';
import { getSankeyNodeColorFromMap } from '../sankey-node-colors.js';
import { SankeyChartData, SankeyChartDataOptionsInternal, SankeyLink, SankeyNode } from '../types';

/** Highcharts Sankey stops rendering beyond this many links (turboThreshold). */
export const SANKEY_LINKS_LIMIT = 1000;

/**
 * Transforms a flat DataTable (grouped by all categories + value) into SankeyChartData.
 *
 * For each adjacent pair of categories (i, i+1), rows are aggregated to compute
 * total flow weights between each unique (from, to) pair. This client-side aggregation
 * allows a single query to power multi-stage Sankey diagrams.
 *
 * Example: categories=[Gender, Condition, AgeRange], value=Revenue
 *   - Gender→Condition links: group rows by (Gender, Condition), sum Revenue
 *   - Condition→AgeRange links: group rows by (Condition, AgeRange), sum Revenue
 */
function getSankeyChartData(
  dataOptions: SankeyChartDataOptionsInternal,
  dataTable: DataTable,
): SankeyChartData {
  const categoryNames = dataOptions.category.map((c) => c.column.name);
  const valueName = dataOptions.value.column.name;

  // Build a name→index lookup from the DataTable columns
  const colIndexByName = new Map<string, number>();
  for (const col of dataTable.columns) {
    colIndexByName.set(col.name, col.index);
  }

  const valueIndex = colIndexByName.get(valueName);
  const links: SankeyLink[] = [];

  // Node ID includes the column index to prevent collisions when two stages share a display
  // value (e.g. "Unspecified" appearing in both Gender and Condition columns). Without the
  // prefix, Highcharts merges them into one node and draws dangling cross-column connections.
  const makeNodeId = (colIndex: number, displayValue: string) => `${colIndex}__${displayValue}`;

  // Maps nodeId → { rawValue, blur, name } — populated during row iteration, used for nodes.
  const nodeMetaById = new Map<
    string,
    { rawValue: unknown; blur: boolean | undefined; name: string }
  >();

  // For each adjacent category pair, aggregate rows to produce links
  for (let i = 0; i < categoryNames.length - 1; i++) {
    const fromColIndex = colIndexByName.get(categoryNames[i]);
    const toColIndex = colIndexByName.get(categoryNames[i + 1]);

    if (fromColIndex === undefined || toColIndex === undefined || valueIndex === undefined) {
      continue;
    }

    // Map of `fromId\x00toId` → accumulated weight
    const aggregated = new Map<string, number>();

    for (const row of dataTable.rows) {
      const fromCell = row[fromColIndex];
      const toCell = row[toColIndex];
      const fromName = String(fromCell?.displayValue ?? '');
      const toName = String(toCell?.displayValue ?? '');
      if (!fromName || !toName) continue;

      const fromId = makeNodeId(i, fromName);
      const toId = makeNodeId(i + 1, toName);

      const rawValue = row[valueIndex]?.rawValue;
      const weight = Math.max(0, typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0);
      const key = `${fromId}\x00${toId}`;
      aggregated.set(key, (aggregated.get(key) ?? 0) + weight);

      // Capture raw value and blur for each node on first encounter.
      // blur=false (highlighted) takes priority over blur=true (blurred) across rows.
      if (!nodeMetaById.has(fromId)) {
        nodeMetaById.set(fromId, {
          rawValue: fromCell?.rawValue,
          blur: fromCell?.blur,
          name: fromName,
        });
      } else if (fromCell?.blur === false) {
        nodeMetaById.get(fromId)!.blur = false;
      }
      if (!nodeMetaById.has(toId)) {
        nodeMetaById.set(toId, {
          rawValue: toCell?.rawValue,
          blur: toCell?.blur,
          name: toName,
        });
      } else if (toCell?.blur === false) {
        nodeMetaById.get(toId)!.blur = false;
      }
    }

    for (const [key, weight] of aggregated.entries()) {
      const nullIdx = key.indexOf('\x00');
      links.push({
        from: key.slice(0, nullIdx),
        to: key.slice(nullIdx + 1),
        weight,
      });
    }
  }

  // Truncate links to avoid Highcharts turboThreshold blank render
  const totalLinksBeforeTruncation = links.length > SANKEY_LINKS_LIMIT ? links.length : undefined;
  const truncatedLinks =
    totalLinksBeforeTruncation !== undefined ? links.slice(0, SANKEY_LINKS_LIMIT) : links;

  // Collect unique node ids; apply colors and metadata from maps.
  // seriesToColorMap is keyed by display name (flat) or category column (multi-column).
  const seenIds = new Set<string>();
  const nodes: SankeyNode[] = [];
  const isHighlightActive = Array.from(nodeMetaById.values()).some((m) => m.blur !== undefined);

  for (const link of truncatedLinks) {
    for (const id of [link.from, link.to]) {
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const meta = nodeMetaById.get(id);
        const displayName = meta?.name ?? id;
        const nodeColor = getSankeyNodeColorFromMap(
          id,
          displayName,
          dataOptions.category,
          dataOptions.seriesToColorMap,
        );
        nodes.push({
          id,
          name: displayName,
          ...(nodeColor ? { color: nodeColor } : {}),
          rawValue: meta?.rawValue,
          blur: isHighlightActive ? meta?.blur ?? false : undefined,
        });
      }
    }
  }

  return { type: 'sankey', links: truncatedLinks, nodes, totalLinksBeforeTruncation };
}

export const dataTranslators = {
  loadData: loadDataBySingleQuery,
  getChartData: getSankeyChartData,
};
