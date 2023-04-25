import type { SyncModel } from '../SyncModel';
import {Column, VersionColumn} from 'typeorm';
import { Database } from '../Database';

export function ServerVersionColumn() {
    return function decorator(object: SyncModel, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.isServerDatabase()) {
                VersionColumn()(object, propertyName);
            }
            else {
                Column()(object, propertyName);
            }
        });
    };
}
