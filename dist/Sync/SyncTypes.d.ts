import type { SyncModel } from "../SyncModel";
import { ExcludePropertyType, OnlyPropertyType, ReplacePropertyType } from "@ainias42/js-helper";
export type JSONSyncModel<Model extends SyncModel> = {
    columns: ReplacePropertyType<ExcludePropertyType<ExcludePropertyType<Model, Function>, SyncModel>, Date, string>;
    relations: ReplacePropertyType<OnlyPropertyType<Model, SyncModel>, SyncModel, number> & ReplacePropertyType<OnlyPropertyType<Model, SyncModel[]>, SyncModel[], number[]>;
};
export type EntityContainer = Record<number, Record<number, SyncModel>>;
export type SyncContainer = Record<number, Record<number, JSONSyncModel<any>>>;
export type IdContainer = Record<number, Record<number, number>>;
export type SingleSyncResult = {
    syncContainer: SyncContainer;
    id?: number;
};
export type MultipleSyncResults = {
    syncContainer: SyncContainer;
    ids: number[];
};
