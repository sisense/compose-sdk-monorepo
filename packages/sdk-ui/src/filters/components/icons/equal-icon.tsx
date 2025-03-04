import type { SVGProps } from 'react';

export const EqualIcon = (props: Pick<SVGProps<SVGElement>, 'width' | 'height' | 'color'>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill={props.color ?? '#5B6372'} d="M9 11h7v1H9v-1zm0 2h7v1H9v-1z"></path>
  </svg>
);
