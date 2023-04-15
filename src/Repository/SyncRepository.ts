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
import {LastQueryDate} from "../LastQueryDate/LastQueryDate";
import {SyncHelper} from "../Sync/SyncHelper";
import {EntityContainer} from "../Sync/SyncTypes";
import {JSONValue, PromiseWithHandlers} from "@ainias42/js-helper";
import {MultipleInitialResult, MultipleInitialResultJSON} from "../InitialResult/MultipleInitialResult";
import {SingleInitialResult, SingleInitialResultJSON} from "../InitialResult/SingleInitialResult";
import {SyncResult} from "../Errors/SyncResult";
import {SyncError} from "../Errors/SyncError";

type FunctionProperties2<T> = {
    [K in keyof T]: T[K] extends ((...args: any) => any) ? T[K] : never;
}[keyof T];

export type SyncOptions<T> = T & {
    runOnServer?: boolean;
    extraData?: JSONValue
};

export type SyncJsonOptions = FindManyOptions & { modelId: number };

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

export function getSyncRepository<T extends typeof SyncModel>(model: T) {
    const db = Database.getInstance();
    let syncRepository = db?.getRepository(model);

    if (!syncRepository && db) {

        const connection = db.getConnection();
        const repository = connection.getRepository<InstanceType<T>>(model);
        syncRepository = repository.extend(createSyncRepositoryExtension(model, repository, db));
        db.setRepository(model, syncRepository);
        db.setRepositoryPromise(model, Promise.resolve(syncRepository));
    }
    return syncRepository;
}

export async function waitForSyncRepository<T extends typeof SyncModel>(model: T) {
    const db = await Database.waitForInstance();
    if (!db.getRepositoryPromise(model)) {
        db.setRepositoryPromise(model, createSyncRepository(model, db));
    }
    return db.getRepositoryPromise(model) as Promise<SyncRepository<T>>;
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
                throw new Error(result.error.message ?? result.error.toString());
            }
        }
        await save(entity as DeepPartial<InstanceType<Model>>, options, true);
    }

    function getRelevantSyncOptions(options?: FindManyOptions<InstanceType<Model>>){
        const modelId = Database.getModelIdFor(model);
        const relevantSyncOptions: SyncJsonOptions = {
            where: SyncHelper.convertWhereToJson(options?.where ?? {}),
            relations: options?.relations,
            skip: options?.skip,
            take: options?.take,
            modelId,
        };

        if (options?.skip || options?.take) {
            relevantSyncOptions.order = options?.order;
        }

        return relevantSyncOptions;
    }

    async function prepareSync(options?: FindManyOptions<InstanceType<Model>>) {
        const relevantSyncOptions = getRelevantSyncOptions(options);

        // TODO primary key through hashing? => Evaluate if hashing and querying is faster than query with full query
        const stringifiedSyncOptions = JSON.stringify(relevantSyncOptions);
        let lastQueryDate = await LastQueryDate.findOne({
            where: {
                query: stringifiedSyncOptions
            }
        });

        if (!lastQueryDate) {
            lastQueryDate = new LastQueryDate();
            lastQueryDate.query = stringifiedSyncOptions;
        }

        return [lastQueryDate, relevantSyncOptions] as const;
    }

    async function handleSyncResult(result: SyncResult<SyncError>, lastQueryDate: LastQueryDate) {
        if (result.success === true) {
            if (result.deleted.length > 0) {
                await repository.remove(result.deleted.map(id => ({id} as InstanceType<Model>)));
            }
            const modelContainer = SyncHelper.convertToModelContainer(result.syncContainer);

            // // TODO asynchronous saving of entities
            let savePromise = Promise.resolve(undefined);
            Object.entries(modelContainer).forEach(([queriedModelId, entityMap]) => {
                const syncedModel = Database.getModelForId(Number(queriedModelId));
                savePromise = savePromise.then(() => {
                    return waitForSyncRepository(syncedModel).then(modelRepository => {
                        const entities = Object.values(entityMap);

                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        return modelRepository.save(entities, {reload: false}, true).catch(e => {
                            console.error("got error for saving entities", entities, e);
                            throw e;
                        });
                    });
                });
            });


            lastQueryDate.lastQueried = new Date(result.lastQueryDate);
            try {
                await savePromise;
                await lastQueryDate.save();
            } catch (e) {
                console.error("Sync Error", e);
                throw e;
            }
        } else {
            console.error("Sync Error from Server", result.error.message);
            throw new Error(result.error.message);
        }
    }

    async function sync(options?: FindManyOptions<InstanceType<Model>>) {
        if (db.isServerDatabase()) {
            return;
        }
        const [lastQueryDate, relevantSyncOptions] = await prepareSync(options);
        const result = await db.queryServer(
            lastQueryDate.lastQueried,
            relevantSyncOptions,
        );
        await handleSyncResult(result, lastQueryDate);
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
                console.error(e);
                syncOptions?.errorCallback?.(e, true);
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

    async function saveInitialResult(initialResult: SingleInitialResultJSON<Model> | SingleInitialResult<Model>)
    async function saveInitialResult(initialResult: MultipleInitialResultJSON<Model> | MultipleInitialResult<Model>)
    async function saveInitialResult(initialResult: MultipleInitialResultJSON<Model> | MultipleInitialResult<Model> | SingleInitialResultJSON<Model> | SingleInitialResult<Model>) {
        if (db.isServerDatabase()) {
            throw new Error("saveInitialResult should only be called on client!");
        }

        if (!initialResult.isServer){
            return;
        }

        if (initialResult.isJson === false) {
            initialResult = initialResult.toJSON();
        }
        const [lastQueryDate] = await prepareSync(initialResult.query);
        const {syncContainer} = "entities" in initialResult ? initialResult.entities : initialResult.entity;

        const modelId = Database.getModelIdFor(model);

        const deletedEntities = await repository.find({...initialResult.query, select: ["id"]} as FindManyOptions);
        const deleted = deletedEntities.map((m) => m.id).filter(id => !syncContainer[modelId][id]);

        const result: SyncResult<SyncError> = {
            success: true,
            deleted,
            lastQueryDate: initialResult.date,
            syncContainer
        };
        await handleSyncResult(result, lastQueryDate);
    }

    return {
        saveAndSync,
        save,
        remove,
        saveInitialResult,

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

        async promiseFindAndSync(options: FindManyOptions<InstanceType<Model>> = {}) {
            const clientPromise = new PromiseWithHandlers<InstanceType<Model>[]>();
            const serverPromise = new PromiseWithHandlers<InstanceType<Model>[]>();
            const syncOptions = {
                callback: (posts, isServerData) => {
                    if (isServerData) {
                        serverPromise.resolve(posts);
                    } else {
                        clientPromise.resolve(posts);
                    }
                },
                errorCallback: ((e, isServer) => {
                    if (isServer) {
                        serverPromise.reject(e);
                    } else {
                        clientPromise.reject(e);
                    }
                }),
                runOnClient: true,
                ...options
            };

            await executeWithSyncAndCallbacks(repository.find, [syncOptions], syncOptions);
            return Promise.all([clientPromise, serverPromise]);
        },

        async findOneAndSync(options: SyncWithCallbackOptions<FindOneOptions<InstanceType<Model>>, InstanceType<Model>>) {
            await executeWithSyncAndCallbacks(repository.findOne, [options], options);
        },

        async initialFind(options?: FindManyOptions<InstanceType<Model>>) {
            const syncDate = new Date();
            return new MultipleInitialResult(model, await repository.find(options), syncDate, options);
        },

        async initialFindOne(options: FindOneOptions<InstanceType<Model>>) {
            const syncDate = new Date();
            return new SingleInitialResult(model, await repository.findOne(options), syncDate, options);
        },

        async initialFindOneBy(options: FindOptionsWhere<InstanceType<Model>> | FindOptionsWhere<InstanceType<Model>>[]) {
            const syncDate = new Date();
            return new SingleInitialResult(model, await repository.findOneBy(options), syncDate, {where: options});
        },

        async initialFindOneById(id: number) {
            const syncDate = new Date();
            return new SingleInitialResult(model, await repository.findOneBy({id} as FindOptionsWhere<InstanceType<Model>>), syncDate, {where: {id}} as FindOneOptions<InstanceType<Model>>);
        },
        getRelevantSyncOptions,
    };
}

class TypeWrapper<T extends typeof SyncModel> {
    // eslint-disable-next-line class-methods-use-this
    mediate = (model: T) => createSyncRepository(model, Database.getInstance());
}

export type SyncRepository<T extends typeof SyncModel> = Awaited<ReturnType<TypeWrapper<T>["mediate"]>>
