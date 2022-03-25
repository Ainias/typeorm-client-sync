import type {SyncEntity} from "../SyncEntity";
import {Repository} from "typeorm";

export class SyncRepository<T extends SyncEntity> extends Repository<T> {


    constructor() {
        super(undefined, undefined, undefined);
    }

    findAlias(...args: any) {
        console.log(this.createQueryBuilder());
        return this.find(...args);
    }
}
