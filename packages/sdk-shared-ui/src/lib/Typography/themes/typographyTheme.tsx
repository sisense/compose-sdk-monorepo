import createTheme from '@mui/material/styles/createTheme';

// import { injectStylesWithWrapper } from '@sbi/styleguide';
// import { calcStyles } from './uiCustomization';
import { siColors } from '../../themes';

// injectStylesWithWrapper && injectStylesWithWrapper(calcStyles);

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    titleHero: true;
    titleBig: true;
    titleMedium: true;
    titleSmall: true;
    subTitle: true;
    bodyLabel: true;
    laccent: true;
    bodyParagraph: true;
    paccent: true;
    bodyUI: true;
    overline: true;
    caption: true;
    annotation: true;
    code: true;
  }
}

export const typographyTheme = createTheme({
  components: {
    MuiTypography: {
      variants: [
        {
          props: { variant: 'titleHero' },
          style: {
            fontWeight: 600,
            fontSize: 30,
            lineHeight: '36px',
            letterSpacing: -0.5,
          },
        },
        {
          props: { variant: 'titleBig' },
          style: {
            fontWeight: 400,
            fontSize: 21,
            lineHeight: '24px',
            letterSpacing: -0.2,
          },
        },
        {
          props: { variant: 'titleMedium' },
          style: {
            fontWeight: 600,
            fontSize: '18px',
            lineHeight: '24px',
          },
        },
        {
          props: { variant: 'titleSmall' },
          style: {
            fontWeight: 600,
            fontSize: '15px',
            lineHeight: '20px',
          },
        },
        {
          props: { variant: 'subTitle' },
          style: {
            fontWeight: 700,
            fontSize: '13px',
            lineHeight: '16px',
            letterSpacing: '0.2px',
          },
        },
        {
          props: { variant: 'bodyLabel' },
          style: {
            fontWeight: 400,
            fontSize: '13px',
            lineHeight: '16px',
            letterSpacing: '0.1px',
          },
        },
        {
          props: { variant: 'laccent' },
          style: {
            fontWeight: 600,
            fontSize: '13px',
            lineHeight: '16px',
            letterSpacing: '0.1px',
          },
        },
        {
          props: { variant: 'bodyParagraph' },
          style: {
            fontWeight: 400,
            fontSize: '13px',
            lineHeight: '18px',
          },
        },
        {
          props: { variant: 'paccent' },
          style: {
            fontWeight: 600,
            fontSize: '13px',
            lineHeight: '18px',
          },
        },
        {
          props: { variant: 'bodyUI' },
          style: {
            fontWeight: 400,
            fontSize: '13px',
            lineHeight: '20px',
            letterSpacing: '0.3px',
          },
        },
        {
          props: { variant: 'overline' },
          style: {
            fontWeight: 400,
            fontSize: '11px',
            lineHeight: '16px',
            letterSpacing: '1.5px',
          },
        },
        {
          props: { variant: 'caption' },
          style: {
            fontWeight: 700,
            fontSize: '11px',
            lineHeight: '14px',
            letterSpacing: '0.5px',
          },
        },
        {
          props: { variant: 'annotation' },
          style: {
            fontWeight: 400,
            fontSize: '11px',
            lineHeight: '16px',
            letterSpacing: '0.3px',
          },
        },
        {
          props: { variant: 'code' },
          style: {
            fontFamily: 'Hack',
            fontWeight: 400,
            fontSize: '13px',
            lineHeight: '20px',
          },
        },
      ],
      styleOverrides: {
        root: {
          display: 'inline-block',
          fontFamily: 'Open Sans',
          color: siColors.StTextColors.content,
          '::first-letter': {
            textTransform: 'capitalize',
          },
        },
      },
    },
  },
});

export type TypographyTheme = typeof typographyTheme;
