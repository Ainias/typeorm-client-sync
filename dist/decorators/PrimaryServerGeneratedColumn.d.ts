import type { SyncEntity } from '../SyncEntity';
import { PrimaryGeneratedColumnNumericOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnNumericOptions';
import { PrimaryGeneratedColumnUUIDOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnUUIDOptions';
import { PrimaryGeneratedColumnIdentityOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnIdentityOptions';
import { PrimaryColumnOptions } from 'typeorm/decorator/columns/PrimaryColumn';
import { ColumnType } from 'typeorm/driver/types/ColumnTypes';
declare type PrimaryServerGeneratedColumnOptions = ({
    strategy?: 'increment';
    generatedOptions?: PrimaryGeneratedColumnNumericOptions;
} | {
    strategy: 'uuid';
    generatedOptions?: PrimaryGeneratedColumnUUIDOptions;
} | {
    strategy: 'rowid';
    generatedOptions?: PrimaryGeneratedColumnUUIDOptions;
} | {
    strategy: 'identity';
    generatedOptions?: PrimaryGeneratedColumnIdentityOptions;
}) & {
    options?: PrimaryColumnOptions;
    type?: ColumnType;
};
export declare function PrimaryServerGeneratedColumn({ strategy, generatedOptions, options, type, }?: PrimaryServerGeneratedColumnOptions): (object: SyncEntity, propertyName: string) => void;
export {};
