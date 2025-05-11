import { IStorage } from "./storage_fixed";
import { DatabaseStorage } from "./db-storage";
import { extendDatabaseStorage } from "./db-storage-extensions";

// Create an instance of DatabaseStorage
const dbStorage = new DatabaseStorage();

// Extend the instance with additional methods
const extendedStorage = extendDatabaseStorage(dbStorage);

// Export the extended storage as IStorage
export const storage: IStorage = extendedStorage as IStorage;