import type { Config } from 'tailwindcss';
import colorsConfig from './tailwind.colors.config';

const config: Config = {
  presets: [colorsConfig],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
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
      },
      borderRadius: {
        pill: '4px',
      },
      margin: {
        radio: '6px 12px 6px 6px',
        checkbox: '6px 12px 6px 6px',
      },
    },
  },
  plugins: [],
};

export default config;
