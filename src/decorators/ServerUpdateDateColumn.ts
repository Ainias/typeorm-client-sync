import type { SyncEntity } from '../SyncEntity';
import { Column, ColumnOptions } from 'typeorm';
import { Database } from '../Database';

export function ServerUpdateDateColumn(options: ColumnOptions = {}) {
    return function decorator(object: SyncEntity, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.getInstance().isServerDatabase()) {
                return Column({
                    ...options,
                    // transformer: {
                    //     from(val, ...args) {
                    //         console.log('Other args from', args, this);
                    //         return new Date(lastUpdate ?? val);
                    //     },
                    //     to: (val, ...args) => {
                    //         lastUpdate = new Date();
                    //         console.log('LOG calling to', lastUpdate, val, args);
                    //
                    //         object.updatedAt = lastUpdate;
                    //         return lastUpdate.toString();
                    //     },
                    // },
                })(object, propertyName);
            }
            return Column(options)(object, propertyName);
        });
    };
}
