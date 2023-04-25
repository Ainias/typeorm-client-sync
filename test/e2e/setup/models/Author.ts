import {Column, Entity, ManyToMany} from 'typeorm';
import {SyncModel} from '@ainias42/typeorm-sync';
import {Book} from "./Book";

@Entity()
export class Author extends SyncModel {
    @Column()
    name: string;

    @ManyToMany(() => Book, (book: Book) => book.authors)
    books: Book[]
}
