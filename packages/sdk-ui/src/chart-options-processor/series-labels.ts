import { SeriesLabels } from '..';

export const prepareDataLabelsOptions = (seriesLabels?: SeriesLabels) => {
  return {
    enabled: seriesLabels?.enabled ?? false,
    ...(seriesLabels?.rotation !== undefined && { rotation: seriesLabels.rotation }),
    ...(seriesLabels?.alignInside !== undefined && { inside: seriesLabels.alignInside }),
    ...(seriesLabels?.align !== undefined && { align: seriesLabels.align }),
    ...(seriesLabels?.verticalAlign !== undefined && { verticalAlign: seriesLabels.verticalAlign }),
    ...(seriesLabels?.textStyle !== undefined && { style: seriesLabels.textStyle }),
    ...(seriesLabels?.backgroundColor !== undefined && {
      backgroundColor: seriesLabels.backgroundColor,
    }),
    ...(seriesLabels?.borderColor !== undefined && { borderColor: seriesLabels.borderColor }),
    ...(seriesLabels?.borderRadius !== undefined && { borderRadius: seriesLabels.borderRadius }),
    ...(seriesLabels?.borderWidth !== undefined && { borderWidth: seriesLabels.borderWidth }),
    ...(seriesLabels?.padding !== undefined && { padding: seriesLabels.padding }),
    ...(seriesLabels?.xOffset !== undefined && { x: seriesLabels.xOffset }),
    ...(seriesLabels?.yOffset !== undefined && { y: seriesLabels.yOffset }),
    ...(seriesLabels?.delay !== undefined && { animation: { defer: seriesLabels.delay } }),
  };
};
