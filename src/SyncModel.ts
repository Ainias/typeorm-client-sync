import {
    BaseEntity,
    Column,
    DeleteDateColumn,
    FindManyOptions,
    getMetadataArgsStorage,
    RemoveOptions,
    SaveOptions,
} from 'typeorm';
import { PrimaryServerGeneratedColumn } from './decorators/PrimaryServerGeneratedColumn';
import { JSONObject } from './JSONType';
import { Database } from './Database';
import { EntityContainer, SyncHelper } from './Sync/SyncHelper';
import { ServerBeforeUpdate } from './decorators/ServerBeforeUpdate';
import { ServerBeforeInsert } from './decorators/ServerBeforeInsert';

export type SyncOptions<T> = T & {
    clientOnly?: boolean;
};

export type SyncWithCallbackOptions<T, Result> = T & {
    clientOnly?: boolean;
    callback: (value: Result, isServerData: boolean) => void;
};

export class SyncModel {

    @PrimaryServerGeneratedColumn()
    id?: number;

    @Column()
    createdAt?: Date;

    @Column()
    updatedAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @ServerBeforeInsert()
    updateCreatedAt() {
        this.createdAt = new Date();
    }

    @ServerBeforeInsert()
    @ServerBeforeUpdate()
    updateUpdatedAt() {
        this.updatedAt = new Date();
    }
}
