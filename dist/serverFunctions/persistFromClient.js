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
function persistFromClient(entityId, modelId, syncContainer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const modelContainer = SyncHelper_1.SyncHelper.convertToModelContainer(syncContainer);
            const model = modelContainer[entityId][modelId];
            yield model.save();
            return SyncHelper_1.SyncHelper.convertToSyncContainer(modelContainer);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    });
}
exports.persistFromClient = persistFromClient;
//# sourceMappingURL=persistFromClient.js.map