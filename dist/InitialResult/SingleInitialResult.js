"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleInitialResult = void 0;
const Database_1 = require("../Database");
const SyncHelper_1 = require("../Sync/SyncHelper");
class SingleInitialResult {
    constructor(model, entity) {
        this.entity = entity;
        this.model = model;
        this.isServer = typeof window === 'undefined';
        this.date = new Date();
        this.isJson = false;
    }
    toJSON() {
        const modelId = Database_1.Database.getModelIdFor(this.model);
        return {
            isServer: this.isServer,
            date: this.date.toISOString(),
            entity: this.entity ? SyncHelper_1.SyncHelper.toServerResult(this.entity) : null,
            modelId,
            isJson: false,
        };
    }
    static fromJSON(jsonData) {
        if (!('modelId' in jsonData)) {
            return jsonData;
        }
        const model = Database_1.Database.getModelForId(jsonData.modelId);
        const result = new SingleInitialResult(model, null);
        result.date = new Date(jsonData.date);
        result.isServer = jsonData.isServer;
        result.entity = jsonData.entity
            ? SyncHelper_1.SyncHelper.fromServerResult(model, jsonData.entity)
            : null;
        return result;
    }
}
exports.SingleInitialResult = SingleInitialResult;
//# sourceMappingURL=SingleInitialResult.js.map