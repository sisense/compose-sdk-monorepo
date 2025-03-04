import type { SVGProps } from 'react';

export const NotEqualIcon = (props: Pick<SVGProps<SVGElement>, 'width' | 'height' | 'color'>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.color ?? '#5B6372'}
      d="M11.715 12l.488-1H9v-1h3.69l.989-2.025.898.438L13.804 10H16v1h-2.684l-.488 1H16v1h-3.66l-1.035 2.124-.9-.439.823-1.685H9v-1h2.715z"
    ></path>
  </svg>
);
