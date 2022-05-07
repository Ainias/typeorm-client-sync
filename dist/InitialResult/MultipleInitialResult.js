"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleInitialResult = void 0;
const Database_1 = require("../Database");
const SyncHelper_1 = require("../Sync/SyncHelper");
class MultipleInitialResult {
    constructor(model, entities) {
        this.model = model;
        this.entities = entities;
        this.isServer = typeof window === 'undefined';
        this.date = new Date();
        this.isJson = false;
    }
    toJSON() {
        const modelId = Database_1.Database.getModelIdFor(this.model);
        return {
            isServer: this.isServer,
            date: this.date.toISOString(),
            entities: SyncHelper_1.SyncHelper.toServerResult(this.entities),
            modelId,
            isJson: true,
        };
    }
    static fromJSON(jsonData) {
        if (!('modelId' in jsonData)) {
            return jsonData;
        }
        const model = Database_1.Database.getModelForId(jsonData.modelId);
        const result = new MultipleInitialResult(model, []);
        result.date = new Date(jsonData.date);
        result.isServer = jsonData.isServer;
        result.entities = SyncHelper_1.SyncHelper.fromServerResult(model, jsonData.entities);
        return result;
    }
}
exports.MultipleInitialResult = MultipleInitialResult;
//# sourceMappingURL=MultipleInitialResult.js.map