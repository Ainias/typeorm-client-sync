import type { SyncEntity } from "../SyncEntity";
import { Repository } from "typeorm";
export declare class SyncRepository<T extends SyncEntity> extends Repository<T> {
    constructor();
    findAlias(...args: any): Promise<T[]>;
}
