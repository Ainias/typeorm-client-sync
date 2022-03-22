import type { SyncEntity } from '../SyncEntity';
import { ColumnOptions } from 'typeorm';
export declare function ServerCreateDateColumn(options?: ColumnOptions): (object: SyncEntity, propertyName: string) => void;
