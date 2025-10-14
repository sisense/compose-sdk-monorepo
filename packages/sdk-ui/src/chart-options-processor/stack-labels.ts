import { TotalLabels } from '@/types';

export const prepareStackLabels = (totalLabels: TotalLabels) => {
  const { align, ...style } = totalLabels.textStyle ?? {};
  return {
    enabled: totalLabels?.enabled ?? false,
    ...(totalLabels?.rotation !== undefined && { rotation: totalLabels.rotation }),
    ...(totalLabels?.align !== undefined && { align: totalLabels.align }),
    ...(totalLabels?.verticalAlign !== undefined && { verticalAlign: totalLabels.verticalAlign }),
    ...(totalLabels?.delay !== undefined && { animation: { defer: totalLabels.delay } }),
    ...(totalLabels?.backgroundColor !== undefined && {
      backgroundColor: totalLabels.backgroundColor,
    }),
    ...(totalLabels?.borderColor !== undefined && { borderColor: totalLabels.borderColor }),
    ...(totalLabels?.borderRadius !== undefined && { borderRadius: totalLabels.borderRadius }),
    ...(totalLabels?.borderWidth !== undefined && { borderWidth: totalLabels.borderWidth }),
    ...(totalLabels?.textStyle !== undefined && { style: totalLabels.textStyle }),
    ...(totalLabels?.xOffset !== undefined && { x: totalLabels.xOffset }),
    ...(totalLabels?.yOffset !== undefined && { y: totalLabels.yOffset }),
    ...(style !== undefined && { style }),
    ...(align !== undefined && { textAlign: align }),
  };
};
