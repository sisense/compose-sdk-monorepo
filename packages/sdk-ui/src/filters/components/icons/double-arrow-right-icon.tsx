import type { SVGProps } from 'react';

export const DoubleArrowRightIcon = (
  props: Pick<SVGProps<SVGElement>, 'className' | 'width' | 'height' | 'fill' | 'onClick'>,
) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path
      fill={props.fill ?? '#000'}
      fillRule="nonzero"
      d="M11.34 12.5L8.62 9.325a.5.5 0 0 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.998 3.5a.5.5 0 1 1-.76-.65l2.72-3.175zm.279-3.175a.5.5 0 0 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.999 3.5a.5.5 0 1 1-.76-.65l2.72-3.175-2.72-3.175z"
    />
  </svg>
);
