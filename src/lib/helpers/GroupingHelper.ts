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

export function indexByKey<T extends Record<string, any>, K extends keyof T>(
  items: T[],
  key: K
): Record<string, T> {
  return items.reduce((acc, item) => {
    const groupKey = item[key];
    acc[groupKey] = item; // overwrite if duplicate key
    return acc;
  }, {} as Record<string, T>);
}

export function convertToNestedRecord<T extends Record<string, any>, K extends keyof T> (
  input: Record<string, T[]>,
  keyName: K
): Record<string, Record<string, T>> {
  const result: Record<string, Record<string, T>> = {};

  for (const key in input) {
    const positionsArray = input[key];
    result[key] = {};

    for (const position of positionsArray) {
      result[key][position[keyName]] = position;
    }
  }

  return result;
};

export function selectValuesByKeys<T>(
  record: Record<string, T>,
  keys: string[]
): T[] {
  return keys
    .map(key => record[key])
    .filter((value): value is T => value !== undefined);
}

export function removeKeysFromRecord<T>(record: Record<string, T>, keysToRemove: Set<string>): Record<string, T> {
  const result: Record<string, T> = {};

  for (const key in record) {
    if (!keysToRemove.has(key)) {
      result[key] = record[key];
    }
  }

  return result;
}

export function removeItemsByCondition<T>(
  record: Record<string, T[]>,
  predicate: (item: T) => boolean
): Record<string, T[]> {
  const updatedRecord: Record<string, T[]> = {};

  for (const key in record) {
    const filtered = record[key].filter(item => !predicate(item));
    updatedRecord[key] = filtered;
  }

  return updatedRecord;
}


export function addItemsToRecordByKey<T, K extends string>(
  record: Record<string, T[]>,
  items: T[],
  getKey: (item: T) => K
): Record<string, T[]> {
  const updatedRecord: Record<string, T[]> = { ...record };

  for (const item of items) {
    const key = getKey(item);
    if (!updatedRecord[key]) {
      updatedRecord[key] = [];
    }
    updatedRecord[key].push(item);
  }

  return updatedRecord;
}


export function addItemToRecord<T>(
  record: Record<string, T>,
  key: string,
  newItem: T
): Record<string, T> {
  return {
    ...record,
    [key]: newItem,
  };
}

export function addItemToRecordArray<T>(
  record: Record<string, T[]>,
  key: string,
  newItem: T
): Record<string, T[]> {
  return {
    ...record,
    [key]: [...(record[key] ?? []), newItem],
  };
}

export function addItemsToRecordArray<T>(
  record: Record<string, T[]>,
  key: string,
  newItem: T[]
): Record<string, T[]> {
  return {
    ...record,
    [key]: [...(record[key] ?? []), ...newItem],
  };
}

export function replaceItemsFromDifferentSource<T>(
  record: Record<string, T[]>,
  itemIdsToRemove: string[],
  itemsToAdd: T[],
  getGroupKey: (item: T) => string,
  getUniqueKey: (item: T) => string,
): Record<string, T[]> {
  const removalSet = new Set(itemIdsToRemove);

  // Step 1: Remove items from the original record
  const updatedRecord: Record<string, T[]> = {};
  for (const key in record) {
    const filtered = record[key].filter(
      item => !removalSet.has(getUniqueKey(item))
    );
    if (filtered.length > 0) {
      updatedRecord[key] = filtered;
    }
  }

  // Step 2: Add new items to the correct group
  for (const item of itemsToAdd) {
    const groupKey = getGroupKey(item);
    if (!updatedRecord[groupKey]) {
      updatedRecord[groupKey] = [];
    }
    updatedRecord[groupKey].push(item);
  }

  return updatedRecord;
}