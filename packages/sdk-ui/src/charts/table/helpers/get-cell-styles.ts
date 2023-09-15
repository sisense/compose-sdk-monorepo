import { CompleteThemeSettings } from '../../../types';
import { TableCustomStyles } from '../types';
import { getSlightlyDifferentColor } from '../../../utils/color';

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
  const color = themeSettings.chart.textColor;
  const fontFamily = themeSettings.typography.fontFamily;
  let backgroundColor = themeSettings.chart.backgroundColor;

  if (isHeaderCell) {
    if (customStyles?.headersColor) {
      backgroundColor = getSlightlyDifferentColor(backgroundColor);
    }
  } else {
    if (customStyles?.alternatingColumnsColor && oddIndex(colIndex)) {
      backgroundColor = getSlightlyDifferentColor(backgroundColor);
    }
    if (customStyles?.alternatingRowsColor && oddIndex(rowIndex)) {
      backgroundColor = getSlightlyDifferentColor(backgroundColor);
    }
  }

  return {
    color,
    backgroundColor,
    fontFamily,
  };
};
