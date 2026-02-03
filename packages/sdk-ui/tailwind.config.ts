import type { Config } from 'tailwindcss';

import colorsConfig from './src/infra/themes/tailwind.colors.js';

const config: Config = {
  prefix: 'csdk-',
  presets: [colorsConfig],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        ['ai-shadow-sm']: '0px 1px 2px rgba(9, 9, 10, 0.1), 0px 2px 4px rgba(9, 9, 10, 0.1)',
      },
      gridTemplateColumns: {
        // Simple 16 column grid
        auto: 'repeat(auto-fit, minmax(0, 1fr))',
      },
      borderWidth: {
        input: '1px',
      },
      height: {
        button: '28px',
        radio: '12px',
        checkbox: '12px',
      },
      width: {
        radio: '12px',
        checkbox: '12px',
      },
      padding: {
        button: '4px 24px',
        dateInput: '4px 8px',
        radio: '6px',
        checkbox: '6px',
      },
      fontSize: {
        pill: '13px',
        ['tile-title']: '13px',
        'ai-xs': ['11px', '18px'],
        'ai-sm': ['13px', '18px'],
        'ai-base': ['15px', '22px'],
        'ai-lg': ['18px', '22px'],
      },
      borderRadius: {
        pill: '4px',
      },
      margin: {
        radio: '6px 10px 6px 6px',
        checkbox: '6px 10px 6px 6px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};

export default config;
