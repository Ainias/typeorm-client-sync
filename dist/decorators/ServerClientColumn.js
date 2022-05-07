"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerClientColumn = void 0;
const Database_1 = require("../Database");
const typeorm_1 = require("typeorm");
function ServerClientColumn(serverOptions, clientOptions, baseOptions = {}) {
    return function decorator(object, propertyName) {
        Database_1.Database.addDecoratorHandler(() => {
            const overrideOptions = Database_1.Database.getInstance().isServerDatabase() ? serverOptions : clientOptions;
            const mergedOptions = Object.assign(Object.assign({}, baseOptions), (typeof overrideOptions === "string" ? { type: overrideOptions } : overrideOptions));
            (0, typeorm_1.Column)(mergedOptions)(object, propertyName);
        });
    };
}
exports.ServerClientColumn = ServerClientColumn;
//# sourceMappingURL=ServerClientColumn.js.map