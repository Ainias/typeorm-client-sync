import {
    Column,
    DeleteDateColumn,
} from 'typeorm';
import { PrimaryServerGeneratedColumn } from './decorators/PrimaryServerGeneratedColumn';
import {ServerVersionColumn} from "./decorators/ServerVersionColumn";
import {ServerBeforeUpdate} from "./decorators/ServerBeforeUpdate";

export class SyncModel {

    @PrimaryServerGeneratedColumn()
    id?: number;

    @Column()
    createdAt?: Date;

    @Column()
    updatedAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @ServerVersionColumn()
    version?: number;
}
