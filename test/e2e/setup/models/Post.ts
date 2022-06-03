import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from 'typeorm';
import {SyncModel} from 'typeorm-sync';
import {Comment} from "./Comment";
import {Author} from "./Author";

@Entity()
export class Post extends SyncModel {

    @Column()
    text: string;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @ManyToOne(() => Author)
    @JoinColumn()
    author: Author
}
