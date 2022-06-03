import { SyncJsonOptions } from "../Repository/SyncRepository";
export declare function queryFromClient(lastQueryDate: Date | undefined, queryOptions: SyncJsonOptions, syncOne?: boolean): Promise<{
    lastQueryDate: Date;
    deleted: number[];
    syncContainer: import("../Sync/SyncTypes").SyncContainer;
}>;
