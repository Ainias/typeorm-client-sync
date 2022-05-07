import {SyncModel} from "../SyncModel";
import {Database} from "../Database";
import {SyncHelper} from "../Sync/SyncHelper";

export type SingleInitialResultJSON<ModelType extends typeof SyncModel = any> = ReturnType<
    SingleInitialResult<ModelType>['toJSON']
>;

export class SingleInitialResult<ModelType extends typeof SyncModel> {
    isServer: boolean;
    date: Date;
    model: ModelType;
    entity: InstanceType<ModelType> | null;
    isJson: boolean;

    constructor(model: ModelType, entity: InstanceType<ModelType> | null) {
        this.entity = entity;
        this.model = model;
        this.isServer = typeof window === 'undefined';
        this.date = new Date();
        this.isJson = false;
    }

    toJSON() {
        const modelId = Database.getModelIdFor(this.model);
        return {
            isServer: this.isServer,
            date: this.date.toISOString(),
            entity: this.entity ? SyncHelper.toServerResult(this.entity) : null,
            modelId,
            isJson: false,
        };
    }

    static fromJSON<ModelType extends typeof SyncModel>(
        jsonData: SingleInitialResultJSON<ModelType> | SingleInitialResult<ModelType>
    ) {
        if (!('modelId' in jsonData)) {
            return jsonData;
        }

        const model = Database.getModelForId(jsonData.modelId) as ModelType;
        const result = new SingleInitialResult(model,null);
        result.date = new Date(jsonData.date);
        result.isServer = jsonData.isServer;
        result.entity = jsonData.entity
            ? SyncHelper.fromServerResult<ModelType>(
                  model,
                  jsonData.entity
              )
            : null;

        return result;
    }
}
