import { getSlightlyDifferentColor } from '@/shared/utils/color/index.js';

import { CompleteThemeSettings } from '../../../../../../types.js';
import { TableCustomStyles } from '../types.js';

const oddIndex = (rowIndex: number) => rowIndex % 2 === 1;

export const getCellStyles = ({
  colIndex = 0,
  rowIndex = 0,
  themeSettings,
  customStyles,
  isHeaderCell,
}: {
  colIndex?: number;
  rowIndex?: number;
  themeSettings: CompleteThemeSettings;
  customStyles?: TableCustomStyles;
  isHeaderCell?: boolean;
}) => {
  let color = themeSettings.chart.textColor;
  const fontFamily = themeSettings.typography.fontFamily;
  let backgroundColor = themeSettings.chart.backgroundColor;
  const fillBGColor = getSlightlyDifferentColor(backgroundColor);

  if (isHeaderCell) {
    if (customStyles?.header?.color?.enabled) {
      backgroundColor = customStyles?.header?.color?.backgroundColor || fillBGColor;
      color = customStyles?.header?.color?.textColor || color;
    }
  } else {
    if (customStyles?.columns?.alternatingColor?.enabled && oddIndex(colIndex)) {
      backgroundColor = customStyles?.columns?.alternatingColor?.backgroundColor || fillBGColor;
      color = customStyles?.columns?.alternatingColor?.textColor || color;
    }
    if (customStyles?.rows?.alternatingColor?.enabled && oddIndex(rowIndex)) {
      backgroundColor = customStyles?.rows?.alternatingColor?.backgroundColor || fillBGColor;
      color = customStyles?.rows?.alternatingColor?.textColor || color;
    }
  }

  return {
    color,
    backgroundColor,
    fontFamily,
  };
};
