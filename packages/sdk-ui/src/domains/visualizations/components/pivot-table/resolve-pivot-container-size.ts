import type { ContainerSize } from '@/shared/components/dynamic-size-container/dynamic-size-container';

/**
 * Resolves the pivot render viewport from the measured container size.
 *
 * In auto-height mode the pivot reports its own content height; holder height must not track
 * outer layout changes (e.g. widget top-slot narrative growing), or the pivot remeasures in a loop.
 * When auto-height is off, holder height follows the container so fixed-height widgets shrink correctly
 * when drilldown breadcrumbs or other top-slot content appears.
 *
 * @param containerSize - Size reported by {@link DynamicSizeContainer}.
 * @param padding - Pivot padding subtracted from the container size.
 * @param previousSize - Previously resolved pivot viewport, if any.
 * @param isAutoHeight - Whether the pivot is in auto-height mode.
 * @returns The viewport size passed to the pivot renderer.
 * @internal
 */
export function resolvePivotContainerSize(
  containerSize: ContainerSize,
  padding: { readonly vertical: number; readonly horizontal: number },
  previousSize: ContainerSize | null,
  isAutoHeight: boolean,
): ContainerSize {
  const containerHeight = containerSize.height - padding.vertical;
  const width = containerSize.width - padding.horizontal;

  if (previousSize === null) {
    return { width, height: containerHeight };
  }

  return {
    width,
    height: isAutoHeight ? previousSize.height : containerHeight,
  };
}

/**
 * Returns whether the resolved pivot viewport differs from the previous value.
 * @param previousSize - The previously resolved pivot viewport, or null on first measure.
 * @param nextSize - The next resolved pivot viewport.
 * @returns True if the resolved pivot viewport differs from the previous value, false otherwise.
 * @internal
 */
export function hasPivotContainerSizeChanged(
  previousSize: ContainerSize | null,
  nextSize: ContainerSize,
): boolean {
  return (
    previousSize === null ||
    previousSize.width !== nextSize.width ||
    previousSize.height !== nextSize.height
  );
}
