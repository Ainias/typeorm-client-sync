import type { SyncModel } from '../SyncModel';
import { ColumnOptions } from 'typeorm';
export declare function ServerUpdateDateColumn(options?: ColumnOptions): (object: SyncModel, propertyName: string) => void;
