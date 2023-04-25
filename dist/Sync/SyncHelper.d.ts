import type { SyncModel } from '../SyncModel';
import { RelationMetadataArgs } from 'typeorm/metadata-args/RelationMetadataArgs';
import { FindOptionsWhere } from "typeorm";
import { EntityContainer, IdContainer, MultipleSyncResults, SingleSyncResult, SyncContainer } from "./SyncTypes";
import { JSONObject } from "@ainias42/js-helper";
export declare class SyncHelper {
    static getFieldDefinitionsFor(model: typeof SyncModel): {
        columnDefinitions: import("typeorm/metadata-args/ColumnMetadataArgs").ColumnMetadataArgs[];
        relationDefinitions: RelationMetadataArgs[];
    };
    static addToEntityContainer<T extends SyncModel>(entity: T, modelContainer: EntityContainer, depth?: number, idGenerator?: Generator<number>): number;
    static convertToSyncContainer(entityContainer: EntityContainer): SyncContainer;
    static convertToEntityContainer(syncContainer: SyncContainer): EntityContainer;
    static updateEntityContainer(entityContainer: EntityContainer, syncContainer: SyncContainer): EntityContainer;
    static generateEntityContainer(entity: SyncModel, depth?: number): readonly [EntityContainer, number];
    static generateSyncContainer(entity: SyncModel, depth?: number): SyncContainer;
    static removeOlderEntities(syncContainer: SyncContainer, lastQueryDate: Date): void;
    static clone<Model extends SyncModel | SyncModel[]>(entities: Model, depth?: number): Model;
    static toServerResult(entity: SyncModel, depth?: number): SingleSyncResult;
    static toServerResult(entity: SyncModel[], depth?: number): MultipleSyncResults;
    static fromServerResult<ModelType extends typeof SyncModel>(model: ModelType, result: SingleSyncResult): InstanceType<ModelType> | null;
    static fromServerResult<ModelType extends typeof SyncModel>(model: ModelType, result: MultipleSyncResults): InstanceType<ModelType>[];
    static generateIdMap(modelContainer: EntityContainer | SyncContainer): IdContainer;
    static convertWhereToJson(where: FindOptionsWhere<any>): JSONObject;
    static convertJsonToWhere(json: JSONObject): FindOptionsWhere<any>;
}
