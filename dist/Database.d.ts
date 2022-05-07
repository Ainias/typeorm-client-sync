import { DataSource, DataSourceOptions, FindManyOptions } from 'typeorm';
import type { SyncModel } from './SyncModel';
import { JSONValue, PromiseWithHandlers } from 'js-helper';
import { PersistError } from './Errors/PersistError';
import type { SyncResult } from './Errors/SyncResult';
import { QueryError } from './Errors/QueryError';
import { SyncContainer } from "./Sync/SyncTypes";
import type { SyncRepository } from "./Repository/SyncRepository";
export declare type DatabaseOptions = DataSourceOptions & ({
    isClient?: false;
} | {
    isClient: true;
    persist: string | typeof Database.prototype.persistToServer;
    query: string | typeof Database.prototype.queryServer;
    remove: string | typeof Database.prototype.removeFromServer;
    fetchOptions?: RequestInit;
});
export declare class Database {
    private static instance?;
    private static instancePromise;
    private static decoratorHandlers;
    private static syncModels;
    static addDecoratorHandler(handler: () => void): void;
    static init(options: DatabaseOptions): Promise<Database>;
    static destroy(): Promise<void>;
    static getInstance(): Database;
    static waitForInstance(): PromiseWithHandlers<Database>;
    static setSyncModels(syncModels: typeof SyncModel[]): void;
    static getModelIdFor(model: typeof SyncModel | SyncModel): number;
    static getModelForId(modelId: number): typeof SyncModel;
    private options;
    private source?;
    private connectionPromise;
    private connectionTry;
    private repositories;
    private constructor();
    reconnect(options: DatabaseOptions): Promise<this>;
    private connect;
    private static entitiesChanged;
    getConnectionPromise(): Promise<DataSource>;
    isClientDatabase(): boolean;
    isServerDatabase(): boolean;
    persistToServer(modelId: number, entityId: number, syncContainer: SyncContainer, extraData?: JSONValue): Promise<SyncResult<PersistError>>;
    queryServer(modelId: number, lastQueryDate: Date | undefined, queryOptions: FindManyOptions, extraData?: JSONValue): Promise<SyncResult<QueryError>>;
    removeFromServer(modelId: number, entityId: number, extraData?: JSONValue): any;
    setRepositoryPromise(model: typeof SyncModel, repositoryPromise: Promise<SyncRepository<any>>): void;
    getRepositoryPromise(model: typeof SyncModel): any;
}
