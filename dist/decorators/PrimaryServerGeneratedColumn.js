"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryServerGeneratedColumn = void 0;
const SyncEntity_1 = require("../SyncEntity");
const typeorm_1 = require("typeorm");
function PrimaryServerGeneratedColumn({ strategy = "increment", generatedOptions, options, type } = {}) {
    return function (object, propertyName) {
        // SyncEntity.addDecoratorHandler(() => {
        if (SyncEntity_1.SyncEntity.isServer()) {
            console.log("LOG-d isServer!");
            switch (strategy) {
                case "increment": {
                    return (0, typeorm_1.PrimaryGeneratedColumn)(strategy, generatedOptions)(object, propertyName);
                }
                case "uuid": {
                    return (0, typeorm_1.PrimaryGeneratedColumn)(strategy, generatedOptions)(object, propertyName);
                }
                case "rowid": {
                    return (0, typeorm_1.PrimaryGeneratedColumn)(strategy, generatedOptions)(object, propertyName);
                }
                case "identity": {
                    return (0, typeorm_1.PrimaryGeneratedColumn)(strategy, generatedOptions)(object, propertyName);
                }
            }
        }
        else {
            console.log("LOG-d isClient!");
            return (0, typeorm_1.PrimaryColumn)(type, options)(object, propertyName);
        }
        // })
    };
}
exports.PrimaryServerGeneratedColumn = PrimaryServerGeneratedColumn;
//# sourceMappingURL=PrimaryServerGeneratedColumn.js.map