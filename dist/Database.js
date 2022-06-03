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
class Database {
    constructor(options) {
        this.connectionPromise = new js_helper_1.PromiseWithHandlers();
        this.connectionTry = 0;
        this.repositories = {};
        this.options = Object.assign({ entities: [] }, options);
    }
    static addDecoratorHandler(handler) {
        this.decoratorHandlers.push(handler);
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
    static destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.instance) {
                const { instance } = this;
                this.instance = undefined;
                this.instancePromise = new js_helper_1.PromiseWithHandlers();
                yield (yield instance.getConnectionPromise()).destroy();
            }
        });
    }
    static getInstance() {
        return this.instance;
    }
    static waitForInstance() {
        return this.instancePromise;
    }
    static setSyncModels(syncModels) {
        this.syncModels = syncModels;
    }
    static getModelIdFor(model) {
        if (!('prototype' in model)) {
            model = model.constructor;
        }
        return this.syncModels.findIndex((val) => val === model);
    }
    static getModelForId(modelId) {
        return this.syncModels[modelId];
    }
    reconnect(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.options = Object.assign({ entities: [] }, options);
            if (this.source) {
                this.source.destroy();
                this.source = undefined;
                this.connectionPromise = new js_helper_1.PromiseWithHandlers();
            }
            this.repositories = {};
            this.connect();
            return this;
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connectionTry++;
            const currentTry = this.connectionTry;
            const entities = Object.values(this.options.entities);
            entities.push(...Database.syncModels);
            if (this.isClientDatabase() && entities.indexOf(LastQueryDate_1.LastQueryDate) === -1) {
                entities.push(LastQueryDate_1.LastQueryDate);
            }
            this.options = Object.assign(Object.assign({}, this.options), { entities });
            Database.decoratorHandlers.forEach(handler => handler());
            const source = new typeorm_1.DataSource(this.options);
            yield source.initialize().catch(e => console.log("Initialization Error", e));
            if (currentTry !== this.connectionTry) {
                yield source.destroy();
                return;
            }
            this.source = source;
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
    static entitiesChanged(prevEntities, newEntities) {
        if (prevEntities.length !== newEntities.length) {
            return true;
        }
        return prevEntities.some((prev, index) => prev !== newEntities[index]);
    }
    getConnectionPromise() {
        return this.connectionPromise.then(connection => {
            if (Database.entitiesChanged(connection.options.entities, this.options.entities)) {
                return this.reconnect(this.options).then(() => this.getConnectionPromise());
            }
            return connection;
        });
    }
    isClientDatabase() {
        return this.options.isClient === true;
    }
    isServerDatabase() {
        return !this.isClientDatabase();
    }
    persistToServer(modelId, entityId, syncContainer, extraData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isClient } = this.options;
            if (isClient) {
                const { persist, fetchOptions } = this.options;
                if (typeof persist === 'string') {
                    return fetch(persist, Object.assign({ method: 'POST', headers: {
                            'Content-Type': 'application/json',
                        }, body: JSON.stringify({ modelId, entityId, syncContainer, extraData }) }, fetchOptions)).then((res) => res.json());
                }
                return persist(modelId, entityId, syncContainer, extraData);
            }
            return { success: false, error: { message: 'Database is not a client database!' } };
        });
    }
    queryServer(lastQueryDate, queryOptions, extraData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isClient } = this.options;
            if (isClient) {
                const { query, fetchOptions } = this.options;
                if (typeof query === 'string') {
                    return fetch(query, Object.assign({ method: 'POST', headers: {
                            'Content-Type': 'application/json',
                        }, body: JSON.stringify({ lastQueryDate, queryOptions, extraData }) }, fetchOptions)).then((res) => res.json()).catch(e => console.error("LOG error:", e));
                }
                return query(lastQueryDate, queryOptions, extraData);
            }
            return { success: false, error: { message: 'Database is not a client database!' } };
        });
    }
    static getTableName(model) {
        let { name } = model;
        name = name.substring(0, 1).toLowerCase() + name.substring(1).replace(/([A-Z])/g, (match) => {
            return `_${match.toLowerCase()}`;
        });
        return name;
    }
    clearTables() {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = yield this.source.createQueryRunner();
            const promises = this.options.entities.map(model => {
                const name = Database.getTableName(model);
                return queryRunner.clearTable(name);
            });
            yield Promise.all(promises);
        });
    }
    removeFromServer(modelId, entityId, extraData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isClient } = this.options;
            if (isClient) {
                const { remove, fetchOptions } = this.options;
                if (typeof remove === 'string') {
                    return fetch(remove, Object.assign({ method: 'POST', headers: {
                            'Content-Type': 'application/json',
                        }, body: JSON.stringify({ modelId, entityId, extraData }) }, fetchOptions)).then((res) => res.json());
                }
                return remove(modelId, entityId, extraData);
            }
            return { success: false, error: { message: 'Database is not a client database!' } };
        });
    }
    setRepositoryPromise(model, repositoryPromise) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.repositories[model] = repositoryPromise;
    }
    getRepositoryPromise(model) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.repositories[model];
    }
}
exports.Database = Database;
Database.instancePromise = new js_helper_1.PromiseWithHandlers();
Database.decoratorHandlers = [];
Database.syncModels = [];
//# sourceMappingURL=Database.js.map