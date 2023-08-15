import { getCustomPaginationStyles } from './get_custom_pagination_styles';
import { CompleteThemeSettings } from '../../../types';

describe('getCustomPaginationStyles', () => {
  it('should return the correct pagination styles based on the theme settings', () => {
    const themeSettings = {
      chart: {
        textColor: 'black',
        secondaryTextColor: 'gray',
      },
      typography: {
        fontFamily: 'Open Sans',
      },
    } as CompleteThemeSettings;

    const result = getCustomPaginationStyles(themeSettings);

    const expectedStyles = {
      '& .MuiPaginationItem-circular.Mui-selected': {
        color: 'black',
      },
      '& .MuiPaginationItem-circular': {
        color: 'gray',
        fontFamily: 'Open Sans',
      },
    };

    expect(result).toEqual(expectedStyles);
  });
});
