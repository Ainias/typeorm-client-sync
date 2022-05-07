"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyToMany = void 0;
const Database_1 = require("../Database");
const typeorm_1 = require("typeorm");
function ManyToMany(...args) {
    return function decorator(object, propertyName) {
        Database_1.Database.addDecoratorHandler(() => {
            (0, typeorm_1.ManyToMany)(...args)(object, propertyName);
        });
    };
}
exports.ManyToMany = ManyToMany;
//# sourceMappingURL=ManyToMany.js.map