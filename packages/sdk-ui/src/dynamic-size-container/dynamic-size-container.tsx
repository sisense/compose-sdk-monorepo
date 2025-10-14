/* eslint-disable complexity */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import isEqual from 'lodash-es/isEqual';

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
  debounceMs?: number;
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
  containerSize: Partial<ContainerSize> | undefined,
  size: Partial<ContainerSize> | undefined,
  defaultSize: ContainerSize,
) => {
  return {
    width: size?.width || containerSize?.width || defaultSize.width,
    height: size?.height || containerSize?.height || defaultSize.height,
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
 * Component Structure:
 * The component layout consists of multiple layers to address different requirements:
 * - Container layer: The top `div` that handles inheriting the parent size.
 * - Content layer: The middle `div` that represents the actual content size.
 * - Detached content layer: The bottom `div` that detaches the internal content (using "absolute" positioning) from the layout to prevent the parent layout from being constrained by its content size.
 *
 * Limitations:
 * - It is not possible to determine if a parent element has no size to inherit or if its size has been explicitly set to "0px".
 *   Therefore, the default size will be applied when the parent element's size is set to "0px".
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
  debounceMs = 300,
}: DynamicSizeContainerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<Partial<ContainerSize> | undefined>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateContainerSize = useCallback(() => {
    const containerElementSize = {
      width: containerRef.current?.offsetWidth,
      height: containerRef.current?.offsetHeight,
    };

    setContainerSize((prevSize) => {
      const isDefaultWidthApplied =
        prevSize?.width === 0 && containerElementSize.width === defaultSize.width;
      const isDefaultHeightApplied =
        prevSize?.height === 0 && containerElementSize.height === defaultSize.height;

      // Prevents "containerSize" from being set to "defaultSize". If the parent container size cannot be inherited, "containerSize" will remain "0".
      const newContainerSize = {
        width: isDefaultWidthApplied ? prevSize.width : containerElementSize.width,
        height: isDefaultHeightApplied ? prevSize.height : containerElementSize.height,
      };

      if (!isEqual(prevSize, newContainerSize)) {
        return newContainerSize;
      }
      return prevSize;
    });
  }, [defaultSize]);

  const debouncedUpdateContainerSize = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      updateContainerSize();
    }, debounceMs);
  }, [updateContainerSize, debounceMs]);

  useLayoutEffect(() => {
    updateContainerSize();
  }, [updateContainerSize]);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    // Use ResizeObserver to monitor container size changes with debouncing
    const resizeObserver = new ResizeObserver(() => {
      debouncedUpdateContainerSize();
    });

    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [debouncedUpdateContainerSize]);

  const contentSize = useMemo(
    () => calculateContentSize(containerSize, size, defaultSize),
    [containerSize, defaultSize, size],
  );

  // call `onSizeChange` callback after rendering this component
  const isContainerSizeDefined = !!containerSize;
  useEffect(() => {
    if (isContainerSizeDefined && onSizeChange) {
      onSizeChange(contentSize);
    }
  }, [contentSize, isContainerSizeDefined, onSizeChange]);

  const containerStyle: React.CSSProperties = {
    width: size?.width && !useContentSize?.width ? `${size.width}px` : '100%',
    height: size?.height && !useContentSize?.height ? `${size.height}px` : '100%',
  };

  const shouldFitContainerWidth = containerSize?.width || containerSize?.width === undefined;
  const shouldFitContainerHeight = containerSize?.height || containerSize?.width === undefined;
  const contentStyle: React.CSSProperties = {
    width: shouldFitContainerWidth || useContentSize?.width ? '100%' : `${contentSize.width}px`,
    height: shouldFitContainerHeight || useContentSize?.height ? '100%' : `${contentSize.height}px`,
    position: 'relative',
  };

  const detachedContentStyle: React.CSSProperties =
    useContentSize?.width || useContentSize?.height
      ? {
          position: 'static',
          width: '100%',
          height: '100%',
        }
      : {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        };

  const contentKey = rerenderOnResize ? `${contentSize?.width}${contentSize?.height}` : '';

  return (
    <div style={containerStyle} ref={containerRef}>
      <div style={contentStyle} key={contentKey}>
        <div style={detachedContentStyle}>
          {contentSize && (typeof children === 'function' ? children(contentSize) : children)}
        </div>
      </div>
    </div>
  );
};
