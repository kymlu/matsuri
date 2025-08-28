import { FormationSongSection } from "../models/FormationSection.ts";
import { categoryList, festivalList, participantsList, songList } from "./ImaHitotabi.ts";

type TableName = "festival" | "song" |  "category" | "participant" | "participantPosition" | "propPosition" | "formationSection";

export class IndexedDBController {
  db!: IDBDatabase;
  isInitialized: boolean = false;

  async init() {
    const request = indexedDB.open("MatsuriDB", 2);
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

      if (!db.objectStoreNames.contains("participantPosition")) {
        db.createObjectStore("participantPosition", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("propPosition")) {
        db.createObjectStore("propPosition", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("formationSection")) {
        db.createObjectStore("formationSection", { keyPath: "id", autoIncrement: true });
      }
    };

  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => {
      this.db = request.result;
      this.addData(); // twice??
      this.isInitialized = true;
      const dbInitializedEvent = new CustomEvent("dbInitialized");
      window.dispatchEvent(dbInitializedEvent);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
  }

  async addData() {
    console.log("Adding data");
    await this.getAll("festival").then(list => {
      if ((list as Array<any>).length === 0) {
        this.upsertList("festival", festivalList)
      }
    });

    await this.getAll("song").then(list => {
      if ((list as Array<any>).length === 0) {
        this.upsertList("song", songList)
      }
    });

    await this.getAll("category").then(list => {
      if ((list as Array<any>).length === 0) {
        this.upsertList("category", categoryList)
      }
    });

    await this.getAll("participant").then(list => {
      if ((list as Array<any>).length === 0) {
        this.upsertList("participant", participantsList)
      }
    });

    await this.getAll("formationSection").then(list => {
      if ((list as Array<any>).length === 0) {
        this.upsertList("formationSection",
            festivalList.flatMap(festival => 
              festival.formations
                .map(formation => 
                  songList.find(song => song.id.localeCompare(formation.songId) === 0)
                  ?.sections?.map(section => (
                    {
                      id: crypto.randomUUID().toString(),
                      songSection: section,
                      songSectionId: section.id,
                      formation: formation,
                      formationId: formation.id
                    } as FormationSongSection)))));
      }
    })
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
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(e);
    });
  }

  async findById(storeName: TableName, id: string) {
    console.log(`findById ${storeName} called`);
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, "readonly").get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(e);
    });
  }

  async upsertItem(storeName: TableName, item: any) {
    console.log(`upsertItem ${storeName} called`);
    return new Promise<number>((resolve, reject) => {
      const request = this._getStore(storeName).put(item);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async upsertList(storeName: TableName, list: Array<any>) {
    console.log(`upsertList ${storeName} called`);
    return new Promise<number>((resolve, reject) => {
      const tx = this._getTransaction(storeName);
      const store = tx.objectStore(storeName);
      list.forEach(item => store.put(item));
      tx.oncomplete = () => resolve(list.length);
      tx.onerror = (e) => reject(e);
    });
  }
}
