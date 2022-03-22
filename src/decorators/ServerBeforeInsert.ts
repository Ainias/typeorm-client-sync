import type { SyncEntity } from '../SyncEntity';
import { BeforeInsert } from 'typeorm';
import { Database } from '../Database';

export function ServerBeforeInsert() {
    return function decorator(object: SyncEntity, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.getInstance().isServerDatabase()) {
                BeforeInsert()(object, propertyName);
            }
        });
    };
}
