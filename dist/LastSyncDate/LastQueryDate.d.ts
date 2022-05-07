import { BaseEntity } from 'typeorm';
export declare class LastQueryDate extends BaseEntity {
    query?: string;
    lastQueried?: Date;
}
