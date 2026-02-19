const getRect = (element: HTMLElement) => element.getBoundingClientRect();

export const detectElementOverflow = (element: HTMLElement, container: HTMLElement) => ({
  get collidedTop() {
    return getRect(element).top < getRect(container).top;
  },
  get collidedBottom() {
    return getRect(element).bottom > getRect(container).bottom;
  },
  get collidedLeft() {
    return getRect(element).left < getRect(container).left;
  },
  get collidedRight() {
    return getRect(element).right > getRect(container).right;
  },
  get overflowTop() {
    return getRect(container).top - getRect(element).top;
  },
  get overflowBottom() {
    return getRect(element).bottom - getRect(container).bottom;
  },
  get overflowLeft() {
    return getRect(container).left - getRect(element).left;
  },
  get overflowRight() {
    return getRect(element).right - getRect(container).right;
  },
});
