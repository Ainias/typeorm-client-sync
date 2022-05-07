"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delayed = void 0;
const Database_1 = require("../Database");
function Delayed(decorator, optionsGenerator) {
    return function inner(object, propertyName) {
        Database_1.Database.addDecoratorHandler(() => {
            decorator(...optionsGenerator())(object, propertyName);
        });
    };
}
exports.Delayed = Delayed;
//# sourceMappingURL=Delayed.js.map