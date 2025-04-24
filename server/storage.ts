import { IStorage } from "./storage_fixed";
import { DatabaseStorage } from "./db-storage";

// Create and export an instance of DatabaseStorage
export const storage: IStorage = new DatabaseStorage();