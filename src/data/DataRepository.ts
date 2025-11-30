import { indexedDbManager } from "../lib/dataAccess/DBProvider.tsx";
import { TableName, TableTypeMap } from "../lib/dataAccess/IndexedDbManager.ts";

export async function getAll<T extends TableName>(
  storeName: T
): Promise<TableTypeMap[T][]> {
  return indexedDbManager.getAll(storeName).then((results) => {
    return results as TableTypeMap[T][];
  }).catch((error) => {
    console.error(`Error getting all items from store ${storeName}:`, error)
    return []
  });
}

export async function getById<T extends TableName>(
  storeName: T,
  itemId: string
): Promise<TableTypeMap[T] | null> {
  return indexedDbManager.getById(storeName, itemId).then((result) => {
    return result as TableTypeMap[T] | null;
  }).catch((error) => {
    console.error(`Error getting item by ID ${itemId} from store ${storeName}:`, error)
    return null
  });
}

export async function getByFestivalId<T extends "participant" | "prop">(
  storeName: T,
  festivalId: string
): Promise<TableTypeMap[T][]> {
  return indexedDbManager.getByFestivalId(storeName, festivalId).then((results) => {
    return results as TableTypeMap[T][];
  }).catch((error) => {
    console.error(`Error getting items by festival ID ${festivalId} from store ${storeName}:`, error)
    return []
  });
}

export async function getByFormationId<T extends "formationSection" | "placeholder">(
  storeName: T,
  formationId: string
): Promise<TableTypeMap[T][]> {
  return indexedDbManager.getByFormationId(storeName, formationId).then((results) => {
    return results as TableTypeMap[T][];
  }).catch((error) => {
    console.error(`Error getting items by formation ID ${formationId} from store ${storeName}:`, error)
    return []
  });
}

export async function getByFormationSectionId<T extends "participantPosition" | "propPosition" | "notePosition" | "arrowPosition" | "placeholderPosition">(
  storeName: T,
  formationSectionId: string
): Promise<TableTypeMap[T][]> {
  return indexedDbManager.getByFormationSectionId(storeName, formationSectionId).then((results) => {
    return results as TableTypeMap[T][];
  }).catch((error) => {
    console.error(`Error getting items by formation section ID ${formationSectionId} from store ${storeName}:`, error)
    return []
  });
}

export async function upsertItem<T extends TableName>(
  storeName: T,
  item: TableTypeMap[T]
): Promise<void> {
  indexedDbManager.upsertItem(storeName, item).catch((error) => {
    console.error(`Error upserting item in store ${storeName}:`, error)
  });
}

export async function upsertList<T extends TableName>(
  storeName: T,
  list: TableTypeMap[T][]
): Promise<void> {
  indexedDbManager.upsertList(storeName, list).catch((error) => {
    console.error(`Error upserting list in store ${storeName}:`, error)
  });
}

export async function removeItem<T extends TableName>(
  storeName: T,
  itemId: string
): Promise<void> {
  indexedDbManager.removeItem(storeName, itemId).catch((error) => {
    console.error(`Error removing item ID ${itemId} from store ${storeName}:`, error)
  });
}

export async function removeList<T extends TableName>(
  storeName: T,
  idList: string[]
): Promise<void> {
  indexedDbManager.removeList(storeName, idList).catch((error) => {
    console.error(`Error removing list from store ${storeName}:`, error)
  });
}

export async function deleteAll<T extends TableName>(
  storeName: T
): Promise<void> {
  indexedDbManager.deleteAll(storeName).then(() => {
    console.log(`All data deleted from store ${storeName}`)
  }).catch((error) => {
    console.error(`Error deleting all data from store ${storeName}:`, error)
  });
}
