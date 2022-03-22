"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncHelper = void 0;
const Database_1 = require("../Database");
class SyncHelper {
    static addToModelContainer(model, modelContainer, depth, idGenerator) {
        if (!idGenerator) {
            idGenerator = (function* gen() {
                let startId = -1;
                do {
                    yield startId;
                    startId--;
                } while (true);
            })();
        }
        const classId = Database_1.Database.getInstance().getEntityIdFor(model);
        let objMap = modelContainer[classId];
        if (!objMap) {
            objMap = {};
            modelContainer[classId] = objMap;
        }
        if (model.id === undefined) {
            model.id = idGenerator.next().value;
        }
        if (model.id in objMap) {
            return model.id;
        }
        objMap[model.id] = model;
        const { relationDefinitions } = model.constructor.getFieldDefinitions();
        const childDepth = depth ? depth - 1 : depth;
        relationDefinitions.reduce((obj, c) => {
            switch (c.relationType) {
                case 'many-to-many':
                case 'one-to-many': {
                    if (childDepth === undefined || childDepth > 0) {
                        model[c.propertyName].forEach((m) => {
                            this.addToModelContainer(m, modelContainer, childDepth, idGenerator);
                        });
                    }
                    break;
                }
                case 'many-to-one':
                case 'one-to-one': {
                    if (model[c.propertyName] && (childDepth === undefined || childDepth > 0)) {
                        this.addToModelContainer(model[c.propertyName], modelContainer, childDepth, idGenerator);
                    }
                    break;
                }
            }
            return obj;
        }, {});
        return model.id;
    }
    static convertToSyncContainer(modelContainer) {
        const syncContainer = {};
        Object.entries(modelContainer).forEach(([entityId, modelMap]) => {
            syncContainer[entityId] = {};
            const syncMap = syncContainer[Number(entityId)];
            const Entity = Database_1.Database.getInstance().getEntityForId(Number(entityId));
            const { columnDefinitions, relationDefinitions } = Entity.getFieldDefinitions();
            Object.entries(modelMap).forEach(([modelId, model]) => {
                const columns = columnDefinitions.reduce((obj, c) => {
                    obj[c.propertyName] = model[c.propertyName];
                    return obj;
                }, { id: 0 });
                const relations = relationDefinitions.reduce((obj, c) => {
                    switch (c.relationType) {
                        case 'many-to-many':
                        case 'one-to-many': {
                            if (model[c.propertyName]) {
                                obj[c.propertyName] = model[c.propertyName].map((m) => {
                                    return m.id;
                                });
                            }
                            break;
                        }
                        case 'many-to-one':
                        case 'one-to-one': {
                            if (model[c.propertyName]) {
                                obj[c.propertyName] = model[c.propertyName].id;
                            }
                            break;
                        }
                    }
                    return obj;
                }, {});
                syncMap[Number(modelId)] = { columns, relations };
            });
        });
        return syncContainer;
    }
    static convertToModelContainer(syncContainer) {
        const modelContainer = {};
        Object.entries(syncContainer).forEach(([entityId, modelsData]) => {
            const Entity = Database_1.Database.getInstance().getEntityForId(Number(entityId));
            modelContainer[entityId] = {};
            const models = modelContainer[entityId];
            Object.entries(modelsData).forEach(([modelId, modelData]) => {
                const model = new Entity();
                models[Number(modelId)] = model;
                model.setColumns(modelData.columns);
                if (Number(modelId) < 0) {
                    model.id = undefined;
                }
            });
        });
        Object.entries(syncContainer).forEach(([entityId, modelsData]) => {
            const models = modelContainer[entityId];
            const entity = Database_1.Database.getInstance().getEntityForId(Number(entityId));
            const relations = entity.getFieldDefinitions().relationDefinitions.reduce((obj, rel) => {
                obj[rel.propertyName] = rel;
                return obj;
            }, {});
            Object.entries(modelsData).forEach(([modelId, modelData]) => {
                const model = models[modelId];
                Object.entries(modelData.relations).forEach(([relationName, value]) => {
                    const otherEntity = relations[relationName].type();
                    const otherEntityId = Database_1.Database.getInstance().getEntityIdFor(otherEntity);
                    if (Array.isArray(value)) {
                        model[relationName] = value.map((id) => modelContainer[otherEntityId][Number(id)]);
                    }
                    else {
                        model[relationName] = modelContainer[otherEntityId][Number(value)];
                    }
                });
            });
        });
        return modelContainer;
    }
    static updateModelContainer(modelContainer, syncContainer) {
        Object.entries(syncContainer).forEach(([entityId, modelsData]) => {
            const models = modelContainer[entityId];
            Object.entries(modelsData).forEach(([modelId, modelData]) => {
                const model = models[Number(modelId)];
                model.setColumns(modelData.columns);
                if (model.id < 0) {
                    model.id = undefined;
                }
            });
        });
        return modelContainer;
    }
    static generateSyncContainer(model, depth) {
        const modelContainer = {};
        SyncHelper.addToModelContainer(model, modelContainer, depth);
        return SyncHelper.convertToSyncContainer(modelContainer);
    }
    static generateIdMap(modelContainer) {
        return Object.entries(modelContainer).reduce((idContainer, [entityId, models]) => {
            idContainer[Number(entityId)] = Object.entries(models).reduce((ids, [modelId, model]) => {
                var _a, _b;
                const newId = (_a = model.id) !== null && _a !== void 0 ? _a : (_b = model.columns) === null || _b === void 0 ? void 0 : _b.id;
                if (newId) {
                    ids[Number(modelId)] = newId;
                }
                return ids;
            }, {});
            return idContainer;
        }, {});
    }
}
exports.SyncHelper = SyncHelper;
//# sourceMappingURL=SyncHelper.js.map