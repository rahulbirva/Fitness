export interface AppDatabase {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  runAsync(sql: string, params?: any[]): Promise<any>;
  closeAsync(): Promise<void>;
}
