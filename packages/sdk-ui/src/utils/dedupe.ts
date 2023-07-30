export const dedupe = <T>(items: T[], id: (item: T) => string): T[] => {
  const uniqueItems: { [key: string]: T } = {};

  for (const item of items) {
    const itemId = id(item);
    if (!(itemId in uniqueItems)) {
      // eslint-disable-next-line security/detect-object-injection
      uniqueItems[itemId] = item;
    }
  }

  return Object.values(uniqueItems);
};
