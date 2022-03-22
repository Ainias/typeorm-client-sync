"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerBeforeInsert = void 0;
const typeorm_1 = require("typeorm");
const Database_1 = require("../Database");
function ServerBeforeInsert() {
    return function decorator(object, propertyName) {
        Database_1.Database.addDecoratorHandler(() => {
            if (Database_1.Database.getInstance().isServerDatabase()) {
                (0, typeorm_1.BeforeInsert)()(object, propertyName);
            }
        });
    };
}
exports.ServerBeforeInsert = ServerBeforeInsert;
//# sourceMappingURL=ServerBeforeInsert.js.map