"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleInitialResult = void 0;
const Database_1 = require("../Database");
const SyncHelper_1 = require("../Sync/SyncHelper");
class SingleInitialResult {
    constructor(model, entity, date, query) {
        this.entity = entity;
        this.model = model;
        this.isServer = typeof window === 'undefined';
        this.date = date;
        this.isJson = false;
        this.query = query;
    }
    toJSON() {
        const modelId = Database_1.Database.getModelIdFor(this.model);
        return {
            isServer: this.isServer,
            date: this.date.toISOString(),
            entity: this.entity ? SyncHelper_1.SyncHelper.toServerResult(this.entity) : null,
            modelId,
            isJson: true,
            query: this.query // TODO umwandeln?
        };
    }
    static fromJSON(jsonData) {
        if (!('modelId' in jsonData)) {
            return jsonData;
        }
        const model = Database_1.Database.getModelForId(jsonData.modelId);
        const result = new SingleInitialResult(model, null, new Date(jsonData.date), jsonData.query);
        result.isServer = jsonData.isServer;
        result.entity = jsonData.entity
            ? SyncHelper_1.SyncHelper.fromServerResult(model, jsonData.entity)
            : null;
        return result;
    }
}
exports.SingleInitialResult = SingleInitialResult;
//# sourceMappingURL=SingleInitialResult.js.map