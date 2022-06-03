import {Column, Entity, ManyToOne, JoinColumn} from 'typeorm';
import {SyncModel} from 'typeorm-sync';
import {Post} from "./Post";
import {Author} from "./Author";

@Entity()
export class Comment extends SyncModel {

    @Column()
    comment: string;

    @ManyToOne(() => Post, post => post.comments)
    @JoinColumn()
    post: Post;

    @ManyToOne(() => Author)
    @JoinColumn()
    author: Author
}
