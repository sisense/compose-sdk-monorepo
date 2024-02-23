export const FORMAT = {
  A0: 0,
  A1: 1,
  A2: 2,
  A3: 3,
  A4: 4,
  A5: 5,
  LEGAL: 6,
  LETTER: 7,
  TABLOID: 8,
};

export const ORIENTATION = {
  PORTRAIT: 1,
  LANDSCAPE: 2,
};

export const CONSTANTS = {
  MM_PER_INCH: 25.4,
  DPI: 95,
  FOOTER_HEIGHT: 40,
  HEADER_HEIGHT: 40,
};

export const LAYOUT = {
  PREVIEW: 'print-preview',
  CONTAINER: 'print-layout',
  PAGE: 'print-layout__page',
  LAYOUT_PREVIEW: 'print-layout--preview',
  SHOW_FOOTER: 'print-layout__with-footer',
  FOOTER: 'page-footer',
  FOOTER_PREVIEW_TEXT: 'page-footer__preview-text',
};

export const HEADER = {
  TITLE: 'page-header__title',
  CONTAINER: 'page-header',
  CONTENT_WRAPPER: 'page-header__content',
  TITLE_WRAPPER: 'page-header__title-container',
  SHOW_CONTENT: 'page-header__content--show',
  RENAME_CONTROLS: 'page-header__rename-controls',
  RENAME_ACTION: 'page-header__rename-controls__action',
  RENAME_OK: 'page-header__rename-controls__action--ok',
  RENAME_CANCEL: 'page-header__rename-controls__action--cancel',
  DIVIDER: 'page-header__header-divider',
  EDITORS: 'page-header__editors',
  FOCUSED: 'page-header__title-container--focused',
  VERTICAL_LINE: 'page-header__vertical-line',
  LEFT_TEXT: 'page-header__editors__left-text',
  CENTER_TEXT: 'page-header__editors__center-text',
  END_TEXT: 'page-header__editors__end-text',
};

export const FONT_MAP: Record<string, string> = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

export const POSITION_MAP: Record<string, string> = {
  START: 'flex-start',
  CENTER: 'center',
  END: 'flex-end',
};

export const FONT_SIZE: Record<string, string> = {
  small: '13px',
  medium: '16px',
  large: '20px',
};

export const JUSTIFY_CONTENT: Record<string, string> = {
  'flex-start': 'flex-start',
  center: 'center',
  'flex-end': 'flex-end',
};

export const TEXT_ALIGN: Record<string, string> = {
  'flex-start': 'left',
  center: 'center',
  'flex-end': 'end',
};

export default CONSTANTS;
