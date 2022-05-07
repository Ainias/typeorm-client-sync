import type { SyncModel } from "./SyncModel";
import { ExcludePropertyType, OnlyPropertyType, ReplacePropertyType } from "js-helper";
export declare type JSONSyncModel<Model extends SyncModel> = {
    columns: ReplacePropertyType<ExcludePropertyType<ExcludePropertyType<Model, Function>, SyncModel>, Date, string>;
    relations: OnlyPropertyType<Model, SyncModel> & OnlyPropertyType<Model, SyncModel[]>;
};
