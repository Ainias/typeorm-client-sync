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
const js_helper_1 = require("js-helper");
function queryFromClient(entityId, lastQueryDate, queryOptions) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        queryOptions.where = (_a = queryOptions.where) !== null && _a !== void 0 ? _a : {};
        const deleteOptions = js_helper_1.JsonHelper.deepCopy(queryOptions);
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
        const Entity = Database_1.Database.getInstance().getEntityForId(entityId);
        const newLastQueryDate = new Date();
        const modelsPromise = Entity.find(queryOptions);
        const deletedPromise = Entity.find(deleteOptions);
        const models = yield modelsPromise;
        const modelContainer = {};
        models.forEach((model) => {
            SyncHelper_1.SyncHelper.addToModelContainer(model, modelContainer);
        });
        const deleted = (yield deletedPromise).map((m) => m.id);
        return {
            lastQueryDate: newLastQueryDate,
            deleted,
            syncContainer: SyncHelper_1.SyncHelper.convertToSyncContainer(modelContainer),
        };
    });
}
exports.queryFromClient = queryFromClient;
//# sourceMappingURL=queryFromClient.js.map