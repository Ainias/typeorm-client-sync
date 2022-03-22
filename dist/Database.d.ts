import { Connection, ConnectionOptions, FindManyOptions } from 'typeorm';
import type { SyncEntity } from './SyncEntity';
import { PromiseWithHandlers } from 'js-helper';
import { PersistError } from './Errors/PersistError';
import type { SyncResult } from './Errors/SyncResult';
import type { SyncContainer } from './Sync/SyncHelper';
import { QueryError } from './Errors/QueryError';
export declare type DatabaseOptions = ConnectionOptions & {
    syncEntities: ({
        new (): SyncEntity;
    } & typeof SyncEntity)[];
} & ({
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
    private static databaseInitPromise;
    private static decoratorPromises;
    static addDecoratorHandler(handler: () => void): void;
    static init(options: DatabaseOptions): Promise<Database>;
    static getInstance(): Database;
    static waitForInstance(): PromiseWithHandlers<Database>;
    private options;
    private connection?;
    private connectionPromise;
    private constructor();
    private connect;
    getConnectionPromise(): PromiseWithHandlers<Connection>;
    getConnection(): Connection;
    isClientDatabase(): boolean;
    isServerDatabase(): boolean;
    getEntityIdFor(classVal: typeof SyncEntity | SyncEntity): number;
    getEntityForId(entityId: number): (new () => SyncEntity) & typeof SyncEntity;
    persistToServer(entityId: number, modelId: number, syncContainer: SyncContainer): Promise<SyncResult<PersistError>>;
    queryServer(entityId: number, lastQueryDate: Date | undefined, queryOptions: FindManyOptions): Promise<SyncResult<QueryError>>;
    removeFromServer(entityId: number, modelId: number): any;
}
