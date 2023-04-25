"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncHelper = void 0;
/* eslint-disable no-underscore-dangle */
const Database_1 = require("../Database");
const typeorm_1 = require("typeorm");
const JsonOperators_1 = require("./JsonOperators");
const js_helper_1 = require("@ainias42/js-helper");
class SyncHelper {
    static getFieldDefinitionsFor(model) {
        const bases = [model];
        let currentBase = model;
        while (currentBase.prototype) {
            currentBase = Object.getPrototypeOf(currentBase);
            bases.push(currentBase);
        }
        const columnDefinitions = (0, typeorm_1.getMetadataArgsStorage)().columns.filter((c) => bases.indexOf(c.target) !== -1);
        const relationDefinitions = (0, typeorm_1.getMetadataArgsStorage)().relations.filter((c) => bases.indexOf(c.target) !== -1);
        return { columnDefinitions, relationDefinitions };
    }
    static addToEntityContainer(entity, modelContainer, depth, idGenerator) {
        if (!idGenerator) {
            idGenerator = (function* gen() {
                let startId = -1;
                do {
                    yield startId;
                    startId--;
                } while (true);
            })();
        }
        const classId = Database_1.Database.getModelIdFor(entity.constructor);
        let objMap = modelContainer[classId];
        if (!objMap) {
            objMap = {};
            modelContainer[classId] = objMap;
        }
        if (entity.id === undefined) {
            entity.id = idGenerator.next().value;
        }
        if (entity.id in objMap) {
            return entity.id;
        }
        objMap[entity.id] = entity;
        const { relationDefinitions } = this.getFieldDefinitionsFor(entity.constructor);
        const childDepth = depth ? depth - 1 : depth;
        relationDefinitions.reduce((obj, c) => {
            switch (c.relationType) {
                case 'many-to-many':
                case 'one-to-many': {
                    if ((childDepth === undefined || childDepth > 0) && Array.isArray(entity[c.propertyName])) {
                        entity[c.propertyName].forEach((e) => {
                            this.addToEntityContainer(e, modelContainer, childDepth, idGenerator);
                        });
                    }
                    break;
                }
                case 'many-to-one':
                case 'one-to-one': {
                    if (entity[c.propertyName] && (childDepth === undefined || childDepth > 0)) {
                        this.addToEntityContainer(entity[c.propertyName], modelContainer, childDepth, idGenerator);
                    }
                    break;
                }
            }
            return obj;
        }, {});
        return entity.id;
    }
    static convertToSyncContainer(entityContainer) {
        const syncContainer = {};
        Object.entries(entityContainer).forEach(([modelId, modelMap]) => {
            syncContainer[modelId] = {};
            const syncMap = syncContainer[Number(modelId)];
            const model = Database_1.Database.getModelForId(Number(modelId));
            const { columnDefinitions, relationDefinitions } = this.getFieldDefinitionsFor(model);
            Object.entries(modelMap).forEach(([entityId, entity]) => {
                const columns = columnDefinitions.reduce((obj, c) => {
                    obj[c.propertyName] = entity[c.propertyName];
                    return obj;
                }, { id: 0 });
                const relations = relationDefinitions.reduce((obj, c) => {
                    switch (c.relationType) {
                        case 'many-to-many':
                        case 'one-to-many': {
                            if (entity[c.propertyName]) {
                                obj[c.propertyName] = entity[c.propertyName].map((m) => {
                                    return m.id;
                                });
                            }
                            break;
                        }
                        case 'many-to-one':
                        case 'one-to-one': {
                            if (entity[c.propertyName]) {
                                obj[c.propertyName] = entity[c.propertyName].id;
                            }
                            else if (entity[c.propertyName] === null) {
                                obj[c.propertyName] = null;
                            }
                            else {
                                obj[c.propertyName] = undefined;
                            }
                            break;
                        }
                    }
                    return obj;
                }, {});
                syncMap[Number(entityId)] = { columns, relations };
            });
        });
        return syncContainer;
    }
    static convertToEntityContainer(syncContainer) {
        const entityContainer = {};
        Object.entries(syncContainer).forEach(([entityId, modelsData]) => {
            const Model = Database_1.Database.getModelForId(Number(entityId));
            const { columnDefinitions } = SyncHelper.getFieldDefinitionsFor(Model);
            const dateColumns = columnDefinitions.filter(v => v.mode === "regular" && (v.options.type === "date" || v.options.type === Date)).map(v => v.propertyName);
            entityContainer[entityId] = {};
            const entities = entityContainer[entityId];
            Object.entries(modelsData).forEach(([modelId, modelData]) => {
                const entity = new Model();
                entities[Number(modelId)] = entity;
                Object.assign(entity, modelData.columns);
                dateColumns.forEach(dateColumn => {
                    entity[dateColumn] = new Date(entity[dateColumn]);
                });
                if (Number(modelId) < 0) {
                    entity.id = undefined;
                }
            });
        });
        Object.entries(syncContainer).forEach(([modelId, modelsData]) => {
            const entities = entityContainer[modelId];
            const model = Database_1.Database.getModelForId(Number(modelId));
            const relations = this.getFieldDefinitionsFor(model).relationDefinitions.reduce((obj, rel) => {
                obj[rel.propertyName] = rel;
                return obj;
            }, {});
            Object.entries(modelsData).forEach(([entityId, entityData]) => {
                const entity = entities[entityId];
                Object.entries(entityData.relations).forEach(([relationName, value]) => {
                    var _a;
                    const otherModel = relations[relationName].type();
                    const otherModelId = Database_1.Database.getModelIdFor(otherModel);
                    if (Array.isArray(value)) {
                        entity[relationName] = value.map((id) => { var _a; return (_a = entityContainer[otherModelId][Number(id)]) !== null && _a !== void 0 ? _a : { id: Number(id) }; });
                    }
                    else if (value) {
                        entity[relationName] = (_a = entityContainer[otherModelId][Number(value)]) !== null && _a !== void 0 ? _a : { id: Number(value) };
                    }
                    else {
                        entity[relationName] = value;
                    }
                });
            });
        });
        return entityContainer;
    }
    static updateEntityContainer(entityContainer, syncContainer) {
        Object.entries(syncContainer).forEach(([modelId, entityData]) => {
            const entities = entityContainer[modelId];
            Object.entries(entityData).forEach(([entityId, modelData]) => {
                const entity = entities[Number(entityId)];
                Object.assign(entity, modelData.columns);
                if (entity.id < 0) {
                    entity.id = undefined;
                }
            });
        });
        return entityContainer;
    }
    static generateEntityContainer(entity, depth) {
        const modelContainer = {};
        const id = SyncHelper.addToEntityContainer(entity, modelContainer, depth);
        return [modelContainer, id];
    }
    static generateSyncContainer(entity, depth) {
        const [modelContainer] = SyncHelper.generateEntityContainer(entity, depth);
        return SyncHelper.convertToSyncContainer(modelContainer);
    }
    static removeOlderEntities(syncContainer, lastQueryDate) {
        js_helper_1.ObjectHelper.values(syncContainer).forEach(entityStore => {
            js_helper_1.ObjectHelper.entries(entityStore).forEach(([key, jsonEntity]) => {
                if (typeof jsonEntity === "object"
                    && "updatedAt" in jsonEntity.columns
                    && jsonEntity.columns.updatedAt instanceof Date
                    && jsonEntity.columns.updatedAt.getTime() < lastQueryDate.getTime()) {
                    delete entityStore[key];
                }
            });
        });
    }
    static clone(entities, depth) {
        if (!Array.isArray(entities)) {
            return SyncHelper.clone([entities])[0];
        }
        const firstEntity = entities[0];
        if (!firstEntity) {
            return [];
        }
        const entityContainer = {};
        const ids = entities.map(entity => SyncHelper.addToEntityContainer(entity, entityContainer, depth));
        const modelId = Database_1.Database.getModelIdFor(firstEntity.constructor);
        const syncContainer = SyncHelper.convertToSyncContainer(entityContainer);
        const resultContainer = SyncHelper.convertToEntityContainer(syncContainer);
        return ids.map(id => resultContainer[modelId][id]);
    }
    static toServerResult(entity, depth) {
        const entityContainer = {};
        if (Array.isArray(entity)) {
            entity.forEach(e => SyncHelper.addToEntityContainer(e, entityContainer, depth));
        }
        else {
            SyncHelper.addToEntityContainer(entity, entityContainer, depth);
        }
        const syncContainer = SyncHelper.convertToSyncContainer(entityContainer);
        if (Array.isArray(entity)) {
            const ids = entity.map(e => e.id);
            return { syncContainer, ids };
        }
        const { id } = entity;
        return { syncContainer, id };
    }
    static fromServerResult(model, result) {
        var _a;
        const modelContainer = SyncHelper.convertToEntityContainer(result.syncContainer);
        const modelId = Database_1.Database.getModelIdFor(model);
        if (!modelContainer[modelId]) {
            return ("ids" in result) ? [] : null;
        }
        if ("ids" in result) {
            if (modelContainer[modelId]) {
                return result.ids.map(id => modelContainer[modelId][id]);
            }
            return [];
        }
        return (_a = modelContainer[modelId][result.id]) !== null && _a !== void 0 ? _a : null;
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
    static convertWhereToJson(where) {
        return Object.entries(where).reduce((obj, [key, val]) => {
            if (val instanceof typeorm_1.FindOperator) {
                let { value } = val;
                if (typeof value === "object" && !Array.isArray(value)) {
                    value = this.convertWhereToJson(value);
                }
                obj[key] = {
                    ___JSON_OPERATOR: JsonOperators_1.JsonOperators.FIND_OPERATOR,
                    args: [val.type, value, val.useParameter, val.multipleParameters]
                };
            }
            else if (typeof val === "object" && !Array.isArray(val)) {
                obj[key] = this.convertWhereToJson(val);
            }
            else {
                obj[key] = val;
            }
            return obj;
        }, {});
    }
    static convertJsonToWhere(json) {
        if ("___JSON_OPERATOR" in json) {
            switch (json.___JSON_OPERATOR) {
                case JsonOperators_1.JsonOperators.FIND_OPERATOR: {
                    let value = json.args[1];
                    const [type, , useParameter, multipleParameters] = json.args;
                    if (typeof value === "object" && !Array.isArray(value)) {
                        value = this.convertJsonToWhere(value);
                    }
                    return new typeorm_1.FindOperator(type, value, useParameter, multipleParameters);
                }
            }
        }
        return Object.entries(json).reduce((obj, [key, val]) => {
            if (typeof val === "object" && !Array.isArray(val)) {
                obj[key] = this.convertJsonToWhere(val);
            }
            else {
                obj[key] = val;
            }
            return obj;
        }, {});
    }
}
exports.SyncHelper = SyncHelper;
//# sourceMappingURL=SyncHelper.js.map