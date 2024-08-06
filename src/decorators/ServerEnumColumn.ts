import type { SyncModel } from "../SyncModel";
import { Database } from "../Database";
import { Column, ColumnOptions } from "typeorm";

export function ServerEnumColumn(options: Omit<ColumnOptions, "type">) {
    return function decorator(object: SyncModel, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.isServerDatabase()) {
                Column({...options, type: "enum"})(object, propertyName);
            }
            else {
                Column({...options, type: "varchar"})(object, propertyName);
            }
        });
    };
}
