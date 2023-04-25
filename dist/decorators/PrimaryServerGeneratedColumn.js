"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryServerGeneratedColumn = void 0;
const typeorm_1 = require("typeorm");
const Database_1 = require("../Database");
function PrimaryServerGeneratedColumn({ strategy = 'increment', generatedOptions, options, type, } = {}) {
    return function decorator(object, propertyName) {
        Database_1.Database.addDecoratorHandler(() => {
            if (Database_1.Database.isServerDatabase()) {
                switch (strategy) {
                    case 'increment': {
                        return (0, typeorm_1.PrimaryGeneratedColumn)(strategy, generatedOptions)(object, propertyName);
                    }
                    case 'uuid': {
                        return (0, typeorm_1.PrimaryGeneratedColumn)(strategy, generatedOptions)(object, propertyName);
                    }
                    case 'rowid': {
                        return (0, typeorm_1.PrimaryGeneratedColumn)(strategy, generatedOptions)(object, propertyName);
                    }
                    case 'identity': {
                        return (0, typeorm_1.PrimaryGeneratedColumn)(strategy, generatedOptions)(object, propertyName);
                    }
                }
            }
            return (0, typeorm_1.PrimaryColumn)(type, options)(object, propertyName);
        });
    };
}
exports.PrimaryServerGeneratedColumn = PrimaryServerGeneratedColumn;
//# sourceMappingURL=PrimaryServerGeneratedColumn.js.map