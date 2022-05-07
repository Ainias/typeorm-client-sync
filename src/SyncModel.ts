import {
    Column,
    DeleteDateColumn,
} from 'typeorm';
import { PrimaryServerGeneratedColumn } from './decorators/PrimaryServerGeneratedColumn';
import { ServerBeforeUpdate } from './decorators/ServerBeforeUpdate';
import { ServerBeforeInsert } from './decorators/ServerBeforeInsert';

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
