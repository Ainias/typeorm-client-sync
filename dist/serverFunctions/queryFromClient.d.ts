import { FindManyOptions, FindOneOptions } from 'typeorm';
export declare function queryFromClient(modelId: number, lastQueryDate: Date | undefined, queryOptions: FindManyOptions | FindOneOptions, syncOne?: boolean): Promise<{
    lastQueryDate: Date;
    deleted: number[];
    syncContainer: import("../Sync/SyncTypes").SyncContainer;
}>;
