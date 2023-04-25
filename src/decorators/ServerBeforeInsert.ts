import type { SyncModel } from '../SyncModel';
import { BeforeInsert } from 'typeorm';
import { Database } from '../Database';

export function ServerBeforeInsert() {
    return function decorator(object: SyncModel, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.isServerDatabase()) {
                BeforeInsert()(object, propertyName);
            }
        });
    };
}
