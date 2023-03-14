import { SyncModel } from "../SyncModel";
import { FindManyOptions } from "typeorm";
export type MultipleInitialResultJSON<ModelType extends typeof SyncModel = any> = ReturnType<MultipleInitialResult<ModelType>['toJSON']>;
export declare class MultipleInitialResult<ModelType extends typeof SyncModel> {
    isServer: boolean;
    date: Date;
    model: ModelType;
    entities: InstanceType<ModelType>[];
    isJson: false;
    query?: FindManyOptions<InstanceType<ModelType>>;
    constructor(model: ModelType, entities: InstanceType<ModelType>[], date: Date, query?: FindManyOptions<InstanceType<ModelType>>);
    toJSON(): {
        isServer: boolean;
        date: string;
        entities: import("..").MultipleSyncResults;
        modelId: number;
        isJson: true;
        query: FindManyOptions<InstanceType<ModelType>>;
    };
    static fromJSON<ModelType extends typeof SyncModel>(jsonData: MultipleInitialResultJSON<ModelType> | MultipleInitialResult<ModelType>): MultipleInitialResult<ModelType>;
}
