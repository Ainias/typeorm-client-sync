import { SyncModel } from "../SyncModel";
import { FindOneOptions } from "typeorm";
export declare type SingleInitialResultJSON<ModelType extends typeof SyncModel = any> = ReturnType<SingleInitialResult<ModelType>['toJSON']>;
export declare class SingleInitialResult<ModelType extends typeof SyncModel> {
    isServer: boolean;
    date: Date;
    model: ModelType;
    entity: InstanceType<ModelType> | null;
    isJson: false;
    query: FindOneOptions<InstanceType<ModelType>>;
    constructor(model: ModelType, entity: InstanceType<ModelType> | null, date: Date, query: FindOneOptions<InstanceType<ModelType>>);
    toJSON(): {
        isServer: boolean;
        date: string;
        entity: import("..").SingleSyncResult;
        modelId: number;
        isJson: true;
        query: FindOneOptions<InstanceType<ModelType>>;
    };
    static fromJSON<ModelType extends typeof SyncModel>(jsonData: SingleInitialResultJSON<ModelType> | SingleInitialResult<ModelType>): SingleInitialResult<ModelType>;
}
