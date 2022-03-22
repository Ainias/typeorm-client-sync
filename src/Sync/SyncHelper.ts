import { Database } from '../Database';
import { JSONObject } from '../JSONType';
import type { SyncEntity } from '../SyncEntity';
import { RelationMetadataArgs } from 'typeorm/metadata-args/RelationMetadataArgs';

export type ModelContainer = Record<number, Record<number, SyncEntity>>;
export type SyncContainer = Record<
    number,
    Record<number, { columns: { id: number } & JSONObject; relations: JSONObject }>
>;
export type IdContainer = Record<number, Record<number, number>>;

export class SyncHelper {
    static addToModelContainer(
        model: SyncEntity,
        modelContainer: ModelContainer,
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

        const classId = Database.getInstance().getEntityIdFor(model);
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

        const { relationDefinitions } = (model.constructor as typeof SyncEntity).getFieldDefinitions();

        const childDepth = depth ? depth - 1 : depth;
        relationDefinitions.reduce((obj, c) => {
            switch (c.relationType) {
                case 'many-to-many':
                case 'one-to-many': {
                    if (childDepth === undefined || childDepth > 0) {
                        model[c.propertyName].forEach((m: SyncEntity) => {
                            this.addToModelContainer(m, modelContainer, childDepth, idGenerator);
                        });
                    }
                    break;
                }
                case 'many-to-one':
                case 'one-to-one': {
                    if (model[c.propertyName] && (childDepth === undefined || childDepth > 0)) {
                        this.addToModelContainer(
                            model[c.propertyName] as SyncEntity,
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

        return model.id;
    }

    static convertToSyncContainer(modelContainer: ModelContainer) {
        const syncContainer: SyncContainer = {};
        Object.entries(modelContainer).forEach(([entityId, modelMap]) => {
            syncContainer[entityId] = {};
            const syncMap = syncContainer[Number(entityId)];
            const Entity = Database.getInstance().getEntityForId(Number(entityId));

            const { columnDefinitions, relationDefinitions } = Entity.getFieldDefinitions();

            Object.entries(modelMap).forEach(([modelId, model]) => {
                const columns = columnDefinitions.reduce(
                    (obj, c) => {
                        obj[c.propertyName] = model[c.propertyName];
                        return obj;
                    },
                    { id: 0 } as Record<string, any> & { id: number }
                );

                const relations = relationDefinitions.reduce((obj, c) => {
                    switch (c.relationType) {
                        case 'many-to-many':
                        case 'one-to-many': {
                            if (model[c.propertyName]) {
                                obj[c.propertyName] = model[c.propertyName].map((m: SyncEntity) => {
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
                }, {} as Record<string, any>);

                syncMap[Number(modelId)] = { columns, relations };
            });
        });

        return syncContainer;
    }

    static convertToModelContainer(syncContainer: SyncContainer) {
        const modelContainer: ModelContainer = {};

        Object.entries(syncContainer).forEach(([entityId, modelsData]) => {
            const Entity = Database.getInstance().getEntityForId(Number(entityId));
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
            const entity = Database.getInstance().getEntityForId(Number(entityId));

            const relations = entity.getFieldDefinitions().relationDefinitions.reduce((obj, rel) => {
                obj[rel.propertyName] = rel;
                return obj;
            }, {} as Record<string, RelationMetadataArgs>);

            Object.entries(modelsData).forEach(([modelId, modelData]) => {
                const model = models[modelId];
                Object.entries(modelData.relations).forEach(([relationName, value]) => {
                    const otherEntity = (relations[relationName].type as () => typeof SyncEntity)();
                    const otherEntityId = Database.getInstance().getEntityIdFor(otherEntity);

                    if (Array.isArray(value)) {
                        model[relationName] = value.map((id) => modelContainer[otherEntityId][Number(id)]);
                    } else {
                        model[relationName] = modelContainer[otherEntityId][Number(value)];
                    }
                });
            });
        });

        return modelContainer;
    }

    static updateModelContainer(modelContainer: ModelContainer, syncContainer: SyncContainer) {
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

    static generateSyncContainer(model: SyncEntity, depth?: number) {
        const modelContainer: ModelContainer = {};
        SyncHelper.addToModelContainer(model, modelContainer, depth);
        return SyncHelper.convertToSyncContainer(modelContainer);
    }

    static generateIdMap(modelContainer: ModelContainer | SyncContainer) {
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
