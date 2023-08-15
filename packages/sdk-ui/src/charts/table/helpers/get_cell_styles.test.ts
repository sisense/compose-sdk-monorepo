import { CompleteThemeSettings } from '../../../types';
import { getCellStyles } from './get_cell_styles';

describe('getCellThemeAndDesignBasedStyles', () => {
  const themeSettings = {
    chart: {
      textColor: 'black',
      backgroundColor: 'white',
    },
    typography: {
      fontFamily: 'Arial',
    },
  } as CompleteThemeSettings;

  it('should return correct styles for header cell without any custom styles', () => {
    const result = getCellStyles({
      colIndex: 0,
      rowIndex: 0,
      themeSettings,
      customStyles: {},
      isHeaderCell: true,
    });

    expect(result).toEqual({
      color: 'black',
      backgroundColor: 'white',
      fontFamily: 'Arial',
    });
  });

  it('should return correct styles for header cell with header color', () => {
    const result = getCellStyles({
      colIndex: 0,
      rowIndex: 0,
      themeSettings,
      customStyles: {
        headersColor: true,
      },
      isHeaderCell: true,
    });

    expect(result).toEqual({
      color: 'black',
      backgroundColor: 'rgba(247, 247, 247, 1)',
      fontFamily: 'Arial',
    });
  });

  it('should return correct styles for non-header cell with alternating columns color', () => {
    const result = getCellStyles({
      colIndex: 1,
      rowIndex: 0,
      themeSettings,
      customStyles: {
        alternatingColumnsColor: true,
      },
      isHeaderCell: false,
    });

    expect(result).toEqual({
      color: 'black',
      backgroundColor: 'rgba(247, 247, 247, 1)',
      fontFamily: 'Arial',
    });
  });

  it('should return correct styles for non-header cell without alternating rows color', () => {
    const result = getCellStyles({
      colIndex: 0,
      rowIndex: 1,
      themeSettings,
      customStyles: {
        alternatingRowsColor: true,
      },
      isHeaderCell: false,
    });

    expect(result).toEqual({
      color: 'black',
      backgroundColor: 'rgba(247, 247, 247, 1)',
      fontFamily: 'Arial',
    });
  });
});
