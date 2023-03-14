"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSyncRepositoryExtension = exports.waitForSyncRepository = exports.getSyncRepository = void 0;
const Database_1 = require("../Database");
const LastQueryDate_1 = require("../LastQueryDate/LastQueryDate");
const SyncHelper_1 = require("../Sync/SyncHelper");
const js_helper_1 = require("@ainias42/js-helper");
const MultipleInitialResult_1 = require("../InitialResult/MultipleInitialResult");
const SingleInitialResult_1 = require("../InitialResult/SingleInitialResult");
function createSyncRepository(model, db) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db.getConnectionPromise();
        const repository = connection.getRepository(model);
        return repository.extend(createSyncRepositoryExtension(model, repository, db));
    });
}
function getSyncRepository(model) {
    const db = Database_1.Database.getInstance();
    let syncRepository = db === null || db === void 0 ? void 0 : db.getRepository(model);
    if (!syncRepository && db) {
        const connection = db.getConnection();
        const repository = connection.getRepository(model);
        syncRepository = repository.extend(createSyncRepositoryExtension(model, repository, db));
        db.setRepository(model, syncRepository);
        db.setRepositoryPromise(model, Promise.resolve(syncRepository));
    }
    return syncRepository;
}
exports.getSyncRepository = getSyncRepository;
function waitForSyncRepository(model) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield Database_1.Database.waitForInstance();
        if (!db.getRepositoryPromise(model)) {
            db.setRepositoryPromise(model, createSyncRepository(model, db));
        }
        return db.getRepositoryPromise(model);
    });
}
exports.waitForSyncRepository = waitForSyncRepository;
function createSyncRepositoryExtension(model, repository, db) {
    const originalSync = repository.save.bind(repository);
    const save = (...[entity, options, useClientOnlySave]) => __awaiter(this, void 0, void 0, function* () {
        if (useClientOnlySave || db.isServerDatabase()) {
            return originalSync(entity, options);
        }
        throw new Error("Client-Only-Save used without useClientOnlySave-Flag!");
    });
    const originalRemove = repository.remove.bind(repository);
    const remove = (...[entity, options, useClientOnlyRemove]) => __awaiter(this, void 0, void 0, function* () {
        if (useClientOnlyRemove || db.isServerDatabase()) {
            return originalRemove(entity, options);
        }
        throw new Error("Client-Only-Remove used without useClientOnlyRemove-Flag!");
    });
    function saveAndSync(entity, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (db.isClientDatabase() && (options === null || options === void 0 ? void 0 : options.runOnServer) !== false && !Array.isArray(entity)) {
                const modelContainer = {};
                SyncHelper_1.SyncHelper.addToEntityContainer(entity, modelContainer);
                const syncContainer = SyncHelper_1.SyncHelper.convertToSyncContainer(modelContainer);
                const modelId = Database_1.Database.getModelIdFor(model);
                const result = yield db.persistToServer(modelId, entity.id, syncContainer, options === null || options === void 0 ? void 0 : options.extraData);
                if (result.success === true) {
                    SyncHelper_1.SyncHelper.updateEntityContainer(modelContainer, result.syncContainer);
                }
                else {
                    throw new Error(result.error.message);
                }
            }
            if (db.isServerDatabase()) {
                yield save(entity, options, true);
            }
        });
    }
    function prepareSync(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const modelId = Database_1.Database.getModelIdFor(model);
            const relevantSyncOptions = {
                where: SyncHelper_1.SyncHelper.convertWhereToJson((_a = options === null || options === void 0 ? void 0 : options.where) !== null && _a !== void 0 ? _a : {}),
                relations: options === null || options === void 0 ? void 0 : options.relations,
                skip: options === null || options === void 0 ? void 0 : options.skip,
                take: options === null || options === void 0 ? void 0 : options.take,
                modelId,
            };
            if ((options === null || options === void 0 ? void 0 : options.skip) || (options === null || options === void 0 ? void 0 : options.take)) {
                relevantSyncOptions.order = options === null || options === void 0 ? void 0 : options.order;
            }
            // TODO primary key through hashing? => Evaluate if hashing and querying is faster than query with full query
            const stringifiedSyncOptions = JSON.stringify(relevantSyncOptions);
            let lastQueryDate = yield LastQueryDate_1.LastQueryDate.findOne({
                where: {
                    query: stringifiedSyncOptions
                }
            });
            if (!lastQueryDate) {
                lastQueryDate = new LastQueryDate_1.LastQueryDate();
                lastQueryDate.query = stringifiedSyncOptions;
            }
            return [lastQueryDate, relevantSyncOptions];
        });
    }
    function handleSyncResult(result, lastQueryDate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (result.success === true) {
                if (result.deleted.length > 0) {
                    yield repository.remove(result.deleted.map(id => ({ id })));
                }
                const modelContainer = SyncHelper_1.SyncHelper.convertToModelContainer(result.syncContainer);
                // // TODO asynchronous saving of entities. Maybe other sqljs version?
                let savePromise = Promise.resolve(undefined);
                Object.entries(modelContainer).forEach(([queriedModelId, entityMap]) => {
                    const syncedModel = Database_1.Database.getModelForId(Number(queriedModelId));
                    savePromise = savePromise.then(() => {
                        return waitForSyncRepository(syncedModel).then(modelRepository => {
                            const entities = Object.values(entityMap);
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            return modelRepository.save(entities, { reload: false }, true).catch(e => {
                                console.error("got error for saving entities", entities, e);
                                throw e;
                            });
                        });
                    });
                });
                // debugger;
                // const savePromises = [];
                // Object.entries(modelContainer).forEach(([queriedModelId, entityMap]) => {
                //     const syncedModel = Database.getModelForId(Number(queriedModelId));
                //     savePromises.push(waitForSyncRepository(syncedModel).then(async modelRepository => {
                //         const entities = Object.values(entityMap);
                //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //         // @ts-ignore
                //         return modelRepository.save(entities, {reload: false}, true).catch(e => {
                //             console.error("got error for saving entities", entities, e);
                //             throw e;
                //         });
                //     }));
                // });
                // const savePromise = Promise.all(savePromises);
                lastQueryDate.lastQueried = new Date(result.lastQueryDate);
                try {
                    yield savePromise;
                    yield lastQueryDate.save();
                }
                catch (e) {
                    console.error("Sync Error", e);
                    throw e;
                }
            }
            else {
                console.error("Sync Error from Server", result.error.message);
                throw new Error(result.error.message);
            }
        });
    }
    function sync(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (db.isServerDatabase()) {
                return;
            }
            const [lastQueryDate, relevantSyncOptions] = yield prepareSync(options);
            const result = yield db.queryServer(lastQueryDate.lastQueried, relevantSyncOptions);
            return handleSyncResult(result, lastQueryDate);
        });
    }
    function executeWithSyncAndCallbacks(method, params, syncOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const bindedMethod = method.bind(repository);
            let serverCalled = false;
            const promises = [];
            if (db.isClientDatabase() && syncOptions.runOnServer !== false) {
                promises.push(sync(syncOptions).then(() => bindedMethod(...params)).then((serverResult) => {
                    serverCalled = true;
                    syncOptions.callback(serverResult, true);
                }).catch(e => {
                    var _a;
                    console.error(e);
                    (_a = syncOptions === null || syncOptions === void 0 ? void 0 : syncOptions.errorCallback) === null || _a === void 0 ? void 0 : _a.call(syncOptions, e, true);
                }));
            }
            if (db.isServerDatabase() || syncOptions.runOnClient !== false) {
                promises.push(bindedMethod(...params).then((clientResult) => {
                    if (!serverCalled) {
                        syncOptions.callback(clientResult, false);
                    }
                }).catch(e => {
                    if (!serverCalled) {
                        syncOptions === null || syncOptions === void 0 ? void 0 : syncOptions.errorCallback(e, false);
                    }
                }));
            }
            if (promises.length > 0) {
                yield Promise.race(promises);
            }
        });
    }
    function saveInitialResult(initialResult) {
        return __awaiter(this, void 0, void 0, function* () {
            if (db.isServerDatabase()) {
                throw new Error("fromInitialResult should only be called on client!");
            }
            if (initialResult.isJson === false) {
                initialResult = initialResult.toJSON();
            }
            const [lastQueryDate] = yield prepareSync(initialResult.query);
            const { syncContainer } = "entities" in initialResult ? initialResult.entities : initialResult.entity;
            const modelId = Database_1.Database.getModelIdFor(model);
            const deletedEntities = yield repository.find(Object.assign(Object.assign({}, initialResult.query), { select: ["id"] }));
            const deleted = deletedEntities.map((m) => m.id).filter(id => !syncContainer[modelId][id]);
            const result = {
                success: true,
                deleted,
                lastQueryDate: initialResult.date,
                syncContainer
            };
            return handleSyncResult(result, lastQueryDate);
        });
    }
    return {
        saveAndSync,
        save,
        remove,
        saveInitialResult,
        removeAndSync(entity, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (db.isClientDatabase() && (options === null || options === void 0 ? void 0 : options.runOnServer) !== false) {
                    const modelId = Database_1.Database.getModelIdFor(model);
                    const result = yield db.removeFromServer(modelId, entity.id, options === null || options === void 0 ? void 0 : options.extraData);
                    if (result.success === false) {
                        throw new Error(result.error.message);
                    }
                }
                return remove(entity, options, true);
            });
        },
        findAndSync(options) {
            return __awaiter(this, void 0, void 0, function* () {
                yield executeWithSyncAndCallbacks(repository.find, [options], options);
            });
        },
        promiseFindAndSync(options = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                const clientPromise = new js_helper_1.PromiseWithHandlers();
                const serverPromise = new js_helper_1.PromiseWithHandlers();
                const syncOptions = Object.assign({ callback: (posts, isServerData) => {
                        if (isServerData) {
                            serverPromise.resolve(posts);
                        }
                        else {
                            clientPromise.resolve(posts);
                        }
                    }, errorCallback: ((e, isServer) => {
                        if (isServer) {
                            serverPromise.reject(e);
                        }
                        else {
                            clientPromise.reject(e);
                        }
                    }), runOnClient: true }, options);
                yield executeWithSyncAndCallbacks(repository.find, [syncOptions], syncOptions);
                return Promise.all([clientPromise, serverPromise]);
            });
        },
        findOneAndSync(options) {
            return __awaiter(this, void 0, void 0, function* () {
                yield executeWithSyncAndCallbacks(repository.findOne, [options], options);
            });
        },
        initialFind(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const syncDate = new Date();
                return new MultipleInitialResult_1.MultipleInitialResult(model, yield repository.find(options), syncDate, options);
            });
        },
        initialFindOne(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const syncDate = new Date();
                return new SingleInitialResult_1.SingleInitialResult(model, yield repository.findOne(options), syncDate, options);
            });
        },
        initialFindOneBy(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const syncDate = new Date();
                return new SingleInitialResult_1.SingleInitialResult(model, yield repository.findOneBy(options), syncDate, { where: options });
            });
        },
        initialFindOneById(id) {
            return __awaiter(this, void 0, void 0, function* () {
                const syncDate = new Date();
                return new SingleInitialResult_1.SingleInitialResult(model, yield repository.findOneBy({ id }), syncDate, { where: { id } });
            });
        },
    };
}
exports.createSyncRepositoryExtension = createSyncRepositoryExtension;
class TypeWrapper {
    constructor() {
        // eslint-disable-next-line class-methods-use-this
        this.mediate = (model) => createSyncRepository(model, Database_1.Database.getInstance());
    }
}
//# sourceMappingURL=SyncRepository.js.map