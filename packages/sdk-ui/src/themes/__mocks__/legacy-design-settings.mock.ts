import { CompleteThemeSettings } from '../../types.js';
import { LegacyDesignSettings, LegacyPalette } from '../legacy-design-settings.js';

export const redLegacyDesignSettings: LegacyDesignSettings = {
  oid: '64a408e0affe66003378c8d7',
  typography: {
    customFontSelected: false,
    predefinedFont: 'Open Sans',
    hyperlinkColor: '#1FAFF3',
    hyperlinkHoverColor: '#0065E3',
    primaryTextColor: '#ff0000',
    secondaryTextColor: '#f9a8a8',
    fontFamily: 'Open Sans',
  },
  general: {
    brandColor: '#ff0505',
    primaryButtonHoverColor: '#F2B900',
    primaryButtonTextColor: '#3A4356',
    secondaryButtonBaseColor: '#EDEEF1',
    secondaryButtonHoverColor: '#D0D3DB',
    secondaryButtonTextColor: '#3A4356',
    backgroundColor: '#16161C',
  },
  dashboards: {
    toolbarBackgroundColor: '#16161C',
    toolbarSecondaryTextColor: '#C5C8CF',
    toolbarTextColor: '#FFFFFF',
    colorPaletteName: 'Corporate',
    navBackgroundColor: '#16161C',
    navTextColor: '#FFFFFF',
    navTextHoverColor: '#FFFFFF',
    navHoverBackgroundColor: '#313138',
    panelBackgroundColor: '#313138',
    panelTitleTextColor: '#FFFFFF',
    widgetTextColor: '#FFFFFF',
    widgetSecondaryTextColor: '#C5C8CF',
    widgetBackgroundColor: '#ec4646',
    widgetTitleBackgroundColor: '#4f2727',
    widgetTitleColor: '#fe0000',
    widgetTitleAlignment: 'left',
    widgetSecondaryTitleColor: '#b93434',
    widgetTitleDividerEnabled: false,
    widgetTitleDividerColor: '#FFFFFF',
    widgetBorderEnabled: false,
    widgetBorderColor: '#C5C8CF',
    widgetCornerRadius: 'none',
    widgetShadow: 'none',
    widgetSpacing: 'none',
    layoutBackgroundColor: '#313138',
  },
  isSystem: false,
  name: 'REDRUM',
  isDefault: true,
  lastModified: '2023-07-04T13:32:52.618Z',
  created: '2023-07-04T11:56:16.000Z',
};

export const redThemeSettings: CompleteThemeSettings = {
  chart: {
    textColor: '#FFFFFF',
    backgroundColor: '#ec4646',
    secondaryTextColor: '#C5C8CF',
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
    fontFamily: 'Open Sans',
    primaryTextColor: '#ff0000',
    secondaryTextColor: '#f9a8a8',
    fontsLoader: {
      fonts: [
        {
          fontFamily: 'Open Sans',
          fontStyle: 'normal',
          fontWeight: 'normal',
          src: [
            {
              url: 'http://test.com/resources/base/fonts/Open Sans-Regular.eot',
            },
            {
              local: 'Open Sans-Regular',
            },
            {
              format: 'embedded-opentype',
              url: 'http://test.com/resources/base/fonts/Open Sans-Regular.eot?#iefix',
            },
            {
              format: 'truetype',
              url: 'http://test.com/resources/base/fonts/Open Sans-Regular.ttf',
            },
          ],
        },
        {
          fontFamily: 'Open Sans',
          fontStyle: 'normal',
          fontWeight: 600,
          src: [
            {
              url: 'http://test.com/resources/base/fonts/Open Sans-SemiBold.eot',
            },
            {
              local: 'Open Sans-SemiBold',
            },
            {
              format: 'embedded-opentype',
              url: 'http://test.com/resources/base/fonts/Open Sans-SemiBold.eot?#iefix',
            },
            {
              format: 'truetype',
              url: 'http://test.com/resources/base/fonts/Open Sans-SemiBold.ttf',
            },
          ],
        },
        {
          fontFamily: 'Open Sans',
          fontStyle: 'normal',
          fontWeight: 'bold',
          src: [
            {
              url: 'http://test.com/resources/base/fonts/Open Sans-Bold.eot',
            },
            {
              local: 'Open Sans-Bold',
            },
            {
              format: 'embedded-opentype',
              url: 'http://test.com/resources/base/fonts/Open Sans-Bold.eot?#iefix',
            },
            {
              format: 'truetype',
              url: 'http://test.com/resources/base/fonts/Open Sans-Bold.ttf',
            },
          ],
        },
      ],
    },
  },
  palette: {
    variantColors: ['#779fa8', '#bf1e1d', '#787070'],
  },
  general: {
    brandColor: '#ff0505',
    primaryButtonTextColor: '#3A4356',
    primaryButtonHoverColor: '#F2B900',
    backgroundColor: '#16161C',
    popover: {
      cornerRadius: 0,
      shadow: '0 -1px 5px 1px rgba(58, 67, 86, .2)',
      header: {
        backgroundColor: '#F4F4F8',
        textColor: '#5B6372',
      },
      footer: {
        backgroundColor: '#FFFFFF',
        textColor: '#5B6372',
      },
      content: {
        backgroundColor: '#FFFFFF',
        textColor: '#5B6372',
        clickableList: {
          item: {
            backgroundColor: '#FFFFFF',
            hover: {
              backgroundColor: '#F4F4F8',
              textColor: '#000000',
            },
            textColor: '#5B6372',
          },
        },
      },
      input: {
        backgroundColor: '#F4F4F8',
        textColor: '#5B6372',
        borderColor: {
          default: 'transparent',
          focus: '#5B6372',
          hover: 'transparent',
        },
        cornerRadius: 4,
        dropdownList: {
          backgroundColor: '#FFFFFF',
          textColor: '#5B6372',
          borderColor: '#9EA2AB',
          cornerRadius: 4,
          shadow: '0 -1px 5px 1px rgba(58, 67, 86, .2)',
          item: {
            backgroundColor: {
              default: '#FFFFFF',
              focus: '#FFFFFF',
              hover: '#F4F4F8',
            },
            textColor: '#5B6372',
          },
        },
        datepicker: {
          backgroundColor: '#FFFFFF',
          textColor: '#5B6372',
          cornerRadius: 4,
          shadow: '0 -1px 5px 1px rgba(58, 67, 86, .2)',
          item: {
            backgroundColor: {
              default: '#FFFFFF',
              focus: '#FFFFFF',
              hover: '#F4F4F8',
            },
            textColor: {
              default: '#5B6372',
              focus: '#5B6372',
              hover: '#5B6372',
            },
          },
        },
      },
    },
    buttons: {
      cancel: {
        backgroundColor: {
          default: '#EDEEF1',
          focus: '#D0D3DB',
          hover: '#D0D3DB',
        },
        textColor: '#3A4356',
      },
    },
  },
  widget: {
    border: false,
    borderColor: '#C5C8CF',
    cornerRadius: 'None',
    header: {
      backgroundColor: '#4f2727',
      dividerLine: false,
      dividerLineColor: '#FFFFFF',
      titleAlignment: 'Left',
      titleTextColor: '#fe0000',
      titleFontSize: 15,
    },
    shadow: 'None',
    spaceAround: 'None',
  },
  dashboard: {
    backgroundColor: '#313138',
    dividerLineColor: '#F2F2F2',
    dividerLineWidth: 4,
  },
  filter: {
    panel: {
      backgroundColor: '#313138',
      titleColor: '#FFFFFF',
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

export const corporatePalette: LegacyPalette = {
  _id: '64106b7c984c23001b2d472e',
  colors: ['#779fa8', '#bf1e1d', '#787070'],
  name: 'Corporate',
  isDefault: false,
  sortOrder: 50,
  isSystem: true,
};
