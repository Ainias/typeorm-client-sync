"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncRepository = void 0;
const typeorm_1 = require("typeorm");
class SyncRepository extends typeorm_1.Repository {
    constructor() {
        super(undefined, undefined, undefined);
    }
    findAlias(...args) {
        console.log(this.createQueryBuilder());
        return this.find(...args);
    }
}
exports.SyncRepository = SyncRepository;
//# sourceMappingURL=SyncRepository.js.map