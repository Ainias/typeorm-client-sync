import type { SyncEntity } from '../SyncEntity';
import { BeforeUpdate } from 'typeorm';
import { Database } from '../Database';

export function ServerBeforeUpdate() {
    return function decorator(object: SyncEntity, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.getInstance().isServerDatabase()) {
                BeforeUpdate()(object, propertyName);
            }
        });
    };
}
