type Groups<T> = { [group: string]: T[] };

export function groupBy<T>(arr: Array<T>, groupFunc: (val: T) => string): Groups<T> {
  const initialGroups: Groups<T> = {};
  return arr.reduce(function (acc, curr) {
    const key = groupFunc(curr);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, initialGroups);
}
