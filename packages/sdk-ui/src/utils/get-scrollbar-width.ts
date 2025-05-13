export const getScrollbarWidth = (): number => {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !document.body ||
    typeof window.innerWidth !== 'number' ||
    typeof document.body.clientWidth !== 'number'
  ) {
    return 0;
  }

  return Math.max(0, window.innerWidth - document.body.clientWidth);
};
