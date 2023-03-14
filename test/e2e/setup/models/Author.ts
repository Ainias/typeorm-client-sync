import {Column, Entity} from 'typeorm';
import {SyncModel} from '@ainias42/typeorm-sync';

@Entity()
export class Author extends SyncModel {
    @Column()
    name: string;
}
