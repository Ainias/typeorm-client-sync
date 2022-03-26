import type { SyncModel } from '../SyncModel';
import { BeforeUpdate } from 'typeorm';
import { Database } from '../Database';

export function ServerBeforeUpdate() {
    return function decorator(object: SyncModel, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.getInstance().isServerDatabase()) {
                BeforeUpdate()(object, propertyName);
            }
        });
    };
}
