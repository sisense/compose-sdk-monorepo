import type { SVGProps } from 'react';

export const ArrowDownIcon = (
  props: Pick<SVGProps<SVGElement>, 'className' | 'width' | 'height' | 'onClick'>,
) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path
      fill="#000"
      fillRule="nonzero"
      d="M7.589 10L7 10.777 11.99 15 17 10.777 16.413 10l-4.422 3.727z"
    />
  </svg>
);
