import type { SyncModel } from '../SyncModel';
import { ColumnOptions } from 'typeorm';
export declare function ServerCreateDateColumn(options?: ColumnOptions): (object: SyncModel, propertyName: string) => void;
