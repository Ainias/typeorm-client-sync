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
exports.removeOnServer = void 0;
const Database_1 = require("../Database");
const SyncRepository_1 = require("../Repository/SyncRepository");
function removeOnServer(modelId, entityIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const model = Database_1.Database.getModelForId(modelId);
        const repository = yield (0, SyncRepository_1.waitForSyncRepository)(model);
        yield repository.softDelete(entityIds);
        return true;
    });
}
exports.removeOnServer = removeOnServer;
//# sourceMappingURL=removeOnServer.js.map