import {SyncModel} from "../SyncModel";
import {Database} from "../Database";
import {Column, ColumnOptions} from "typeorm";
import {SimpleColumnType} from "typeorm/driver/types/ColumnTypes";

export function ServerClientColumn(serverOptions: ColumnOptions | SimpleColumnType, clientOptions: ColumnOptions | SimpleColumnType, baseOptions: ColumnOptions = {}) {
    return function decorator(object: SyncModel, propertyName: string) {
        Database.addDecoratorHandler(() => {
            const overrideOptions = Database.getInstance().isServerDatabase() ? serverOptions : clientOptions;
            const mergedOptions = {...baseOptions, ...(typeof overrideOptions === "string" ? {type: overrideOptions} : overrideOptions)};
            Column(mergedOptions)(object, propertyName);
        });
    };
}
