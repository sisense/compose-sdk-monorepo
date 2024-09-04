/* eslint-disable sonarjs/no-duplicate-string */
import { CompleteThemeSettings } from '@/types';
import cloneDeep from 'lodash-es/cloneDeep';

export const DEFAULT_DIVIDER_COLOR = '#F2F2F2';
export const DEFAULT_DIVIDER_WIDTH = 4;

const DEFAULT_THEME_SETTINGS_LIGHT: CompleteThemeSettings = {
  chart: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    secondaryTextColor: '#E4E4E4',
    panelBackgroundColor: '#F6F6F6',
    animation: {
      init: {
        duration: 'auto',
      },
      redraw: {
        duration: 'auto',
      },
    },
  },
  typography: {
    fontFamily: '"Open Sans","Roboto","Helvetica","Arial",sans-serif',
    primaryTextColor: '#5B6372',
    secondaryTextColor: '#9EA2AB',
  },
  palette: {
    variantColors: ['#00cee6', '#9b9bd7', '#6eda55', '#fc7570', '#fbb755', '#218a8c'],
  },
  general: {
    backgroundColor: '#ffffff',
    brandColor: '#ffcb05',
    primaryButtonTextColor: '#3a4356',
    primaryButtonHoverColor: '#f2b900',
  },
  widget: {
    spaceAround: 'None',
    cornerRadius: 'None',
    shadow: 'None',
    border: false,
    borderColor: '#9EA2AB',
    header: {
      titleTextColor: '#5B6372',
      titleAlignment: 'Left',
      dividerLine: false,
      dividerLineColor: '#5B6372',
      backgroundColor: '#FFFFFF',
    },
  },
  dashboard: {
    backgroundColor: '#FFFFFF',
    dividerLineWidth: DEFAULT_DIVIDER_WIDTH,
    dividerLineColor: DEFAULT_DIVIDER_COLOR,
  },
  filter: {
    panel: {
      titleColor: '#5B6372',
      backgroundColor: '#F6F6F6',
    },
  },
  aiChat: {
    backgroundColor: 'rgba(244, 244, 248, 1)',
    primaryTextColor: 'rgba(38, 46, 61, 0.8)',
    secondaryTextColor: 'rgba(38, 46, 61, 0.55)',
    primaryFontSize: ['13px', '18px'],
    body: {
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '16px',
      paddingBottom: '1px',
      gapBetweenMessages: '16px',
    },
    footer: {
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '12px',
      paddingBottom: '16px',
    },
    userMessages: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    systemMessages: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      focus: {
        outlineColor: 'rgba(38, 46, 61, 0.5)',
      },
    },
    header: {
      textColor: 'rgba(38, 46, 61, 0.8)',
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    dropup: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0px 1px 2px rgba(9, 9, 10, 0.1), 0px 2px 4px rgba(9, 9, 10, 0.1)',
      borderRadius: '4px',
      headers: {
        textColor: 'rgba(38, 46, 61, 0.8)',
        hover: {
          backgroundColor: 'rgba(244, 244, 248, 1)',
        },
      },
      items: {
        textColor: 'rgba(38, 46, 61, 0.8)',
        hover: {
          backgroundColor: 'rgba(244, 244, 248, 1)',
        },
      },
    },
    border: '1px solid #c6c9ce',
    borderRadius: '30px',
    suggestions: {
      textColor: 'rgba(38, 46, 61, 1)',
      backgroundColor: 'rgba(244, 244, 248, 1)',
      border: '1px solid',
      borderRadius: '16px',
      borderGradient: ['rgba(75, 153, 233, 1)', 'rgba(102, 57, 191, 1)'],
      hover: {
        textColor: 'rgba(38, 46, 61, 1)',
        backgroundColor: 'rgba(12, 14, 18, 0.07)',
      },
      loadingGradient: ['rgba(194, 196, 203, 1)', 'rgba(236, 236, 239, 1)'],
      gap: '8px',
    },
    clickableMessages: {
      textColor: 'rgba(38, 46, 61, 1)',
      backgroundColor: 'rgba(244, 244, 248, 1)',
      border: '1px solid',
      borderGradient: ['rgba(75, 153, 233, 1)', 'rgba(102, 57, 191, 1)'],
      hover: {
        textColor: 'rgba(38, 46, 61, 1)',
        backgroundColor: 'rgba(12, 14, 18, 0.07)',
      },
    },
    dataTopics: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      items: {
        textColor: 'rgba(38, 46, 61, 1)',
        backgroundColor: 'rgba(244, 244, 248, 1)',
      },
    },
    icons: {
      color: 'rgba(38, 46, 61, 0.67)',
      feedbackIcons: {
        hoverColor: 'rgba(12, 14, 18, 0.07)',
      },
    },
    tooltips: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      textColor: 'rgba(38, 46, 61, 0.8)',
      boxShadow: '0px 4px 12px 0px rgba(9, 9, 10, 0.20), 0px 1px 4px 0px rgba(9, 9, 10, 0.10)',
    },
  },
};

const DEFAULT_THEME_SETTINGS_DARK: CompleteThemeSettings = {
  chart: {
    backgroundColor: '#313138',
    textColor: '#FFFFFF',
    secondaryTextColor: '#C5C8CF',
    panelBackgroundColor: '#313138',
    animation: {
      init: {
        duration: 'auto',
      },
      redraw: {
        duration: 'auto',
      },
    },
  },
  typography: {
    fontFamily: '"Open Sans","Roboto","Helvetica","Arial",sans-serif',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#C5C8CF',
  },
  palette: {
    variantColors: ['#00cee6', '#9b9bd7', '#6eda55', '#fc7570', '#fbb755', '#218a8c'], // Variant colors remain the same
  },
  general: {
    backgroundColor: '#16161C',
    brandColor: '#FFCB05',
    primaryButtonTextColor: '#3A4356',
    primaryButtonHoverColor: '#F2B900',
  },
  widget: {
    spaceAround: 'None',
    cornerRadius: 'None',
    shadow: 'None',
    border: false,
    borderColor: '#C5C8CF',
    header: {
      titleTextColor: '#FFFFFF',
      titleAlignment: 'Left',
      dividerLine: false,
      dividerLineColor: '#FFFFFF',
      backgroundColor: '#313138',
    },
  },
  dashboard: {
    backgroundColor: '#313138',
    dividerLineWidth: DEFAULT_DIVIDER_WIDTH,
    dividerLineColor: DEFAULT_DIVIDER_COLOR,
  },
  filter: {
    panel: {
      titleColor: '#FFFFFF',
      backgroundColor: '#313138',
    },
  },
  aiChat: {
    backgroundColor: 'rgba(23, 28, 38, 1)',
    primaryTextColor: 'rgba(242, 247, 255, 0.9)',
    secondaryTextColor: 'rgba(242, 247, 255, 0.4)',
    primaryFontSize: ['13px', '18px'],
    body: {
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '16px',
      paddingBottom: '1px',
      gapBetweenMessages: '16px',
    },
    footer: {
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '12px',
      paddingBottom: '16px',
    },
    userMessages: {
      backgroundColor: 'rgba(31, 92, 153, 1)',
    },
    systemMessages: {
      backgroundColor: 'rgba(46, 55, 77, 1)',
    },
    input: {
      backgroundColor: 'rgba(242, 247, 255, 0.1)',
      focus: {
        outlineColor: 'rgba(242, 247, 255, 0.5)',
      },
    },
    header: {
      backgroundColor: '#313138',
      textColor: 'rgba(242, 247, 255, 0.9)',
    },
    dropup: {
      backgroundColor: 'rgba(38, 46, 64, 1)',
      boxShadow: '0px 1px 4px 0px #020203, 0px 2px 12px 2px rgba(2, 2, 3, 0.25)',
      borderRadius: '8px',
      headers: {
        textColor: 'rgba(242, 247, 255, 0.6)',
        hover: {
          backgroundColor: 'rgba(242, 247, 255, 0.1)',
        },
      },
      items: {
        textColor: 'rgba(242, 247, 255, 0.9)',
        hover: {
          backgroundColor: 'rgba(242, 247, 255, 0.1)',
        },
      },
    },
    border: false,
    borderRadius: '30px',
    suggestions: {
      textColor: 'rgba(88, 192, 244, 1)',
      backgroundColor: 'rgba(23, 28, 38, 1)',
      border: '1px solid',
      borderRadius: '16px',
      borderGradient: ['rgba(75, 153, 233, 1)', 'rgba(102, 57, 191, 1)'],
      hover: {
        textColor: 'rgba(88, 192, 244, 1)',
        backgroundColor: 'rgba(242, 247, 255, 0.1)',
      },
      loadingGradient: ['rgba(242, 247, 255, 0.1)', 'rgba(242, 247, 255, 0.3)'],
      gap: '8px',
    },
    clickableMessages: {
      textColor: 'rgba(88, 192, 244, 1)',
      backgroundColor: 'rgba(23, 28, 38, 1)',
      border: '1px solid',
      borderGradient: ['rgba(75, 153, 233, 1)', 'rgba(102, 57, 191, 1)'],
      hover: {
        textColor: 'rgba(88, 192, 244, 1)',
        backgroundColor: 'rgba(242, 247, 255, 0.1)',
      },
    },
    dataTopics: {
      backgroundColor: 'rgba(23, 28, 38, 1)',
      items: {
        textColor: 'rgba(242, 247, 255, 0.9)',
        backgroundColor: 'rgba(46, 55, 77, 1)',
      },
    },
    icons: {
      color: 'rgba(242, 247, 255, 0.5)',
      feedbackIcons: {
        hoverColor: 'rgba(242, 247, 255, 0.1)',
      },
    },
    tooltips: {
      textColor: 'rgba(242, 247, 255, 0.9)',
      backgroundColor: 'rgba(46, 55, 77, 1)',
      boxShadow: '0px 1px 8px 0px #020203, 0px 4px 24px 4px rgba(2, 2, 3, 0.25)',
    },
  },
};

/**
 * Returns default theme settings, which can be used as base for custom theme options.
 *
 * @param isDarkMode - Boolean value whether to get theme settings for dark mode
 * @returns Theme settings object
 * @internal
 */
export const getDefaultThemeSettings = (isDarkMode = false): CompleteThemeSettings => {
  return isDarkMode
    ? cloneDeep(DEFAULT_THEME_SETTINGS_DARK)
    : cloneDeep(DEFAULT_THEME_SETTINGS_LIGHT);
};
