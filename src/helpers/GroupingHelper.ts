export function groupByKey<T extends Record<string, any>, K extends keyof T>(
  items: T[],
  key: K
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const groupKey = item[key];
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}