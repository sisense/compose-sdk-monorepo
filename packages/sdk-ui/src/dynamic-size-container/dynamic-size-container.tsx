/* eslint-disable complexity */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type ContainerSize = {
  width: number;
  height: number;
};

export type DynamicSizeContainerProps = {
  children: React.ReactNode | ((size: ContainerSize) => React.ReactNode);
  defaultSize: ContainerSize;
  size?: Partial<ContainerSize>;
  rerenderOnResize?: boolean;
  useContentSize?: {
    width?: boolean;
    height?: boolean;
  };
  onSizeChange?: (size: ContainerSize) => void;
};

/**
 * Calculates the content size based on provided sizes or by container element size.
 *
 * @param container - The container element.
 * @param size - Target size
 * @param defaultSize - Default size
 * @returns The calculated content size.
 */
const calculateContentSize = (
  container: HTMLDivElement | null,
  size: Partial<ContainerSize> | undefined,
  defaultSize: ContainerSize,
) => {
  const inheritedWidth = container?.offsetWidth;
  const inheritedHeight = container?.offsetHeight;

  return {
    width: size?.width || inheritedWidth || defaultSize.width,
    height: size?.height || inheritedHeight || defaultSize.height,
  };
};

/**
 * A container component that adjusts its content size according to provided sizes
 * or dynamically based on inherited size from the parent/containing element.
 *
 * Priorities:
 * (1) If "useContentSize" is specified, it takes the highest priority.
 * (2) Then if a "size" is provided, it takes the priority.
 * (3) Then the container's size is used.
 * (4) Otherwise the "defaultSize" is used.
 *
 *
 *
 * @param {DynamicSizeContainerProps} props - DynamicSizeContainer properties.
 * @returns {JSX.Element} The DynamicSizeContainer component.
 */
export const DynamicSizeContainer = ({
  children,
  defaultSize,
  size,
  rerenderOnResize = false,
  useContentSize,
  onSizeChange,
}: DynamicSizeContainerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [contentSize, setContentSize] = useState<ContainerSize | null>(null);

  const updateContentSize = useCallback(() => {
    const newSize = calculateContentSize(containerRef.current, size, defaultSize);
    setContentSize(newSize);
    onSizeChange?.(newSize);
  }, [containerRef, size, defaultSize, onSizeChange]);

  useLayoutEffect(() => {
    updateContentSize();
  }, [updateContentSize]);

  useEffect(() => {
    // Attach a resize event listener to update content size on window resize.
    window.addEventListener('resize', updateContentSize);
    return () => window.removeEventListener('resize', updateContentSize);
  }, [updateContentSize]);

  const containerStyle: React.CSSProperties = {
    width: size?.width && !useContentSize?.width ? `${size.width}px` : '100%',
    height: size?.height && !useContentSize?.height ? `${size.height}px` : '100%',
  };

  const contentStyle: React.CSSProperties = {
    width: contentSize?.width && !useContentSize?.width ? `${contentSize.width}px` : '100%',
    height: contentSize?.height && !useContentSize?.height ? `${contentSize.height}px` : '100%',
  };

  const contentKey = rerenderOnResize ? `${contentSize?.width}${contentSize?.height}` : '';

  return (
    <div style={containerStyle} ref={containerRef}>
      <div style={contentStyle} key={contentKey}>
        {contentSize && (typeof children === 'function' ? children(contentSize) : children)}
      </div>
    </div>
  );
};
