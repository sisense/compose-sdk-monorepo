import type { SVGProps } from 'react';

export const CheckIcon = (
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
      fill={props.color}
      d="M8.354 11.646l-.708.708 3.418 3.417 5.343-7.48-.814-.582-4.657 6.52z"
    ></path>
  </svg>
);
