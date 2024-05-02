import { preparePivotStylingProps } from '@/pivot-table/helpers/prepare-pivot-styling-props';
import { CompleteThemeSettings, PivotTableStyleOptions } from '@/types';

describe('preparePivotStylingProps', () => {
  it('should return correct props when styleOptions and themeSettings are provided', () => {
    const styleOptions: PivotTableStyleOptions = {
      alternatingRowsColor: true,
      alternatingColumnsColor: true,
      headersColor: true,
      membersColor: true,
      totalsColor: true,
      rowHeight: 40,
      isAutoHeight: true,
    };
    const themeSettings = {
      chart: {
        backgroundColor: 'green',
        textColor: 'red',
      },
      typography: {
        fontFamily: 'Arial',
      },
    } as CompleteThemeSettings;
    const result = preparePivotStylingProps(styleOptions, themeSettings);
    expect(result).toEqual({
      fontFamily: 'Arial',
      textColor: 'red',
      backgroundColor: 'green',
      borderColor: '#cbced7',
      fillColor: 'rgba(25, 153, 25, 1)',
      additionalFillColor: 'rgba(37, 165, 37, 1)',
      fillOptions: {
        alternatingRows: true,
        alternatingColumns: true,
        columnsHeaders: true,
        rowMembers: true,
        totals: true,
      },
      rowHeight: 40,
      isAutoHeight: true,
    });
  });

  it('should return default props when no styleOptions and themeSettings are provided', () => {
    const result = preparePivotStylingProps();
    expect(result).toEqual({
      fontFamily: undefined,
      textColor: undefined,
      backgroundColor: undefined,
      borderColor: '#cbced7',
      fillColor: undefined,
      additionalFillColor: undefined,
      fillOptions: {
        alternatingRows: undefined,
        alternatingColumns: undefined,
        columnsHeaders: undefined,
        rowMembers: undefined,
        totals: undefined,
      },
      rowHeight: undefined,
      isAutoHeight: false,
    });
  });
});
