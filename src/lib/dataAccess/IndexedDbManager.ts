import { isNullOrUndefinedOrBlank } from "../helpers/GlobalHelper.ts";
import { DB_NAME } from "../consts.ts";

type TableName = "festival" | "participant" | "prop" | "participantPosition" | "propPosition" | "notePosition" | "arrowPosition" | "formationSection" | "placeholder" | "placeholderPosition";

export class IndexedDBManager {
  db!: IDBDatabase;
  isInitialized: boolean = false;

  async init() {
    const request = indexedDB.open(DB_NAME, 6);
    request.onupgradeneeded = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion;

      console.log(`Upgrading database from ${oldVersion} to ${newVersion}`);
      if (!db.objectStoreNames.contains("festival")) { // todo: additional indexes?
        db.createObjectStore("festival", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("participant")) {
        const participantStore = db.createObjectStore("participant", { keyPath: "id", autoIncrement: true });
        participantStore.createIndex("festivalId", "festivalId", { unique: false });
      } else if (newVersion === 3) { // clear positions as 2.1 makes changes to how x is stored
        (event.currentTarget as IDBOpenDBRequest)?.transaction?.objectStore("participant").clear();
      }

      if (!db.objectStoreNames.contains("prop")) {
        const propStore = db.createObjectStore("prop", { keyPath: "id", autoIncrement: true });
        propStore.createIndex("festivalId", "festivalId", { unique: false });
      } else if (newVersion === 3) { // clear positions as 2.1 makes changes to how x is stored
        (event.currentTarget as IDBOpenDBRequest)?.transaction?.objectStore("prop").clear();
      }

      if (!db.objectStoreNames.contains("placeholder")) {
        const propStore = db.createObjectStore("placeholder", { keyPath: "id", autoIncrement: true });
        propStore.createIndex("formationId", "formationId", { unique: false });
      }
      
      if (!db.objectStoreNames.contains("participantPosition")) {
        const participantPositionStore = db.createObjectStore("participantPosition", { keyPath: "id", autoIncrement: true });
        participantPositionStore.createIndex("participantId", "participantId", { unique: false });
        participantPositionStore.createIndex("formationSectionId", "formationSectionId", { unique: false });
      } else if (newVersion === 3) { // clear positions as 2.1 makes changes to how x is stored
        (event.currentTarget as IDBOpenDBRequest)?.transaction?.objectStore("participantPosition").clear();
      }

      if (!db.objectStoreNames.contains("propPosition")) {
        const propPositionStore = db.createObjectStore("propPosition", { keyPath: "id", autoIncrement: true });
        propPositionStore.createIndex("propId", "propId", { unique: false });
        propPositionStore.createIndex("formationSectionId", "formationSectionId", { unique: false });
      } else if (newVersion === 3) { // clear positions as 2.1 makes changes to how x is stored
        (event.currentTarget as IDBOpenDBRequest)?.transaction?.objectStore("propPosition").clear();
      }

      if (!db.objectStoreNames.contains("notePosition")) {
        const notePositionStore = db.createObjectStore("notePosition", { keyPath: "id", autoIncrement: true });
        notePositionStore.createIndex("formationSectionId", "formationSectionId", { unique: false });
      } else if (newVersion === 3) { // clear positions as 2.1 makes changes to how x is stored
        (event.currentTarget as IDBOpenDBRequest)?.transaction?.objectStore("notePosition").clear();
      }

      if (!db.objectStoreNames.contains("arrowPosition")) {
        const arrowPositionStore = db.createObjectStore("arrowPosition", { keyPath: "id", autoIncrement: true });
        arrowPositionStore.createIndex("formationSectionId", "formationSectionId", { unique: false });
      }

      if (!db.objectStoreNames.contains("placeholderPosition")) {
        const placeholderPositionStore = db.createObjectStore("placeholderPosition", { keyPath: "id", autoIncrement: true });
        placeholderPositionStore.createIndex("formationSectionId", "formationSectionId", { unique: false });
      }

      if (!db.objectStoreNames.contains("formationSection")) {
        const formationSectionStore = db.createObjectStore("formationSection", { keyPath: "id", autoIncrement: true });
        formationSectionStore.createIndex("formationId", "formationId", { unique: false });
      }
    };

  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => {
      this.db = request.result;
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
  }

  _getTransaction(storeName: TableName, mode: IDBTransactionMode = "readwrite") {
    return this.db.transaction(storeName, mode)
  }

  _getStore(storeName: TableName, mode: IDBTransactionMode = "readwrite") {
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  async getAll(storeName: TableName) {
    console.log(`getAll ${storeName} called`);
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, "readonly").getAll();
      request.onsuccess = () => {
        console.log(`resolved getAll ${storeName}: ${request.result.length}`);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error(`error on getAll ${storeName}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async getByFormationId(storeName: "formationSection" | "placeholder", formationId: string) {
    console.log(`getByFormationId ${storeName} called on ${formationId}`);
    return new Promise((resolve, reject) => {
      const index = this._getStore(storeName, "readonly").index("formationId");
      const request = index.getAll(formationId);
      request.onsuccess = () => {
        console.log(`resolved getByFormationId ${storeName}: ${request.result.length}`);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error(`error on getByFormationId ${storeName}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async getByFestivalId(storeName: "participant" | "prop", festivalId: string) {
    console.log(`getByFestivalId ${storeName} called on ${festivalId}`);
    return new Promise((resolve, reject) => {
      const index = this._getStore(storeName, "readonly").index("festivalId");
      const request = index.getAll(festivalId);
      request.onsuccess = () => {
        console.log(`resolved getByFestivalId ${storeName}: ${request.result.length}`);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error(`error on getByFestivalId ${storeName}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async getPositionsByParticipantId(participantId: string) {
    console.log(`getPositionsByParticipantId called on ${participantId}`);
    return new Promise((resolve, reject) => {
      const index = this._getStore("participantPosition", "readonly").index("participantId");
      const request = index.getAll(participantId);
      request.onsuccess = () => {
        console.log(`resolved getPositionsByParticipantId: ${request.result.length}`);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error(`error on getPositionsByParticipantId: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async getByFormationSectionId(storeName: "participantPosition" | "propPosition" | "notePosition" | "arrowPosition" | "placeholderPosition", formationSectionId: string) {
    console.log(`getByFormationSectionId ${storeName} called on ${formationSectionId}`);
    return new Promise((resolve, reject) => {
      const index = this._getStore(storeName, "readonly").index("formationSectionId");
      const request = index.getAll(formationSectionId);
      request.onsuccess = () => {
        console.log(`resolved getByFormationSectionId ${storeName}: ${request.result.length}`);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error(`error on getByFormationSectionId ${storeName}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async findById(storeName: TableName, id: string) {
    console.log(`findById ${storeName} called on ${id}`);
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, "readonly").get(id);
      request.onsuccess = () => {
        console.log(`resolved findById ${storeName}: ${request.result}`);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error(`error on findById ${storeName}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async upsertItem(storeName: TableName, item: any) {
    console.log(`upsertItem ${storeName} called`);
    return new Promise<number>((resolve, reject) => {
      const request = this._getStore(storeName).put(item);
      request.onsuccess = () => {
        console.log(`resolved upsertItem ${storeName}: ${request.result as number}`);
        resolve(request.result as number);
      };
      request.onerror = () => {
        console.error(`error on upsertItem ${storeName}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async upsertList(storeName: TableName, list: Array<any>) {
    console.log(`upsertList ${storeName} called`);
    return new Promise<number>((resolve, reject) => {
      const tx = this._getTransaction(storeName);
      const store = tx.objectStore(storeName);
      list.forEach(item => store.put(item));
      tx.oncomplete = () => {
        console.log(`resolved upsertList ${storeName}: ${list.length}`);
        resolve(list.length);
      };
      tx.onerror = () => {
        console.error(`error on upsertList ${storeName}: ${tx.error}`);
        reject(tx.error);
      };
    });
  }

  async removeItem(storeName: TableName, itemId: string) {
    if (isNullOrUndefinedOrBlank(itemId)) return Promise.resolve(0);
    console.log(`removeItem ${storeName} called`);
    return new Promise<any>((resolve, reject) => {
      const request = this._getStore(storeName).delete(itemId);
      request.onsuccess = () => {
        console.log(`resolved removeItem ${storeName}: ${request.result}`);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error(`error on removeItem ${storeName}: ${request.error}`);
        reject(request.error);
      };
    })
  }

  async removeList(storeName: TableName, idList: Array<string>) {
    idList = idList.filter(id => !isNullOrUndefinedOrBlank(id));
    if (idList.length === 0) return Promise.resolve(0);
    console.log(`removeList ${storeName} called`);
    return new Promise<any>((resolve, reject) => {
      const tx = this._getTransaction(storeName);
      const store = tx.objectStore(storeName);
      idList.forEach(item => store.delete(item));
      tx.oncomplete = () => {
        console.log(`resolved removeList ${storeName}: ${idList.length}`);
        resolve(idList.length);
      };
      tx.onerror = () => {
        console.error(`error on removeList ${storeName}: ${tx.error}`);
        reject(tx.error);
      };
    })
  }

  async deleteAll(storeName: TableName) {
    console.log(`deleteAll ${storeName} called`);
    return new Promise<any>((resolve, reject) => {
      const request = this._getStore(storeName).clear();
      request.onsuccess = () => {
        console.log(`resolved deleteAll ${storeName}`);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error(`error on deleteAll ${storeName}: ${request.error}`);
        reject(request.error);
      };
    })
  }
}
