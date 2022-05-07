import { SyncModel } from "../SyncModel";
import { ColumnOptions } from "typeorm";
import { SimpleColumnType } from "typeorm/driver/types/ColumnTypes";
export declare function ServerClientColumn(serverOptions: ColumnOptions | SimpleColumnType, clientOptions: ColumnOptions | SimpleColumnType, baseOptions?: ColumnOptions): (object: SyncModel, propertyName: string) => void;
