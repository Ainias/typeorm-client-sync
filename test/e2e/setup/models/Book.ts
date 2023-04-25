import {Column, Entity, ManyToMany, JoinTable} from 'typeorm';
import {SyncModel} from '@ainias42/typeorm-sync';
import {Author} from "./Author";

@Entity()
export class Book extends SyncModel {
    @Column()
    name: string

    @ManyToMany(() => Author, (author: Author) => author.books)
    @JoinTable()
    authors: Author[]
}

