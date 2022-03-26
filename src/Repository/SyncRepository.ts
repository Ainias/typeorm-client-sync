import type {SyncModel} from "../SyncModel";
import {DeepPartial, FindManyOptions, getMetadataArgsStorage, RemoveOptions, Repository, SaveOptions} from "typeorm";
import {Database} from "../Database";
import {LastQueryDate} from "../LastSyncDate/LastQueryDate";
import {EntityContainer, SyncHelper} from "../Sync/SyncHelper";
import {SyncOptions, SyncWithCallbackOptions} from "../SyncModel";

export function getSyncRepository<T extends typeof SyncModel>(model: T) {
    const repository = Database.getInstance().getConnection().getRepository<InstanceType<T>>(model);
    return repository.extend(createSyncRepositoryExtension(model, repository));
}

export function createSyncRepositoryExtension<T extends typeof SyncModel>(model: T, repository: Repository<InstanceType<T>>) {

    const originalSync = repository.save.bind(repository);
    const save = async (...[entity, options, useClientOnlySave]: [...Parameters<typeof repository.save>, boolean?]) => {
        if (useClientOnlySave || Database.getInstance().isServerDatabase()) {
            return originalSync(entity, options);
        }
        throw new Error("Client-Only-Save used without useClientOnlySave-Flag!");
    };

    const originalRemove = repository.remove.bind(repository);
    const remove = async (...[entity, options, useClientOnlyRemove]: [...Parameters<typeof repository.remove>, boolean?]) => {
        if (useClientOnlyRemove || Database.getInstance().isServerDatabase()) {
            return originalRemove(entity, options);
        }
        throw new Error("Client-Only-Remove used without useClientOnlyRemove-Flag!");
    };

    async function saveAndSync(entities: InstanceType<T>[], options?: SyncOptions<SaveOptions> & { reload: false, clientOnly: true })
    async function saveAndSync(entity: InstanceType<T>, options?: SyncOptions<SaveOptions> & { reload: false })
    async function saveAndSync(entity: InstanceType<T> | InstanceType<T>[], options?: SyncOptions<SaveOptions> & { reload: false }) {

        if (Database.getInstance().isClientDatabase() && !options?.clientOnly && !Array.isArray(entity)) {
            const modelContainer: EntityContainer = {};
            SyncHelper.addToEntityContainer(entity, modelContainer);
            const syncContainer = SyncHelper.convertToSyncContainer(modelContainer);

            const entityId = Database.getInstance().getModelIdFor(model);
            const result = await Database.getInstance().persistToServer(entityId, entity.id, syncContainer);
            if (result.success === true) {
                SyncHelper.updateEntityContainer(modelContainer, result.syncContainer);
            } else {
                throw new Error(result.error.message);
            }
        }
        return save(entity as DeepPartial<InstanceType<T>>, options, true);
    }

    return {
        getFieldDefinitions() {
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
        },

        async findWithCallback(options: SyncWithCallbackOptions<FindManyOptions<InstanceType<T>>, InstanceType<T>[]>) {
            let serverCalled = false;
            if (Database.getInstance().isClientDatabase() && !options?.clientOnly) {
                this.findAndSync(options).then((serverResult) => {
                    serverCalled = true;
                    options.callback(serverResult, true);
                });
            }
            await this.findAndSync({...options, clientOnly: true}).then((clientResult) => {
                if (!serverCalled) {
                    options.callback(clientResult, false);
                }
            });
        },

        async sync(options?: FindManyOptions<InstanceType<T>>) {
            if (Database.getInstance().isClientDatabase()) {
                const relevantSyncOptions: FindManyOptions<InstanceType<T>> = {
                    where: options?.where,
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

                const entityId = Database.getInstance().getModelIdFor(model);
                const result = await Database.getInstance().queryServer(
                    entityId,
                    lastQueryDate.lastQueried,
                    relevantSyncOptions
                );
                if (result.success === true) {
                    if (result.deleted.length > 0) {
                        await repository.delete(result.deleted);
                    }
                    const modelContainer = SyncHelper.convertToModelContainer(result.syncContainer);
                    const savePromises = [];
                    Object.entries(modelContainer).forEach(([queriedEntityId, modelMap]) => {
                        const syncedEntity = Database.getInstance().getModelForId(Number(queriedEntityId));
                        const entityRepository = getSyncRepository(syncedEntity);
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        savePromises.push(entityRepository.save(Object.values(modelMap), {reload: false}, true));
                    });

                    lastQueryDate.lastQueried = new Date(result.lastQueryDate);

                    await Promise.all(savePromises);
                    await lastQueryDate.save();
                } else {
                    throw new Error(result.error.message);
                }
            }
        },

        async findAndSync(options?: SyncOptions<FindManyOptions<InstanceType<T>>>) {
            if (Database.getInstance().isClientDatabase() && !options?.clientOnly) {
                await this.sync(options);
            }
            return repository.find(options);
        },
        async removeAndSync(entity: InstanceType<T>, options?: SyncOptions<RemoveOptions>) {
            if (Database.getInstance().isClientDatabase() && !options?.clientOnly) {
                const entityId = Database.getInstance().getModelIdFor(model);
                const result = await Database.getInstance().removeFromServer(entityId, entity.id);
                if (result.success === false) {
                    throw new Error(result.error.message);
                }
            }
            return remove(entity, options, true);
        },
        saveAndSync,
        save,
        remove
    };


}
