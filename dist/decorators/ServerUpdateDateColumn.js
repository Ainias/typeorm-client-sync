"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerUpdateDateColumn = void 0;
const typeorm_1 = require("typeorm");
const Database_1 = require("../Database");
function ServerUpdateDateColumn() {
    return function decorator(object, propertyName) {
        Database_1.Database.addDecoratorHandler(() => {
            if (Database_1.Database.getInstance().isServerDatabase()) {
                (0, typeorm_1.UpdateDateColumn)()(object, propertyName);
            }
        });
    };
}
exports.ServerUpdateDateColumn = ServerUpdateDateColumn;
//# sourceMappingURL=ServerUpdateDateColumn.js.map