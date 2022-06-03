import {Column, Entity} from 'typeorm';
import {SyncModel} from 'typeorm-sync';

@Entity()
export class Author extends SyncModel {
    @Column()
    name: string;
}
