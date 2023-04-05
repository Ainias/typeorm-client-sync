"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFromClient = void 0;
const typeorm_1 = require("typeorm");
const Database_1 = require("../Database");
const SyncHelper_1 = require("../Sync/SyncHelper");
const js_helper_1 = require("@ainias42/js-helper");
const SyncRepository_1 = require("../Repository/SyncRepository");
function queryFromClient(lastQueryDate, queryOptions, syncOne = false) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        console.log("LOG-d queryOptions", queryOptions);
        const { modelId } = queryOptions;
        const deleteOptions = js_helper_1.JsonHelper.deepCopy(queryOptions);
        queryOptions.where = SyncHelper_1.SyncHelper.convertJsonToWhere((_a = queryOptions.where) !== null && _a !== void 0 ? _a : {});
        deleteOptions.where = SyncHelper_1.SyncHelper.convertJsonToWhere((_b = deleteOptions.where) !== null && _b !== void 0 ? _b : {});
        if (lastQueryDate) {
            if (Array.isArray(queryOptions.where)) {
                queryOptions.where.forEach((orCondition) => (orCondition.updatedAt = (0, typeorm_1.MoreThan)(lastQueryDate)));
            }
            else {
                queryOptions.where.updatedAt = (0, typeorm_1.MoreThan)(lastQueryDate);
            }
        }
        const compareOperator = lastQueryDate ? (0, typeorm_1.MoreThan)(lastQueryDate) : (0, typeorm_1.Not)((0, typeorm_1.IsNull)());
        if (Array.isArray(deleteOptions.where)) {
            deleteOptions.where.forEach((orCondition) => (orCondition.deletedAt = compareOperator));
        }
        else {
            deleteOptions.where.deletedAt = compareOperator;
        }
        deleteOptions.withDeleted = true;
        deleteOptions.select = ['id'];
        const model = Database_1.Database.getModelForId(modelId);
        const newLastQueryDate = new Date();
        const repository = yield (0, SyncRepository_1.waitForSyncRepository)(model);
        const entityPromise = syncOne ? repository.findOne(queryOptions).then(entity => entity ? [entity] : []) : repository.find(queryOptions);
        const deletedPromise = syncOne ? repository.findOne(deleteOptions).then(entity => entity ? [entity] : []) : repository.find(deleteOptions);
        const entities = yield entityPromise;
        const deleted = (yield deletedPromise).map((m) => m.id);
        const { syncContainer } = SyncHelper_1.SyncHelper.toServerResult(entities);
        return {
            lastQueryDate: newLastQueryDate,
            deleted,
            syncContainer,
        };
    });
}
exports.queryFromClient = queryFromClient;
//# sourceMappingURL=queryFromClient.js.map