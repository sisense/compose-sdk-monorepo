import type { Config } from 'tailwindcss';
import { colors } from './src/themes/colors';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
    },
  },
};

export default config;
