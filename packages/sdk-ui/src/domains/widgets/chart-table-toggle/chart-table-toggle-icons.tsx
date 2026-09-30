import type { SVGProps } from 'react';

/**
 * Props shared by the chart↔table toggle glyphs.
 *
 * @internal
 */
export type ChartTableToggleIconProps = Pick<
  SVGProps<SVGSVGElement>,
  'className' | 'width' | 'height' | 'color'
>;

const ICON_SIZE = 24;

/**
 * Table glyph shown while the visualization is a chart ("Switch to Table").
 *
 * @internal
 */
export function SwitchToTableIcon({
  width = ICON_SIZE,
  height = ICON_SIZE,
  ...props
}: ChartTableToggleIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
      aria-hidden
    >
      <path
        d="M18.9233 3.69238C19.9427 3.69246 20.7688 4.51874 20.769 5.53809V18.4619C20.7688 19.4813 19.9427 20.3075 18.9233 20.3076H5.07666C4.05739 20.3074 3.23116 19.4812 3.23096 18.4619V5.53809C3.2312 4.51884 4.05741 3.69263 5.07666 3.69238H18.9233ZM4.15381 18.4619C4.15401 18.9714 4.56719 19.3845 5.07666 19.3848H8.76904V8.30762H4.15381V18.4619ZM15.231 19.3848H18.9233C19.4329 19.3847 19.846 18.9715 19.8462 18.4619V8.30762H15.231V19.3848ZM9.69287 19.3848H14.3081V8.30762H9.69287V19.3848ZM5.07666 4.61523C4.56722 4.61548 4.15405 5.02864 4.15381 5.53809V7.38477H19.8462V5.53809C19.8459 5.02854 19.4329 4.61532 18.9233 4.61523H5.07666Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Chart glyph shown while the visualization is a table ("Switch to Chart").
 *
 * @internal
 */
export function SwitchToChartIcon({
  width = ICON_SIZE,
  height = ICON_SIZE,
  ...props
}: ChartTableToggleIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
      aria-hidden
    >
      <path
        d="M3.74119 20.3077V3.23083C3.74119 2.97592 3.52368 2.76929 3.25536 2.76929C2.98704 2.76929 2.76953 2.97592 2.76953 3.23083V20.7693C2.76953 21.0242 2.98704 21.2308 3.25536 21.2308H20.7452C21.0136 21.2308 21.2311 21.0242 21.2311 20.7693C21.2311 20.5144 21.0136 20.3077 20.7452 20.3077H3.74119Z"
        fill="currentColor"
      />
      <path
        d="M7.38492 18.0001V9.69236C7.38492 9.43746 7.17828 9.23083 6.92338 9.23083C6.66848 9.23083 6.46184 9.43746 6.46184 9.69236V18.0001C6.46184 18.255 6.66848 18.4616 6.92338 18.4616C7.17828 18.4616 7.38492 18.255 7.38492 18.0001Z"
        fill="currentColor"
      />
      <path
        d="M18.4618 9.69236V18.0001C18.4618 18.255 18.2552 18.4616 18.0003 18.4616C17.7454 18.4616 17.5388 18.255 17.5388 18.0001V9.69236C17.5388 9.43746 17.7454 9.23083 18.0003 9.23083C18.2552 9.23083 18.4618 9.43746 18.4618 9.69236Z"
        fill="currentColor"
      />
      <path
        d="M11.0772 18.0001V6.00006C11.0772 5.74516 10.8706 5.53852 10.6157 5.53852C10.3608 5.53852 10.1541 5.74516 10.1541 6.00006V18.0001C10.1541 18.255 10.3608 18.4616 10.6157 18.4616C10.8706 18.4616 11.0772 18.255 11.0772 18.0001Z"
        fill="currentColor"
      />
      <path
        d="M14.7695 3.23083V18.0001C14.7695 18.255 14.5629 18.4616 14.308 18.4616C14.0531 18.4616 13.8465 18.255 13.8465 18.0001V3.23083C13.8465 2.97592 14.0531 2.76929 14.308 2.76929C14.5629 2.76929 14.7695 2.97592 14.7695 3.23083Z"
        fill="currentColor"
      />
    </svg>
  );
}
