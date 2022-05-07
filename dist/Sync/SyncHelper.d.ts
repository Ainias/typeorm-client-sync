import type { SyncModel } from '../SyncModel';
import { RelationMetadataArgs } from 'typeorm/metadata-args/RelationMetadataArgs';
import { FindOptionsWhere } from "typeorm";
import { EntityContainer, IdContainer, MultipleSyncResults, SingleSyncResult, SyncContainer } from "./SyncTypes";
import { JSONObject } from "js-helper";
export declare class SyncHelper {
    static getFieldDefinitionsFor(model: typeof SyncModel): {
        columnDefinitions: import("typeorm/metadata-args/ColumnMetadataArgs").ColumnMetadataArgs[];
        relationDefinitions: RelationMetadataArgs[];
    };
    static addToEntityContainer<T extends SyncModel>(entity: T, modelContainer: EntityContainer, depth?: number, idGenerator?: Generator<number>): number;
    static convertToSyncContainer(entityContainer: EntityContainer): SyncContainer;
    static convertToModelContainer(syncContainer: SyncContainer): EntityContainer;
    static updateEntityContainer(entityContainer: EntityContainer, syncContainer: SyncContainer): EntityContainer;
    static generateSyncContainer(model: SyncModel, depth?: number): SyncContainer;
    static toServerResult(entity: SyncModel, depth?: number): SingleSyncResult;
    static toServerResult(entity: SyncModel[], depth?: number): MultipleSyncResults;
    static fromServerResult<ModelType extends typeof SyncModel>(model: ModelType, result: SingleSyncResult): InstanceType<ModelType> | null;
    static fromServerResult<ModelType extends typeof SyncModel>(model: ModelType, result: MultipleSyncResults): InstanceType<ModelType>[];
    static generateIdMap(modelContainer: EntityContainer | SyncContainer): IdContainer;
    static convertWhereToJson(where: FindOptionsWhere<any>): JSONObject;
    static convertJsonToWhere(json: JSONObject): FindOptionsWhere<any>;
}
