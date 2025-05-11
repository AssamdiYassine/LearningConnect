import { IStorage } from "./storage_fixed";
import { DatabaseStorage } from "./db-storage";
import { extendDatabaseStorage } from "./db-storage-extensions";

// Create an instance of DatabaseStorage
const dbStorage = new DatabaseStorage();

// Extend the instance with additional methods
const extendedStorage = extendDatabaseStorage(dbStorage);

// Export the extended storage as IStorage
// Use type assertion with unknown first to avoid TypeScript error
export const storage: IStorage = extendedStorage as unknown as IStorage;