import type { SVGProps } from 'react';

export const GreaterThanOrEqualIcon = (
  props: Pick<SVGProps<SVGElement>, 'width' | 'height' | 'color'>,
) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.color ?? '#5B6372'}
      d="M9.06 8.89L9.517 8l6.785 3.48-6.85 3.476L9 14.065l5.102-2.59L9.06 8.89zM9 17h7v1H9v-1z"
    ></path>
  </svg>
);
