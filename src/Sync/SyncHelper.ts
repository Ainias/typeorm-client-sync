import { Database } from '../Database';
import { JSONObject } from '../JSONType';
import type { SyncModel } from '../SyncModel';
import { RelationMetadataArgs } from 'typeorm/metadata-args/RelationMetadataArgs';
import {getMetadataArgsStorage} from "typeorm";

export type EntityContainer = Record<number, Record<number, SyncModel>>;
export type SyncContainer = Record<
    number,
    Record<number, { columns: { id: number } & JSONObject; relations: JSONObject }>
>;
export type IdContainer = Record<number, Record<number, number>>;

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

    static addToEntityContainer<T extends  SyncModel>(
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

        const classId = Database.getInstance().getModelIdFor(entity.constructor as typeof SyncModel);
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

        const { relationDefinitions } = this.getFieldDefinitionsFor(entity.constructor as typeof SyncModel);

        const childDepth = depth ? depth - 1 : depth;
        relationDefinitions.reduce((obj, c) => {
            switch (c.relationType) {
                case 'many-to-many':
                case 'one-to-many': {
                    if (childDepth === undefined || childDepth > 0) {
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
            const model = Database.getInstance().getModelForId(Number(modelId));
            const { columnDefinitions, relationDefinitions } = this.getFieldDefinitionsFor(model);

            Object.entries(modelMap).forEach(([entityId, entity]) => {
                const columns = columnDefinitions.reduce(
                    (obj, c) => {
                        obj[c.propertyName] = entity[c.propertyName];
                        return obj;
                    },
                    { id: 0 } as Record<string, any> & { id: number }
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
                            }
                            break;
                        }
                    }
                    return obj;
                }, {} as Record<string, any>);

                syncMap[Number(entityId)] = { columns, relations };
            });
        });

        return syncContainer;
    }

    static convertToModelContainer(syncContainer: SyncContainer) {
        const entityContainer: EntityContainer = {};

        Object.entries(syncContainer).forEach(([entityId, modelsData]) => {
            const Model = Database.getInstance().getModelForId(Number(entityId));
            entityContainer[entityId] = {};

            const entities = entityContainer[entityId];
            Object.entries(modelsData).forEach(([modelId, modelData]) => {
                const entity = new Model();
                entities[Number(modelId)] = entity;

                Object.assign(entity, modelData.columns);
                if (Number(modelId) < 0) {
                    entity.id = undefined;
                }
            });
        });

        Object.entries(syncContainer).forEach(([modelId, modelsData]) => {
            const entities = entityContainer[modelId];
            const model = Database.getInstance().getModelForId(Number(modelId));

            const relations = this.getFieldDefinitionsFor(model).relationDefinitions.reduce((obj, rel) => {
                obj[rel.propertyName] = rel;
                return obj;
            }, {} as Record<string, RelationMetadataArgs>);

            Object.entries(modelsData).forEach(([entityId, modelData]) => {
                const entity = entities[entityId];
                Object.entries(modelData.relations).forEach(([relationName, value]) => {
                    const otherEntity = (relations[relationName].type as () => typeof SyncModel)();
                    const otherEntityId = Database.getInstance().getModelIdFor(otherEntity);

                    if (Array.isArray(value)) {
                        entity[relationName] = value.map((id) => entityContainer[otherEntityId][Number(id)]);
                    } else {
                        entity[relationName] = entityContainer[otherEntityId][Number(value)];
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
}
