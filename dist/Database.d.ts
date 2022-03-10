import { Connection, ConnectionOptions } from "typeorm";
import { SyncEntity } from "./SyncEntity";
declare type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export declare type DatabaseOptions = DistributiveOmit<ConnectionOptions, "entities"> & {
    isClient?: boolean;
    serverUrl?: string;
    entities: ({
        new (): SyncEntity;
        setDatabase(db: Database): void;
    })[];
};
export declare class Database {
    private static instance?;
    static init(options: DatabaseOptions): Promise<Database>;
    private options;
    private connection?;
    private constructor();
    private connect;
    getConnection(): Connection;
    isClientDatabase(): boolean;
    isServerDatabase(): boolean;
}
export {};
