import { dbController } from "../lib/dataAccess/DBProvider";
import { TableName, TableTypeMap } from "../lib/dataAccess/IndexedDbManager";

export async function getAll<T extends TableName>(
  storeName: T
): Promise<TableTypeMap[T][]> {
  return dbController.getAll(storeName).then((results) => {
    return results as TableTypeMap[T][];
  });
}

export async function getByFestivalId<T extends "participant" | "prop">(
  storeName: T,
  festivalId: string
): Promise<TableTypeMap[T][]> {
  return dbController.getByFestivalId(storeName, festivalId).then((results) => {
    return results as TableTypeMap[T][];
  });
}

export async function getByFormationId<T extends "formationSection" | "placeholder">(
  storeName: T,
  formationId: string
): Promise<TableTypeMap[T][]> {
  return dbController.getByFormationId(storeName, formationId).then((results) => {
    return results as TableTypeMap[T][];
  });
}

export async function getByFormationSectionId<T extends "participantPosition" | "propPosition" | "notePosition" | "arrowPosition" | "placeholderPosition">(
  storeName: T,
  formationSectionId: string
): Promise<TableTypeMap[T][]> {
  return dbController.getByFormationSectionId(storeName, formationSectionId).then((results) => {
    return results as TableTypeMap[T][];
  });
}

export async function upsertItem<T extends TableName>(
  storeName: T,
  item: TableTypeMap[T]
): Promise<void> {
  dbController.upsertItem(storeName, item);
}

export async function upsertList<T extends TableName>(
  storeName: T,
  list: TableTypeMap[T][]
): Promise<void> {
  dbController.upsertList(storeName, list);
}

export async function removeItem<T extends TableName>(
  storeName: T,
  itemId: string
): Promise<void> {
  dbController.removeItem(storeName, itemId);
}

export async function removeList<T extends TableName>(
  storeName: T,
  idList: string[]
): Promise<void> {
  dbController.removeList(storeName, idList);
}

export async function deleteAll<T extends TableName>(
  storeName: T
): Promise<void> {
  dbController.deleteAll(storeName);
}
