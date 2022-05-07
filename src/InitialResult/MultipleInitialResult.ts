import {SyncModel} from "../SyncModel";
import {Database} from "../Database";
import {SyncHelper} from "../Sync/SyncHelper";

export type MultipleInitialResultJSON<ModelType extends typeof SyncModel = any> = ReturnType<MultipleInitialResult<ModelType>['toJSON']>;

export class MultipleInitialResult<ModelType extends typeof SyncModel> {
    isServer: boolean;
    date: Date;
    model: ModelType;
    entities: InstanceType<ModelType>[];
    isJson: boolean;

    constructor(model: ModelType, entities: InstanceType<ModelType>[]) {
        this.model = model;
        this.entities = entities;
        this.isServer = typeof window === 'undefined';
        this.date = new Date();
        this.isJson = false;
    }

    toJSON() {
        const modelId = Database.getModelIdFor(this.model);
        return {
            isServer: this.isServer,
            date: this.date.toISOString(),
            entities: SyncHelper.toServerResult(this.entities),
            modelId,
            isJson: true,
        };
    }

    static fromJSON<ModelType extends typeof SyncModel>(
        jsonData: MultipleInitialResultJSON<ModelType> | MultipleInitialResult<ModelType>
    ) {
        if (!('modelId' in jsonData)) {
            return jsonData;
        }
        const model = Database.getModelForId(jsonData.modelId) as ModelType;
        const result = new MultipleInitialResult(model, []) as MultipleInitialResult<ModelType>;
        result.date = new Date(jsonData.date);
        result.isServer = jsonData.isServer;
        result.entities = SyncHelper.fromServerResult(
            model,
            jsonData.entities
        );

        return result;
    }
}
