import {SyncModel} from "../SyncModel";
import {Database} from "../Database";
import {SyncHelper} from "../Sync/SyncHelper";
import {FindOneOptions} from "typeorm";

export type SingleInitialResultJSON<ModelType extends typeof SyncModel = any> = ReturnType<
    SingleInitialResult<ModelType>['toJSON']
>;

export class SingleInitialResult<ModelType extends typeof SyncModel> {
    isServer: boolean;
    date: Date;
    model: ModelType;
    entity: InstanceType<ModelType> | null;
    isJson: false;
    query: FindOneOptions<InstanceType<ModelType>>;

    constructor(model: ModelType, entity: InstanceType<ModelType> | null, date: Date, query: FindOneOptions<InstanceType<ModelType>>) {
        this.entity = entity;
        this.model = model;
        this.isServer = typeof window === 'undefined';
        this.date = date;
        this.isJson = false;
        this.query = query;
    }

    toJSON() {
        const modelId = Database.getModelIdFor(this.model);
        return {
            isServer: this.isServer,
            date: this.date.toISOString(),
            entity: this.entity ? SyncHelper.toServerResult(this.entity) : null,
            modelId,
            isJson: true as const,
            query: this.query // TODO umwandeln?
        };
    }

    static fromJSON<ModelType extends typeof SyncModel>(
        jsonData: SingleInitialResultJSON<ModelType> | SingleInitialResult<ModelType>
    ) {
        if (!('modelId' in jsonData)) {
            return jsonData;
        }

        const model = Database.getModelForId(jsonData.modelId) as ModelType;
        const result = new SingleInitialResult(model,null, new Date(jsonData.date), jsonData.query);
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
