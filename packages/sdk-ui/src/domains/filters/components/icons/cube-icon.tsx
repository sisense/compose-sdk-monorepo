import type { SVGProps } from 'react';

export const CubeIcon = (
  props: Pick<SVGProps<SVGElement>, 'className' | 'width' | 'height' | 'color'>,
) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill="currentColor"
      d="M18.5 8.228L13 10.343v6.894l5.5-2.39v-6.62zm-.893-.728l-5.113-1.967-5.297 1.892 5.303 2.04L17.607 7.5zM6 8.036v6.8l6 2.423v-6.916L6 8.036zm-1-.888l7.506-2.681 6.994 2.69v8.345l-6.993 3.04L5 15.512V7.147z"
    ></path>
  </svg>
);
