import { SyncModel } from "../SyncModel";
export declare type MultipleInitialResultJSON<ModelType extends typeof SyncModel = any> = ReturnType<MultipleInitialResult<ModelType>['toJSON']>;
export declare class MultipleInitialResult<ModelType extends typeof SyncModel> {
    isServer: boolean;
    date: Date;
    model: ModelType;
    entities: InstanceType<ModelType>[];
    isJson: boolean;
    constructor(model: ModelType, entities: InstanceType<ModelType>[]);
    toJSON(): {
        isServer: boolean;
        date: string;
        entities: import("..").MultipleSyncResults;
        modelId: number;
        isJson: boolean;
    };
    static fromJSON<ModelType extends typeof SyncModel>(jsonData: MultipleInitialResultJSON<ModelType> | MultipleInitialResult<ModelType>): MultipleInitialResult<ModelType>;
}
