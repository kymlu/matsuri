import { isNullOrUndefined, isNullOrUndefinedOrBlank, strEquals } from "../components/helpers/GlobalHelper.ts";
import { FormationSongSection } from "../models/FormationSection.ts";
import { CUSTOM_EVENT, DB_NAME } from "./consts.ts";
import { categoryList, festivalList, teamMembers, songList } from "./ImaHitotabi.ts";

type TableName = "festival" | "song" |  "category" | "participant" | "prop" | "participantPosition" | "propPosition" | "notePosition" | "formationSection";

export class IndexedDBController {
  db!: IDBDatabase;
  isInitialized: boolean = false;

  async init() {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = async (event) => {
      console.log("Upgrading database");
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("festival")) { // todo: additional indexes?
        db.createObjectStore("festival", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("song")) { // todo: additional indexes?
        db.createObjectStore("song", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("category")) { // todo: additional indexes?
        db.createObjectStore("category", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("participant")) {
        db.createObjectStore("participant", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("prop")) {
        db.createObjectStore("prop", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("participantPosition")) {
        db.createObjectStore("participantPosition", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("propPosition")) {
        db.createObjectStore("propPosition", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("notePosition")) {
        db.createObjectStore("notePosition", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("formationSection")) {
        db.createObjectStore("formationSection", { keyPath: "id", autoIncrement: true });
      }
    };

  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => {
      this.db = request.result;
      this.addData();
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
  }

  async addData() {
    console.log("Adding data");
    const tasks = [
      {
        name: "festival",
        promise: () => this.getAll("festival").then(list => {
          if ((list as Array<any>).length === 0) {
            return this.upsertList("festival", festivalList);
          }
        })
      },
      {
        name: "song",
        promise: () => this.getAll("song").then(list => {
          if ((list as Array<any>).length === 0) {
            return this.upsertList("song", songList);
          }
        })
      },
      {
        name: "category",
        promise: () => this.getAll("category").then(list => {
          if ((list as Array<any>).length === 0) {
            return this.upsertList("category", categoryList);
          }
        })
      },
      {
        name: "formationSection",
        promise: () => this.getAll("formationSection").then(list => {
          if ((list as Array<any>).length === 0) {
            const sections = festivalList
              .flatMap(festival => 
                festival.formations.map(formation => 
                  [songList.find(song => strEquals(song.id, formation.songId))
                    ?.sections
                    ?.sort((a, b) => a.order - b.order)[0]]
                    ?.map(section => ({
                      id: crypto.randomUUID().toString(),
                      displayName: section?.name,
                      songSectionId: section!.id,
                      formationId: formation.id,
                      order: 1,
                    } as FormationSongSection))
                ).flatMap(x => x)
              ).flatMap(x => x); // flatten all the way

              console.log(sections);
    
            return this.upsertList("formationSection", sections);
          }
        })
      }
    ];    

    // Handle each as it resolves
    const runningTasks = tasks.map(({name, promise}) => {
      return promise()
        .then(result => {
          if (!isNullOrUndefined(result)) console.log(`Insert ${name} succeeded:`, result);
        })
        .catch(error => {
          console.error(`Insert ${name} failed:`, error);
        });
    });

    await Promise.allSettled(runningTasks).then(() => {
      var dbInitialized = new CustomEvent(CUSTOM_EVENT.dbInitialized.toString());
      window.dispatchEvent(dbInitialized);
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
        console.log(`resolved getAll: ${request.result}`);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error(`error on getAll: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async findById(storeName: TableName, id: string) {
    console.log(`findById ${storeName} called`);
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, "readonly").get(id);
      request.onsuccess = () => {
        console.log(`resolved findById: ${request.result}`);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error(`error on findById: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async upsertItem(storeName: TableName, item: any) {
    console.log(`upsertItem ${storeName} called`);
    return new Promise<number>((resolve, reject) => {
      const request = this._getStore(storeName).put(item);
      request.onsuccess = () => {
        console.log(`resolved upsertItem: ${request.result as number}`);
        resolve(request.result as number);
      };
      request.onerror = () => {
        console.error(`error on upsertItem: ${request.error}`);
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
        console.log(`resolved upsertList: ${list.length}`);
        resolve(list.length);
      };
      tx.onerror = () => {
        console.error(`error on upsertList: ${tx.error}`);
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
        console.log(`resolved removeItem: ${request.result}`);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error(`error on removeItem: ${request.error}`);
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
        console.log(`resolved removeList: ${idList.length}`);
        resolve(idList.length);
      };
      tx.onerror = () => {
        console.error(`error on removeList: ${tx.error}`);
        reject(tx.error);
      };
    })
  }
}
