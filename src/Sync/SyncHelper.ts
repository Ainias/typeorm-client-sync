/* eslint-disable no-underscore-dangle */
import {Database} from '../Database';
import type {SyncModel} from '../SyncModel';
import {RelationMetadataArgs} from 'typeorm/metadata-args/RelationMetadataArgs';
import {FindOperator, FindOperatorType, FindOptionsWhere, getMetadataArgsStorage} from "typeorm";
import {JsonOperators} from "./JsonOperators";
import {EntityContainer, IdContainer, MultipleSyncResults, SingleSyncResult, SyncContainer} from "./SyncTypes";
import {JSONObject} from "js-helper";

export class SyncHelper {
    static getFieldDefinitionsFor(model: typeof SyncModel) {
        const bases: (typeof SyncModel)[] = [model];
        let currentBase = model;
        while (currentBase.prototype) {
            currentBase = Object.getPrototypeOf(currentBase);
            bases.push(currentBase);
        }
        const columnDefinitions = getMetadataArgsStorage().columns.filter(
            (c) => bases.indexOf(c.target as typeof SyncModel) !== -1
        );
        const relationDefinitions = getMetadataArgsStorage().relations.filter(
            (c) => bases.indexOf(c.target as typeof SyncModel) !== -1
        );

        return {columnDefinitions, relationDefinitions};
    }

    static addToEntityContainer<T extends SyncModel>(
        entity: T,
        modelContainer: EntityContainer,
        depth?: number,
        idGenerator?: Generator<number>
    ) {
        if (!idGenerator) {
            idGenerator = (function* gen() {
                let startId = -1;
                do {
                    yield startId;
                    startId--;
                } while (true);
            })();
        }

        const classId = Database.getModelIdFor(entity.constructor as typeof SyncModel);
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

        const {relationDefinitions} = this.getFieldDefinitionsFor(entity.constructor as typeof SyncModel);

        const childDepth = depth ? depth - 1 : depth;
        relationDefinitions.reduce((obj, c) => {
            switch (c.relationType) {
                case 'many-to-many':
                case 'one-to-many': {
                    if ((childDepth === undefined || childDepth > 0) && Array.isArray(entity[c.propertyName])) {
                        entity[c.propertyName].forEach((e: SyncModel) => {
                            this.addToEntityContainer(e, modelContainer, childDepth, idGenerator);
                        });
                    }
                    break;
                }
                case 'many-to-one':
                case 'one-to-one': {
                    if (entity[c.propertyName] && (childDepth === undefined || childDepth > 0)) {
                        this.addToEntityContainer(
                            entity[c.propertyName] as SyncModel,
                            modelContainer,
                            childDepth,
                            idGenerator
                        );
                    }
                    break;
                }
            }
            return obj;
        }, {} as Record<string, any>);

        return entity.id;
    }

    static convertToSyncContainer(entityContainer: EntityContainer) {
        const syncContainer: SyncContainer = {};
        Object.entries(entityContainer).forEach(([modelId, modelMap]) => {
            syncContainer[modelId] = {};
            const syncMap = syncContainer[Number(modelId)];
            const model = Database.getModelForId(Number(modelId));
            const {columnDefinitions, relationDefinitions} = this.getFieldDefinitionsFor(model);

            Object.entries(modelMap).forEach(([entityId, entity]) => {
                const columns = columnDefinitions.reduce(
                    (obj, c) => {
                        obj[c.propertyName] = entity[c.propertyName];
                        return obj;
                    },
                    {id: 0} as Record<string, any> & { id: number }
                );

                const relations = relationDefinitions.reduce((obj, c) => {
                    switch (c.relationType) {
                        case 'many-to-many':
                        case 'one-to-many': {
                            if (entity[c.propertyName]) {
                                obj[c.propertyName] = entity[c.propertyName].map((m: SyncModel) => {
                                    return m.id;
                                });
                            }
                            break;
                        }
                        case 'many-to-one':
                        case 'one-to-one': {
                            if (entity[c.propertyName]) {
                                obj[c.propertyName] = entity[c.propertyName].id;
                            } else if (entity[c.propertyName] === null) {
                                obj[c.propertyName] = null;
                            }
                            break;
                        }
                    }
                    return obj;
                }, {} as Record<string, any>);

                syncMap[Number(entityId)] = {columns, relations};
            });
        });

        return syncContainer;
    }

    static convertToModelContainer(syncContainer: SyncContainer) {
        const entityContainer: EntityContainer = {};

        Object.entries(syncContainer).forEach(([entityId, modelsData]) => {
            const Model = Database.getModelForId(Number(entityId));
            const {columnDefinitions} = SyncHelper.getFieldDefinitionsFor(Model);
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
            const model = Database.getModelForId(Number(modelId));

            const relations = this.getFieldDefinitionsFor(model).relationDefinitions.reduce((obj, rel) => {
                obj[rel.propertyName] = rel;
                return obj;
            }, {} as Record<string, RelationMetadataArgs>);

            Object.entries(modelsData).forEach(([entityId, entityData]) => {
                const entity = entities[entityId];
                Object.entries(entityData.relations).forEach(([relationName, value]) => {
                    const otherModel = (relations[relationName].type as () => typeof SyncModel)();
                    const otherModelId = Database.getModelIdFor(otherModel);

                    if (Array.isArray(value)) {
                        entity[relationName] = value.map((id) => entityContainer[otherModelId][Number(id)]);
                    } else if (value) {
                        entity[relationName] = entityContainer[otherModelId][Number(value)];
                    } else {
                        entity[relationName] = value;
                    }
                });
            });
        });

        return entityContainer;
    }

    static updateEntityContainer(entityContainer: EntityContainer, syncContainer: SyncContainer) {
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

    static generateSyncContainer(model: SyncModel, depth?: number) {
        const modelContainer: EntityContainer = {};
        SyncHelper.addToEntityContainer(model, modelContainer, depth);
        return SyncHelper.convertToSyncContainer(modelContainer);
    }

    static toServerResult(entity: SyncModel, depth?: number): SingleSyncResult
    static toServerResult(entity: SyncModel[], depth?: number): MultipleSyncResults
    static toServerResult(entity: SyncModel | SyncModel[], depth?: number) {
        const modelContainer: EntityContainer = {};
        if (Array.isArray(entity)) {
            entity.forEach(e => SyncHelper.addToEntityContainer(e, modelContainer, depth));
        } else {
            SyncHelper.addToEntityContainer(entity, modelContainer, depth);
        }
        const syncContainer = SyncHelper.convertToSyncContainer(modelContainer);
        if (Array.isArray(entity)) {
            const ids = entity.map(e => e.id);
            return {syncContainer, ids};
        }
        const {id} = entity;
        return {syncContainer, id};
    }

    static fromServerResult<ModelType extends typeof SyncModel>(model: ModelType, result: SingleSyncResult): InstanceType<ModelType> | null
    static fromServerResult<ModelType extends typeof SyncModel>(model: ModelType, result: MultipleSyncResults): InstanceType<ModelType>[]
    static fromServerResult<ModelType extends typeof SyncModel>(model: ModelType, result: SingleSyncResult | MultipleSyncResults) {
        const modelContainer = SyncHelper.convertToModelContainer(result.syncContainer);
        const modelId = Database.getModelIdFor(model);
        if (!modelContainer[modelId]) {
            return ("ids" in result) ? [] : null;
        }
        if ("ids" in result) {
            if (modelContainer[modelId]) {
                return result.ids.map(id => modelContainer[modelId][id]);
            }
            return [];
        }
        return modelContainer[modelId][result.id] ?? null;
    }

    static generateIdMap(modelContainer: EntityContainer | SyncContainer) {
        return Object.entries(modelContainer).reduce((idContainer, [entityId, models]) => {
            idContainer[Number(entityId)] = Object.entries(models).reduce(
                (ids, [modelId, model]: [string, { id?: number; columns?: { id: number } }]) => {
                    const newId = model.id ?? model.columns?.id;
                    if (newId) {
                        ids[Number(modelId)] = newId;
                    }
                    return ids;
                },
                {} as Record<number, number>
            );
            return idContainer;
        }, {} as IdContainer);
    }

    static convertWhereToJson(where: FindOptionsWhere<any>) {
        return Object.entries(where).reduce((obj, [key, val]) => {
            if (val instanceof FindOperator) {
                let {value} = val;
                if (typeof value === "object" && !Array.isArray(value)) {
                    value = this.convertWhereToJson(value);
                }
                obj[key] = {
                    ___JSON_OPERATOR: JsonOperators.FIND_OPERATOR,
                    args: [val.type, value, val.useParameter, val.multipleParameters]
                };
            } else if (typeof val === "object" && !Array.isArray(val)) {
                obj[key] = this.convertWhereToJson(val);
            } else {
                obj[key] = val;
            }
            return obj;
        }, {} as JSONObject);
    }

    static convertJsonToWhere(json: JSONObject) {
        if ("___JSON_OPERATOR" in json) {
            switch (json.___JSON_OPERATOR) {
                case JsonOperators.FIND_OPERATOR: {
                    let value = json.args[1];
                    const [type, , useParameter, multipleParameters] = json.args as [FindOperatorType, any, boolean, boolean];
                    if (typeof value === "object" && !Array.isArray(value)) {
                        value = this.convertJsonToWhere(value);
                    }
                    return new FindOperator(type, value, useParameter, multipleParameters);
                }
            }
        }

        return Object.entries(json).reduce((obj, [key, val]) => {
            if (typeof val === "object" && !Array.isArray(val)) {
                obj[key] = this.convertJsonToWhere(val);
            } else {
                obj[key] = val;
            }
            return obj;
        }, {} as FindOptionsWhere<any>);
    }
}
