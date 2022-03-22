import type { SyncEntity } from '../SyncEntity';
import { Column, ColumnOptions } from 'typeorm';
import { Database } from '../Database';

export function ServerCreateDateColumn(options: ColumnOptions = {}) {
    return function decorator(object: SyncEntity, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.getInstance().isServerDatabase()) {
                return Column({
                    ...options,
                    default: () => 'NOW()',
                })(object, propertyName);
            }
            return Column(options)(object, propertyName);
        });
    };
}
