"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerVersionColumn = void 0;
const typeorm_1 = require("typeorm");
const Database_1 = require("../Database");
function ServerVersionColumn() {
    return function decorator(object, propertyName) {
        Database_1.Database.addDecoratorHandler(() => {
            if (Database_1.Database.isServerDatabase()) {
                (0, typeorm_1.VersionColumn)()(object, propertyName);
            }
            else {
                (0, typeorm_1.Column)()(object, propertyName);
            }
        });
    };
}
exports.ServerVersionColumn = ServerVersionColumn;
//# sourceMappingURL=ServerVersionColumn.js.map