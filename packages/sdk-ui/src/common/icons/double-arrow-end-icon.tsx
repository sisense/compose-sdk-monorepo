import { Themable } from '@/theme-provider/types';
import type { SVGProps } from 'react';

export const DoubleArrowEndIcon = (
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
      <g fill={props.fill ?? props.theme.typography.primaryTextColor} fillRule="nonzero">
        <path d="M11.61 15.62l2.97-3.33-2.83-3.16a.39.39 0 1 1 .59-.5l3.05 3.42a.39.39 0 0 1 0 .5l-3.19 3.58a.39.39 0 1 1-.59-.5zm-3.87 0l2.97-3.33-2.83-3.16a.39.39 0 1 1 .59-.5l3.05 3.42a.39.39 0 0 1 0 .5l-3.19 3.58a.39.39 0 1 1-.59-.5z" />
        <path d="M16.26 15.86a.39.39 0 0 1-.77 0v-6.97a.39.39 0 0 1 .77 0v6.97z" />
      </g>
    </svg>
  );
};
