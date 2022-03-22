import { Database } from './Database';
export declare function useDatabase<T>(executor: (db: Database) => Promise<T>, dependencies?: any[]): any;
