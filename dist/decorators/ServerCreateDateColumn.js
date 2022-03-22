"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerCreateDateColumn = void 0;
const typeorm_1 = require("typeorm");
const Database_1 = require("../Database");
function ServerCreateDateColumn(options = {}) {
    return function decorator(object, propertyName) {
        Database_1.Database.addDecoratorHandler(() => {
            if (Database_1.Database.getInstance().isServerDatabase()) {
                return (0, typeorm_1.Column)(Object.assign(Object.assign({}, options), { default: () => 'NOW()' }))(object, propertyName);
            }
            return (0, typeorm_1.Column)(options)(object, propertyName);
        });
    };
}
exports.ServerCreateDateColumn = ServerCreateDateColumn;
//# sourceMappingURL=ServerCreateDateColumn.js.map