import type { SyncModel } from "../SyncModel";
import { ExcludePropertyType, OnlyPropertyType, ReplacePropertyType } from "js-helper";
export declare type JSONSyncModel<Model extends SyncModel> = {
    columns: ReplacePropertyType<ExcludePropertyType<ExcludePropertyType<Model, Function>, SyncModel>, Date, string>;
    relations: ReplacePropertyType<OnlyPropertyType<Model, SyncModel>, SyncModel, number> & ReplacePropertyType<OnlyPropertyType<Model, SyncModel[]>, SyncModel[], number[]>;
};
export declare type EntityContainer = Record<number, Record<number, SyncModel>>;
export declare type SyncContainer = Record<number, Record<number, JSONSyncModel<any>>>;
export declare type IdContainer = Record<number, Record<number, number>>;
export declare type SingleSyncResult = {
    syncContainer: SyncContainer;
    id?: number;
};
export declare type MultipleSyncResults = {
    syncContainer: SyncContainer;
    ids: number[];
};
