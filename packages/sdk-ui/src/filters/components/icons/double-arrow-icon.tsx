import type { SVGProps } from 'react';

import { Themable } from '@/theme-provider/types';

export const DoubleArrowIcon = (
  props: Pick<SVGProps<SVGElement>, 'className' | 'width' | 'height' | 'fill' | 'onClick'> & {
    direction: 'left' | 'right';
    disabled?: boolean;
  } & Themable,
) => {
  const inversionClassNames = props.direction === 'left' ? 'csdk-scale-x-[-1]' : '';
  const disablingClassNames = props.disabled ? 'csdk-opacity-0' : '';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
      className={[props.className, inversionClassNames, disablingClassNames].join(' ')}
    >
      <path
        fill={props.fill ?? props.theme.typography.primaryTextColor}
        fillRule="nonzero"
        d="M11.34 12.5L8.62 9.325a.5.5 0 0 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.998 3.5a.5.5 0 1 1-.76-.65l2.72-3.175zm.279-3.175a.5.5 0 0 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.999 3.5a.5.5 0 1 1-.76-.65l2.72-3.175-2.72-3.175z"
      />
    </svg>
  );
};
