import { DataSource, DataSourceOptions } from 'typeorm';
import type { SyncModel } from './SyncModel';
import { JSONValue, PromiseWithHandlers } from '@ainias42/js-helper';
import { PersistError } from './Errors/PersistError';
import type { SyncResult } from './Errors/SyncResult';
import { QueryError } from './Errors/QueryError';
import { SyncContainer } from "./Sync/SyncTypes";
import type { SyncJsonOptions, SyncRepository } from "./Repository/SyncRepository";
export type DatabaseOptions = DataSourceOptions & ({
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
    private static isClientDb;
    private static decoratorHandlersCalled;
    static isClientDatabase(): boolean;
    static isServerDatabase(): boolean;
    static setIsClientDatabaseFallback(isClientDatabase: boolean): void;
    private static callDecoratorHandlers;
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
    private repositoryPromises;
    private constructor();
    reconnect(options: DatabaseOptions): Promise<this>;
    private connect;
    private static entitiesChanged;
    getConnectionPromise(): Promise<DataSource>;
    getConnection(): DataSource;
    isClientDatabase(): boolean;
    isServerDatabase(): boolean;
    persistToServer(modelId: number, entityId: number, syncContainer: SyncContainer, extraData?: JSONValue): Promise<SyncResult<PersistError>>;
    queryServer(lastQueryDate: Date | undefined, queryOptions: SyncJsonOptions, extraData?: JSONValue): Promise<SyncResult<QueryError>>;
    private static getTableName;
    clearTables(): Promise<void>;
    removeFromServer(modelId: number, entityId: number, extraData?: JSONValue): any;
    setRepository<T extends typeof SyncModel>(model: T, repository: SyncRepository<T>): void;
    getRepository<T extends typeof SyncModel>(model: T): import("typeorm").Repository<InstanceType<T>> & {
        saveAndSync: {
            (entities: InstanceType<T>[], options?: import("typeorm").SaveOptions & {
                runOnServer?: boolean;
                extraData?: JSONValue;
            } & {
                reload: false;
                clientOnly: true;
            }): any;
            (entity: InstanceType<T>, options?: import("typeorm").SaveOptions & {
                runOnServer?: boolean;
                extraData?: JSONValue;
            } & {
                reload: false;
            }): any;
        };
        save: (__0_0: import("typeorm").DeepPartial<InstanceType<T>>, __0_1?: import("typeorm").SaveOptions, __0_2?: boolean) => Promise<import("typeorm").DeepPartial<InstanceType<T>> & InstanceType<T>>;
        remove: (__0_0: InstanceType<T>, __0_1?: import("typeorm").RemoveOptions, __0_2?: boolean) => Promise<InstanceType<T>>;
        saveInitialResult: {
            (initialResult: import(".").SingleInitialResult<T> | {
                isServer: boolean;
                date: string;
                entity: import("./Sync/SyncTypes").SingleSyncResult;
                modelId: number;
                isJson: true;
                query: import("typeorm").FindOneOptions<InstanceType<T>>;
            }): any;
            (initialResult: import(".").MultipleInitialResult<T> | {
                isServer: boolean;
                date: string;
                entities: import("./Sync/SyncTypes").MultipleSyncResults;
                modelId: number;
                isJson: true;
                query: import("typeorm").FindManyOptions<InstanceType<T>>;
            }): any;
        };
        removeAndSync(entity: InstanceType<T>, options?: import("./Repository/SyncRepository").SyncOptions<import("typeorm").RemoveOptions>): Promise<InstanceType<T>>;
        findAndSync(options: import("./Repository/SyncRepository").SyncWithCallbackOptions<import("typeorm").FindManyOptions<InstanceType<T>>, InstanceType<T>[]>): Promise<void>;
        promiseFindAndSync(options?: import("typeorm").FindManyOptions<InstanceType<T>>): Promise<[InstanceType<T>[], InstanceType<T>[]]>;
        findOneAndSync(options: import("./Repository/SyncRepository").SyncWithCallbackOptions<import("typeorm").FindOneOptions<InstanceType<T>>, InstanceType<T>>): Promise<void>;
        initialFind(options?: import("typeorm").FindManyOptions<InstanceType<T>>): Promise<import(".").MultipleInitialResult<T>>;
        initialFindOne(options: import("typeorm").FindOneOptions<InstanceType<T>>): Promise<import(".").SingleInitialResult<T>>;
        initialFindOneBy(options: import("typeorm").FindOptionsWhere<InstanceType<T>> | import("typeorm").FindOptionsWhere<InstanceType<T>>[]): Promise<import(".").SingleInitialResult<T>>;
        initialFindOneById(id: number): Promise<import(".").SingleInitialResult<T>>;
        getRelevantSyncOptions: (options?: import("typeorm").FindManyOptions<InstanceType<T>>) => SyncJsonOptions;
    };
    setRepositoryPromise<T extends typeof SyncModel>(model: T, repositoryPromise: Promise<SyncRepository<T>>): void;
    getRepositoryPromise<T extends typeof SyncModel>(model: T): Promise<import("typeorm").Repository<InstanceType<T>> & {
        saveAndSync: {
            (entities: InstanceType<T>[], options?: import("typeorm").SaveOptions & {
                runOnServer?: boolean;
                extraData?: JSONValue;
            } & {
                reload: false;
                clientOnly: true;
            }): any;
            (entity: InstanceType<T>, options?: import("typeorm").SaveOptions & {
                runOnServer?: boolean;
                extraData?: JSONValue;
            } & {
                reload: false;
            }): any;
        };
        save: (__0_0: import("typeorm").DeepPartial<InstanceType<T>>, __0_1?: import("typeorm").SaveOptions, __0_2?: boolean) => Promise<import("typeorm").DeepPartial<InstanceType<T>> & InstanceType<T>>;
        remove: (__0_0: InstanceType<T>, __0_1?: import("typeorm").RemoveOptions, __0_2?: boolean) => Promise<InstanceType<T>>;
        saveInitialResult: {
            (initialResult: import(".").SingleInitialResult<T> | {
                isServer: boolean;
                date: string;
                entity: import("./Sync/SyncTypes").SingleSyncResult;
                modelId: number;
                isJson: true;
                query: import("typeorm").FindOneOptions<InstanceType<T>>;
            }): any;
            (initialResult: import(".").MultipleInitialResult<T> | {
                isServer: boolean;
                date: string;
                entities: import("./Sync/SyncTypes").MultipleSyncResults;
                modelId: number;
                isJson: true;
                query: import("typeorm").FindManyOptions<InstanceType<T>>;
            }): any;
        };
        removeAndSync(entity: InstanceType<T>, options?: import("./Repository/SyncRepository").SyncOptions<import("typeorm").RemoveOptions>): Promise<InstanceType<T>>;
        findAndSync(options: import("./Repository/SyncRepository").SyncWithCallbackOptions<import("typeorm").FindManyOptions<InstanceType<T>>, InstanceType<T>[]>): Promise<void>;
        promiseFindAndSync(options?: import("typeorm").FindManyOptions<InstanceType<T>>): Promise<[InstanceType<T>[], InstanceType<T>[]]>;
        findOneAndSync(options: import("./Repository/SyncRepository").SyncWithCallbackOptions<import("typeorm").FindOneOptions<InstanceType<T>>, InstanceType<T>>): Promise<void>;
        initialFind(options?: import("typeorm").FindManyOptions<InstanceType<T>>): Promise<import(".").MultipleInitialResult<T>>;
        initialFindOne(options: import("typeorm").FindOneOptions<InstanceType<T>>): Promise<import(".").SingleInitialResult<T>>;
        initialFindOneBy(options: import("typeorm").FindOptionsWhere<InstanceType<T>> | import("typeorm").FindOptionsWhere<InstanceType<T>>[]): Promise<import(".").SingleInitialResult<T>>;
        initialFindOneById(id: number): Promise<import(".").SingleInitialResult<T>>;
        getRelevantSyncOptions: (options?: import("typeorm").FindManyOptions<InstanceType<T>>) => SyncJsonOptions;
    }>;
}
