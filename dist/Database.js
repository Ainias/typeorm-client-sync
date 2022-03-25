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
exports.Database = void 0;
const typeorm_1 = require("typeorm");
const js_helper_1 = require("js-helper");
const LastQueryDate_1 = require("./LastSyncDate/LastQueryDate");
const SyncRepository_1 = require("./Repository/SyncRepository");
class Database {
    constructor(options) {
        this.connectionPromise = new js_helper_1.PromiseWithHandlers();
        this.options = Object.assign({ entities: [] }, options);
    }
    static addDecoratorHandler(handler) {
        this.decoratorPromises.push(this.databaseInitPromise.then(handler));
    }
    static init(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.instance) {
                this.instance = new Database(options);
                yield this.instance.connect();
            }
            return this.instance;
        });
    }
    static getInstance() {
        return this.instance;
    }
    static waitForInstance() {
        return this.instancePromise;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const entities = Object.values(this.options.entities);
            entities.push(...this.options.syncEntities);
            if (this.isClientDatabase() && entities.indexOf(LastQueryDate_1.LastQueryDate) === -1) {
                entities.push(LastQueryDate_1.LastQueryDate);
            }
            this.options = Object.assign(Object.assign({}, this.options), { entities });
            Database.databaseInitPromise.resolve();
            yield Promise.all(Database.decoratorPromises);
            console.log("Source", typeorm_1.DataSource);
            this.source = new typeorm_1.DataSource(this.options);
            yield this.source.initialize();
            this.connectionPromise.resolve(this.source);
            Database.instancePromise.resolve(this);
            if (this.isClientDatabase() && typeof window !== "undefined") {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                window.queryDB = (sql) => __awaiter(this, void 0, void 0, function* () {
                    const res = yield this.source.query(sql);
                    console.log(res);
                    return res;
                });
            }
        });
    }
    getRepository(entity) {
        const repository = this.source.getRepository(entity);
        return repository.extend(new SyncRepository_1.SyncRepository());
    }
    getConnectionPromise() {
        return this.connectionPromise;
    }
    getConnection() {
        return this.source;
    }
    isClientDatabase() {
        return this.options.isClient === true;
    }
    isServerDatabase() {
        return !this.isClientDatabase();
    }
    getEntityIdFor(classVal) {
        if (!('prototype' in classVal)) {
            classVal = classVal.constructor;
        }
        return this.options.syncEntities.findIndex((val) => val === classVal);
    }
    getEntityForId(entityId) {
        return this.options.syncEntities[entityId];
    }
    persistToServer(entityId, modelId, syncContainer) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isClient } = this.options;
            if (isClient) {
                const { persist, fetchOptions } = this.options;
                if (typeof persist === 'string') {
                    return fetch(persist, Object.assign({ method: 'POST', headers: {
                            'Content-Type': 'application/json',
                        }, body: JSON.stringify({ entityId, modelId, syncContainer }) }, fetchOptions)).then((res) => res.json());
                }
                return persist(entityId, modelId, syncContainer);
            }
            return { success: false, error: { message: 'Database is not a client database!' } };
        });
    }
    queryServer(entityId, lastQueryDate, queryOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isClient } = this.options;
            if (isClient) {
                const { query, fetchOptions } = this.options;
                if (typeof query === 'string') {
                    return fetch(query, Object.assign({ method: 'POST', headers: {
                            'Content-Type': 'application/json',
                        }, body: JSON.stringify({ entityId, lastQueryDate, queryOptions }) }, fetchOptions)).then((res) => res.json());
                }
                return query(entityId, lastQueryDate, queryOptions);
            }
            return { success: false, error: { message: 'Database is not a client database!' } };
        });
    }
    removeFromServer(entityId, modelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isClient } = this.options;
            if (isClient) {
                const { remove, fetchOptions } = this.options;
                if (typeof remove === 'string') {
                    return fetch(remove, Object.assign({ method: 'POST', headers: {
                            'Content-Type': 'application/json',
                        }, body: JSON.stringify({ entityId, modelId }) }, fetchOptions)).then((res) => res.json());
                }
                return remove(entityId, modelId);
            }
            return { success: false, error: { message: 'Database is not a client database!' } };
        });
    }
}
exports.Database = Database;
Database.instancePromise = new js_helper_1.PromiseWithHandlers();
Database.databaseInitPromise = new js_helper_1.PromiseWithHandlers();
Database.decoratorPromises = [];
//# sourceMappingURL=Database.js.map