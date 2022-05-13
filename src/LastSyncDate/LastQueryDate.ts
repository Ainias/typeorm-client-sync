import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class LastQueryDate extends BaseEntity {
    @PrimaryColumn('text')
    query?: string;

    @Column()
    lastQueried?: Date;

    @Column()
    modelId?: number;
}
