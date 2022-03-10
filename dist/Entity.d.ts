import { BaseEntity } from "typeorm";
import { Database } from "./Database";
export declare class Entity extends BaseEntity {
    private static database?;
    static setDatabase(database: Database): void;
    static isServer(): boolean;
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
