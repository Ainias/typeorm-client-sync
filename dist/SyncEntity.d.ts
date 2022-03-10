import { BaseEntity } from "typeorm";
import { Database } from "./Database";
export declare class SyncEntity extends BaseEntity {
    private static database?;
    private static databaseInitPromise;
    private static decoratorPromises;
    static setDatabase(database: Database): Promise<void>;
    static isServer(): boolean;
    static addDecoratorHandler(handler: () => void): void;
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
