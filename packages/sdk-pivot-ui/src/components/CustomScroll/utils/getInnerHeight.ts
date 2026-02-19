export default function getInnerHeight(el: Element) {
  const { clientHeight } = el;
  const { paddingTop, paddingBottom } = getComputedStyle(el);
  return clientHeight - parseFloat(paddingTop || '') - parseFloat(paddingBottom || '');
}
