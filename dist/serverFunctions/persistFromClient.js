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
exports.persistFromClient = void 0;
const SyncHelper_1 = require("../Sync/SyncHelper");
const SyncRepository_1 = require("../Repository/SyncRepository");
function persistFromClient(modelId, entityId, syncContainer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const entityContainer = SyncHelper_1.SyncHelper.convertToEntityContainer(syncContainer);
            const entity = entityContainer[modelId][entityId];
            const repository = yield (0, SyncRepository_1.waitForSyncRepository)(entity.constructor);
            yield repository.manager.transaction((entityManager) => __awaiter(this, void 0, void 0, function* () {
                yield entityManager.save(entity, { reload: true });
            }));
            return SyncHelper_1.SyncHelper.convertToSyncContainer(entityContainer);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    });
}
exports.persistFromClient = persistFromClient;
//# sourceMappingURL=persistFromClient.js.map