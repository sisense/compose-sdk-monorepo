import type { SVGProps } from 'react';

export const GreaterThanIcon = (
  props: Pick<SVGProps<SVGElement>, 'width' | 'height' | 'color'>,
) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.color ?? '#5B6372'}
      d="M8.06 9.89L8.517 9l6.785 3.48-6.85 3.476L8 15.065l5.102-2.59z"
    ></path>
  </svg>
);
