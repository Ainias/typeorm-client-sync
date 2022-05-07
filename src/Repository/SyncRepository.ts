import type {SyncModel} from "../SyncModel";
import {
    DeepPartial,
    FindManyOptions,
    FindOneOptions, FindOptionsWhere,
    RemoveOptions,
    Repository,
    SaveOptions
} from "typeorm";
import {Database} from "../Database";
import {LastQueryDate} from "../LastSyncDate/LastQueryDate";
import {SyncHelper} from "../Sync/SyncHelper";
import {EntityContainer} from "../Sync/SyncTypes";
import {JSONObject, JSONValue} from "js-helper";
import {MultipleInitialResult} from "../InitialResult/MultipleInitialResult";
import {SingleInitialResult} from "../InitialResult/SingleInitialResult";

type FunctionProperties2<T> = {
    [K in keyof T]: T[K] extends ((...args: any) => any) ? T[K] : never;
}[keyof T];

export type SyncOptions<T> = T & {
    runOnServer?: boolean;
    extraData?: JSONValue
};

export type SyncWithCallbackOptions<T, Result> = SyncOptions<T> & {
    runOnClient?: boolean;
    callback: (value: Result, isServerData: boolean) => void;
    errorCallback?: (error: any, isServerError: boolean) => void;
};


async function createSyncRepository<T extends typeof SyncModel>(model: T, db: Database) {
    const connection = await db.getConnectionPromise();
    const repository = connection.getRepository<InstanceType<T>>(model);
    return repository.extend(createSyncRepositoryExtension(model, repository, db));
}

export async function waitForSyncRepository<T extends typeof SyncModel>(model: T) {
    const db = await Database.waitForInstance();
    if (!db.getRepositoryPromise(model)) {
        db.setRepositoryPromise(model, createSyncRepository(model, db));
    }
    return await db.getRepositoryPromise(model) as Promise<SyncRepository<T>>;
}

export function createSyncRepositoryExtension<Model extends typeof SyncModel>(model: Model, repository: Repository<InstanceType<Model>>, db: Database) {
    const originalSync: typeof repository.save = repository.save.bind(repository);
    const save = async (...[entity, options, useClientOnlySave]: [...Parameters<typeof repository.save>, boolean?]) => {
        if (useClientOnlySave || db.isServerDatabase()) {
            return originalSync(entity, options);
        }
        throw new Error("Client-Only-Save used without useClientOnlySave-Flag!");
    };

    const originalRemove: typeof repository.remove = repository.remove.bind(repository);
    const remove = async (...[entity, options, useClientOnlyRemove]: [...Parameters<typeof repository.remove>, boolean?]) => {
        if (useClientOnlyRemove || db.isServerDatabase()) {
            return originalRemove(entity, options);
        }
        throw new Error("Client-Only-Remove used without useClientOnlyRemove-Flag!");
    };

    async function saveAndSync(entities: InstanceType<Model>[], options?: SyncOptions<SaveOptions> & { reload: false, clientOnly: true })
    async function saveAndSync(entity: InstanceType<Model>, options?: SyncOptions<SaveOptions> & { reload: false })
    async function saveAndSync(entity: InstanceType<Model> | InstanceType<Model>[], options?: SyncOptions<SaveOptions> & { reload: false }) {

        if (db.isClientDatabase() && options?.runOnServer !== false && !Array.isArray(entity)) {
            const modelContainer: EntityContainer = {};
            SyncHelper.addToEntityContainer(entity, modelContainer);
            const syncContainer = SyncHelper.convertToSyncContainer(modelContainer);

            const modelId = Database.getModelIdFor(model);
            const result = await db.persistToServer(modelId, entity.id, syncContainer, options?.extraData);
            if (result.success === true) {
                SyncHelper.updateEntityContainer(modelContainer, result.syncContainer);
            } else {
                throw new Error(result.error.message);
            }
        }
        return save(entity as DeepPartial<InstanceType<Model>>, options, true);
    }

    async function sync(options?: FindManyOptions<InstanceType<Model>>) {
        if (db.isClientDatabase()) {
            const relevantSyncOptions: JSONObject = {
                where: SyncHelper.convertWhereToJson(options?.where ?? {}),
                relations: options?.relations,
                skip: options?.skip,
                take: options?.take,
            };
            if (options?.skip || options?.take) {
                relevantSyncOptions.order = options?.order;
            }

            let lastQueryDate = await LastQueryDate.findOne({where: {query: JSON.stringify(relevantSyncOptions)}});
            if (!lastQueryDate) {
                lastQueryDate = new LastQueryDate();
                lastQueryDate.query = JSON.stringify(relevantSyncOptions);
            }

            const modelId = Database.getModelIdFor(model);
            const result = await db.queryServer(
                modelId,
                lastQueryDate.lastQueried,
                relevantSyncOptions,
            );

            if (result.success === true) {
                if (result.deleted.length > 0) {
                    await repository.delete(result.deleted);
                }
                const modelContainer = SyncHelper.convertToModelContainer(result.syncContainer);
                const savePromises = [];
                Object.entries(modelContainer).forEach(([queriedEntityId, modelMap]) => {
                    const syncedEntity = Database.getModelForId(Number(queriedEntityId));
                    savePromises.push(waitForSyncRepository(syncedEntity).then(entityRepository => {
                        const vals = Object.values(modelMap);
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        return entityRepository.save(vals, {reload: false}, true);
                    }));
                });

                lastQueryDate.lastQueried = new Date(result.lastQueryDate);
                Promise.all(savePromises).catch(e => console.log("Sync Error", e));
                await Promise.all(savePromises);
                await lastQueryDate.save();
            } else {
                throw new Error(result.error.message);
            }
        }
    }

    async function executeWithSyncAndCallbacks<Method extends FunctionProperties2<typeof repository>>(method: Method, params: Parameters<Method>, syncOptions: SyncWithCallbackOptions<FindManyOptions<InstanceType<Model>>, Awaited<ReturnType<Method>>>) {
        const bindedMethod = method.bind(repository);
        let serverCalled = false;

        const promises = [];
        if (db.isClientDatabase() && syncOptions.runOnServer !== false) {
            promises.push(sync(syncOptions).then(() => bindedMethod(...params)).then((serverResult: Awaited<ReturnType<Method>>) => {
                serverCalled = true;
                syncOptions.callback(serverResult, true);
            }).catch(e => {
                syncOptions?.errorCallback(e, true);
            }));
        }

        if (db.isServerDatabase() || syncOptions.runOnClient !== false) {
            promises.push(bindedMethod(...params).then((clientResult: Awaited<ReturnType<Method>>) => {
                if (!serverCalled) {
                    syncOptions.callback(clientResult, false);
                }
            }).catch(e => {
                if (!serverCalled) {
                    syncOptions?.errorCallback(e, false);
                }
            }));
        }

        if (promises.length > 0) {
            await Promise.race(promises);
        }
    }

    return {
        saveAndSync,
        save,
        remove,

        // getFieldDefinitions() {
        //     const bases: (typeof SyncModel)[] = [model];
        //     let currentBase = model;
        //     while (currentBase.prototype) {
        //         currentBase = Object.getPrototypeOf(currentBase);
        //         bases.push(currentBase);
        //     }
        //
        //     const columnDefinitions = getMetadataArgsStorage().columns.filter(
        //         (c) => bases.indexOf(c.target as typeof SyncModel) !== -1
        //     );
        //     const relationDefinitions = getMetadataArgsStorage().relations.filter(
        //         (c) => bases.indexOf(c.target as typeof SyncModel) !== -1
        //     );
        //
        //     return {columnDefinitions, relationDefinitions};
        // },

        async removeAndSync(entity: InstanceType<Model>, options?: SyncOptions<RemoveOptions>) {
            if (db.isClientDatabase() && options?.runOnServer !== false) {
                const modelId = Database.getModelIdFor(model);
                const result = await db.removeFromServer(modelId, entity.id, options?.extraData);
                if (result.success === false) {
                    throw new Error(result.error.message);
                }
            }
            return remove(entity, options, true);
        },

        async findAndSync(options: SyncWithCallbackOptions<FindManyOptions<InstanceType<Model>>, InstanceType<Model>[]>) {
            await executeWithSyncAndCallbacks(repository.find, [options], options);
        },

        async findOneAndSync(options: SyncWithCallbackOptions<FindOneOptions<InstanceType<Model>>, InstanceType<Model>>) {
            await executeWithSyncAndCallbacks(repository.findOne, [options], options);
        },

        async initialFind(options?: FindManyOptions<InstanceType<Model>>){
            return new MultipleInitialResult(model, await repository.find(options));
        },

        async initialFindOne(options: FindOneOptions<InstanceType<Model>>){
            return new SingleInitialResult(model, await repository.findOne(options));
        },

        async initialFindOneBy(options: FindOptionsWhere<InstanceType<Model>>|FindOptionsWhere<InstanceType<Model>>[]){
            return new SingleInitialResult(model, await repository.findOneBy(options));
        },

        async initialFindOneById(id: number){
            return new SingleInitialResult(model, await repository.findOneBy({id} as FindOptionsWhere<InstanceType<Model>>));
        }
    };
}

class TypeWrapper<T extends typeof SyncModel> {
    // eslint-disable-next-line class-methods-use-this
    mediate = (model: T) => createSyncRepository(model, Database.getInstance());
}

export type SyncRepository<T extends typeof SyncModel> = Awaited<ReturnType<TypeWrapper<T>["mediate"]>>
