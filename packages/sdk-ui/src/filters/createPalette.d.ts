import '@mui/material/styles';

type Secondary = {
  default: string;
  hover: string;
};

type Text = {
  active: string;
  content: string;
  secondary: string;
  disabled: string;
  link: string;
  accented: string;
  linkButton: string;
};

type UI = {
  default: string;
  additional: string;
  guiding: string;
};

type Background = {
  workspace: string;
  supporting: string;
  priority: string;
};

type Primary = {
  primary: string;
};

type Interaction = {
  defaultHover: string;
  guidingHover: string;
  linkHovered: string;
  primaryHovered: string;
};

type Semantic = {
  info: string;
  success: string;
  warning: string;
  error: string;
  infoBG: string;
  successBG: string;
  warningBG: string;
  errorBG: string;
};

type Text2 = {
  active: string;
  content: string;
  secondary: string;
  disabled: string;
  link: string;
  accented: string;
};

type Ui = {
  default: string;
  additional: string;
  guiding: string;
};

type Background2 = {
  workspace: string;
  supporting: string;
  priority: string;
};

type Interaction2 = {
  defaultHover: string;
  guidingHover: string;
  linkHovered: string;
  primaryHovered: string;
};

type Semantic2 = {
  info: string;
  success: string;
  warning: string;
  error: string;
  infoBG: string;
  successBG: string;
  warningBG: string;
  errorBG: string;
};

type SisenseDark = {
  text: Text2;
  ui: Ui;
  background: Background2;
  interaction: Interaction2;
  semantic: Semantic2;
};
type SisensePalette = {
  secondary: Secondary;
  text: Text;
  UI: UI;
  background: Background;
  primary: Primary;
  interaction: Interaction;
  semantic: Semantic;
  sisenseDark: SisenseDark;
};
declare module '@mui/material/styles' {
  interface Palette {
    sisense: SisensePalette;
  }
  interface PaletteOptions {
    sisense: SisensePalette;
  }
}
