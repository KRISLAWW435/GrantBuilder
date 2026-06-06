import { ProjectData } from "../types.ts";

export interface DraftEntry {
  id: string;
  name: string;
  fund: string;
  sphere: string;
  shortDescription: string;
  currentStep: number;
  stepsData: ProjectData;
  lastModified: number;
  requiredScore?: number;
  isFavorite?: boolean;
}

const DB_NAME = "GrantRiderDrafts";
const STORE_NAME = "drafts";
const DB_VERSION = 2; // Incremented version to ensure upgrade from the old schema if it was created in same browser.

export class DraftStorage {
  private static async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        } else {
          db.deleteObjectStore(STORE_NAME);
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }

    static async getAll(): Promise<DraftEntry[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const results = request.result as DraftEntry[];
          results.sort((a, b) => b.lastModified - a.lastModified);
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to fetch drafts", err);
      // Fallback
      const list = JSON.parse(localStorage.getItem("fallback_drafts") || "[]");
      return list.sort((a: any, b: any) => b.lastModified - a.lastModified);
    }
  }

  static async save(draft: DraftEntry): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(draft);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to save draft", err);
      // Fallback
      let list = JSON.parse(localStorage.getItem("fallback_drafts") || "[]");
      list = list.filter((item: any) => item.id !== draft.id);
      list.push(draft);
      localStorage.setItem("fallback_drafts", JSON.stringify(list));
    }
  }

  static async getById(id: string): Promise<DraftEntry | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result ? request.result : null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to get draft", err);
      const list = JSON.parse(localStorage.getItem("fallback_drafts") || "[]");
      const draft = list.find((item: any) => item.id === id);
      return draft ? draft : null;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to delete draft", err);
      let list = JSON.parse(localStorage.getItem("fallback_drafts") || "[]");
      list = list.filter((item: any) => item.id !== id);
      localStorage.setItem("fallback_drafts", JSON.stringify(list));
    }
  }
}

// Temporary exports to keep FinalStep working while we refactor it
export const getAllDrafts = async () => (await DraftStorage.getAll()).map(d => ({ id: d.id, title: d.name, updatedAt: new Date(d.lastModified).toISOString(), data: d.stepsData }));
export const saveDraftToDB = async (id: string, title: string, data: ProjectData, requiredScore?: number) => await DraftStorage.save({ 
  id, 
  name: title, 
  fund: (data as any).selectedFund || (data as any).step1Data?.fund || "", 
  sphere: (data as any).projectSphereName || (data as any).step2Data?.sphere || "", 
  shortDescription: data.shortDescription, 
  currentStep: 8, 
  stepsData: data, 
  lastModified: Date.now(), 
  requiredScore 
});
export const deleteDraftFromDB = async (id: string) => await DraftStorage.delete(id);

