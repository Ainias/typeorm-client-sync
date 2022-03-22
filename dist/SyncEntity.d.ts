import { BaseEntity, FindManyOptions, RemoveOptions, SaveOptions } from 'typeorm';
import { JSONObject } from './JSONType';
export declare type SyncOptions<T> = T & {
    clientOnly?: boolean;
};
export declare type SyncWithCallbackOptions<T, Result> = T & {
    clientOnly?: boolean;
    callback: (value: Result, isServerData: boolean) => void;
};
export declare class SyncEntity extends BaseEntity {
    static getFieldDefinitions(): {
        columnDefinitions: import("typeorm/metadata-args/ColumnMetadataArgs").ColumnMetadataArgs[];
        relationDefinitions: import("typeorm/metadata-args/RelationMetadataArgs").RelationMetadataArgs[];
    };
    static findWithCallback<T = any>(options: SyncWithCallbackOptions<FindManyOptions, T[]>): Promise<void>;
    static find(options?: SyncOptions<FindManyOptions>): Promise<any[]>;
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    updateCreatedAt(): void;
    updateUpdatedAt(): void;
    save(options?: SyncOptions<SaveOptions>): Promise<this>;
    remove(options?: SyncOptions<RemoveOptions>): Promise<this>;
    setColumns(columns: JSONObject): this;
}
