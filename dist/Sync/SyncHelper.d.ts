import { JSONObject } from '../JSONType';
import type { SyncEntity } from '../SyncEntity';
export declare type ModelContainer = Record<number, Record<number, SyncEntity>>;
export declare type SyncContainer = Record<number, Record<number, {
    columns: {
        id: number;
    } & JSONObject;
    relations: JSONObject;
}>>;
export declare type IdContainer = Record<number, Record<number, number>>;
export declare class SyncHelper {
    static addToModelContainer(model: SyncEntity, modelContainer: ModelContainer, depth?: number, idGenerator?: Generator<number>): number;
    static convertToSyncContainer(modelContainer: ModelContainer): SyncContainer;
    static convertToModelContainer(syncContainer: SyncContainer): ModelContainer;
    static updateModelContainer(modelContainer: ModelContainer, syncContainer: SyncContainer): ModelContainer;
    static generateSyncContainer(model: SyncEntity, depth?: number): SyncContainer;
    static generateIdMap(modelContainer: ModelContainer | SyncContainer): IdContainer;
}
