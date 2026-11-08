import { AppDatabase } from './types';
import { getWebDatabase, resetWebDatabase } from './webDriver';

export * from './types';

let dbInstance: AppDatabase | null = null;

export async function getDatabase(): Promise<AppDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = getWebDatabase() as unknown as AppDatabase;
  return dbInstance;
}

export async function resetDatabase(): Promise<void> {
  resetWebDatabase();
  dbInstance = null;
}
