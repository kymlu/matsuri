import { isNullOrUndefined, isNullOrUndefinedOrBlank, strEquals } from "../components/helpers/GlobalHelper.ts";
import { FormationSection } from "../models/FormationSection.ts";
import { CUSTOM_EVENT, DB_NAME } from "./consts.ts";
import { categoryList, festivalList, songList } from "./ImaHitotabi.ts";
import { sampleFormation } from "./SampleFormation.ts";

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
        const participantStore = db.createObjectStore("participant", { keyPath: "id", autoIncrement: true });
        participantStore.createIndex("formationId", "formationId", { unique: false });
      }

      if (!db.objectStoreNames.contains("prop")) {
        const propStore = db.createObjectStore("prop", { keyPath: "id", autoIncrement: true });
        propStore.createIndex("formationId", "formationId", { unique: false });
      }

      if (!db.objectStoreNames.contains("participantPosition")) {
        const participantPositionStore = db.createObjectStore("participantPosition", { keyPath: "id", autoIncrement: true });
        participantPositionStore.createIndex("participantId", "participantId", { unique: false });
        participantPositionStore.createIndex("formationSectionId", "formationSectionId", { unique: false });
      }
      if (!db.objectStoreNames.contains("propPosition")) {
        const propPositionStore = db.createObjectStore("propPosition", { keyPath: "id", autoIncrement: true });
        propPositionStore.createIndex("propId", "propId", { unique: false });
        propPositionStore.createIndex("formationSectionId", "formationSectionId", { unique: false });
      }
      if (!db.objectStoreNames.contains("notePosition")) {
        const notePositionStore = db.createObjectStore("notePosition", { keyPath: "id", autoIncrement: true });
        notePositionStore.createIndex("formationSectionId", "formationSectionId", { unique: false });
      }
      if (!db.objectStoreNames.contains("formationSection")) {
        const formationSectionStore = db.createObjectStore("formationSection", { keyPath: "id", autoIncrement: true });
        formationSectionStore.createIndex("formationId", "formationId", { unique: false });
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
                  {
                    if (strEquals(formation.id, "0")) {
                      return sampleFormation.formationSections
                    } else {
                      return [songList.find(song => strEquals(song.id, formation.songId))
                        ?.sections
                        ?.sort((a, b) => a.order - b.order)[0]]
                        ?.map(section => ({
                          id: crypto.randomUUID().toString(),
                          displayName: section?.name,
                          songSectionId: section!.id,
                          formationId: formation.id,
                          order: 1,
                        } as FormationSection))
                    }
                  }
                ).flatMap(x => x)
              ).flatMap(x => x); // flatten all the way

              console.log(sections);
    
            return this.upsertList("formationSection", sections);
          }
        })
      },
      {
        name: "participants",
        promise: () => this.getAll("participant").then(list => {
          if ((list as Array<any>).length === 0) {
            this.upsertList("participant", sampleFormation.participants);
          }
        })
      },
      {
        name: "props",
        promise: () => this.getAll("prop").then(list => {
          if ((list as Array<any>).length === 0) {
            this.upsertList("prop", sampleFormation.props);
          }
        })
      },
      {
        name: "participantPosition",
        promise: () => this.getAll("participantPosition").then(list => {
          if ((list as Array<any>).length === 0) {
            this.upsertList("participantPosition", sampleFormation.participantPositions);
          }
        })
      },
      {
        name: "propPosition",
        promise: () => this.getAll("propPosition").then(list => {
          if ((list as Array<any>).length === 0) {
            this.upsertList("propPosition", sampleFormation.propPositions);
          }
        })
      },
      {
        name: "notePositions",
        promise: () => this.getAll("notePosition").then(list => {
          if ((list as Array<any>).length === 0) {
            this.upsertList("notePosition", sampleFormation.notes);
          }
        })
      },
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
      var dbInitialized = new CustomEvent(CUSTOM_EVENT.dbInitialized);
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
        console.log(`resolved getAll ${storeName}: ${request.result.length}`);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error(`error on getAll ${storeName}: ${request.error}`);
        reject(request.error);
      };
    });
  }

  async getByFormationId(storeName: "participant" | "prop" | "formationSection", formationId: string) {
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

  async getByFormationSectionId(storeName: "participantPosition" | "propPosition" | "notePosition", formationSectionId: string) {
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
}
