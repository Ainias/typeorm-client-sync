import { FindManyOptions } from 'typeorm';
export declare function queryFromClient(entityId: number, lastQueryDate: Date | undefined, queryOptions: FindManyOptions): Promise<{
    lastQueryDate: Date;
    deleted: any[];
    syncContainer: import("../Sync/SyncHelper").SyncContainer;
}>;
