import type { SyncModel } from '../SyncModel';
import { PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { PrimaryGeneratedColumnNumericOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnNumericOptions';
import { PrimaryGeneratedColumnUUIDOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnUUIDOptions';
import { PrimaryGeneratedColumnIdentityOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnIdentityOptions';
import { PrimaryColumnOptions } from 'typeorm/decorator/columns/PrimaryColumn';
import { ColumnType } from 'typeorm/driver/types/ColumnTypes';
import { Database } from '../Database';

type PrimaryServerGeneratedColumnOptions = (
    | {
          strategy?: 'increment';
          generatedOptions?: PrimaryGeneratedColumnNumericOptions;
      }
    | {
          strategy: 'uuid';
          generatedOptions?: PrimaryGeneratedColumnUUIDOptions;
      }
    | {
          strategy: 'rowid';
          generatedOptions?: PrimaryGeneratedColumnUUIDOptions;
      }
    | {
          strategy: 'identity';
          generatedOptions?: PrimaryGeneratedColumnIdentityOptions;
      }
) & {
    options?: PrimaryColumnOptions;
    type?: ColumnType;
};

export function PrimaryServerGeneratedColumn({
    strategy = 'increment',
    generatedOptions,
    options,
    type,
}: PrimaryServerGeneratedColumnOptions = {}) {
    return function decorator(object: SyncModel, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.getInstance().isServerDatabase()) {
                switch (strategy) {
                    case 'increment': {
                        return PrimaryGeneratedColumn(strategy, generatedOptions)(object, propertyName);
                    }
                    case 'uuid': {
                        return PrimaryGeneratedColumn(strategy, generatedOptions)(object, propertyName);
                    }
                    case 'rowid': {
                        return PrimaryGeneratedColumn(strategy, generatedOptions)(object, propertyName);
                    }
                    case 'identity': {
                        return PrimaryGeneratedColumn(strategy, generatedOptions)(object, propertyName);
                    }
                }
            }
            return PrimaryColumn(type, options)(object, propertyName);
        });
    };
}
