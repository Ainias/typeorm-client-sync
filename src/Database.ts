import { BaseEntity, DataSource, DataSourceOptions } from 'typeorm';
import type {SyncModel} from './SyncModel';
import {JSONValue, PromiseWithHandlers} from '@ainias42/js-helper';
import {PersistError} from './Errors/PersistError';
import type {SyncResult} from './Errors/SyncResult';
import {LastQueryDate} from './LastQueryDate/LastQueryDate';
import {QueryError} from './Errors/QueryError';
import {SyncContainer} from "./Sync/SyncTypes";
import type {SyncJsonOptions, SyncRepository} from "./Repository/SyncRepository";
import {ServerSubscriber} from "./Subscribers/ServerSubscriber";


export type DatabaseOptions = DataSourceOptions & (
    | {
    isClient?: false;
}
    | {
    isClient: true;
    persist: string | typeof Database.prototype.persistToServer;
    query: string | typeof Database.prototype.queryServer;
    remove: string | typeof Database.prototype.removeFromServer;
    fetchOptions?: RequestInit;
}
    );

export class Database {
    private static instance?: Database;
    private static instancePromise = new PromiseWithHandlers<Database>();
    private static decoratorHandlers: (() => void)[] = [];
    private static syncModels: typeof SyncModel[] = [];

    private static isClientDb: boolean | undefined;
    private static decoratorHandlersCalled = false;

    static isClientDatabase() {
        return this.getInstance()?.isClientDatabase() ?? this.isClientDb;
    }

    static isServerDatabase() {
        return !this.isClientDatabase();
    }

    static setIsClientDatabaseFallback(isClientDatabase: boolean) {
        this.isClientDb = isClientDatabase;
        Database.decoratorHandlers.forEach(handler => handler());
    }

    private static callDecoratorHandlers() {
        if (!this.decoratorHandlersCalled) {
            Database.decoratorHandlers.forEach(handler => handler());
            this.decoratorHandlersCalled = true;
        }
    }

    static addDecoratorHandler(handler: () => void) {
        this.decoratorHandlers.push(handler);
    }

    static async init(options: DatabaseOptions) {
        if (!this.instance) {
            this.instance = new Database(options);
            await this.instance.connect();
        }
        return this.instance;
    }

    static async destroy() {
        if (this.instance) {
            const {instance} = this;
            this.instance = undefined;
            this.instancePromise = new PromiseWithHandlers<Database>();
            await (await instance.getConnectionPromise()).destroy();
        }
    }

    static getInstance(): Database|undefined {
        return this.instance ?? undefined;
    }

    static waitForInstance() {
        return this.instancePromise;
    }

    static setSyncModels(syncModels: typeof SyncModel[]) {
        this.syncModels = syncModels;
    }

    static getModelIdFor(model: typeof SyncModel | SyncModel) {
        if (!('prototype' in model)) {
            model = model.constructor as typeof SyncModel;
        }
        return this.syncModels.findIndex((val) => val === model);
    }

    static getModelForId(modelId: number) {
        return this.syncModels[modelId];
    }

    private options: DatabaseOptions;
    private source?: DataSource;
    private connectionPromise: PromiseWithHandlers<DataSource> = new PromiseWithHandlers<DataSource>();
    private connectionTry = 0;
    private repositories: Record<any, SyncRepository<any>> = {};
    private repositoryPromises: Record<any, Promise<SyncRepository<any>>> = {};

    private constructor(options: DatabaseOptions) {
        this.options = {entities: [], ...options};
    }

    async reconnect(options: DatabaseOptions) {
        this.options = {entities: [], ...options};
        if (this.source) {
            this.source.destroy();
            this.source = undefined;
            this.connectionPromise = new PromiseWithHandlers<DataSource>();
        }
        this.repositoryPromises = {};
        this.connect();
        return this;
    }

    private async connect() {
        this.connectionTry++;
        const currentTry = this.connectionTry;
        const entities = Object.values(this.options.entities ?? {}) as (typeof BaseEntity|typeof SyncModel)[];
        entities.push(...Database.syncModels);

        if (this.isClientDatabase() && entities.indexOf(LastQueryDate) === -1) {
            entities.push(LastQueryDate);
        }

        const subscribers = this.options.subscribers ?? [];
        if (this.isServerDatabase()) {
            if (Array.isArray(subscribers)) {
            console.log("LOG-d adding subscriber to DB as array");
                subscribers.push(ServerSubscriber);
            } else {
            console.log("LOG-d adding subscriber to DB as named object");
                subscribers.typeorm_sync_subscriber = ServerSubscriber;
            }
            console.log("LOG-d subscribers", subscribers);
        }

        this.options = {...this.options, entities, subscribers};

        Database.callDecoratorHandlers();

        const source = new DataSource(this.options);
        await source.initialize().catch(e => console.error("Initialization Error", e));
        if (currentTry !== this.connectionTry) {
            await source.destroy();
            return;
        }

        this.source = source;
        this.connectionPromise.resolve(this.source);
        Database.instancePromise.resolve(this);

        if (this.isClientDatabase() && typeof window !== "undefined") {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.queryDB = async (sql: string) => {
                const res = await this.source?.query(sql);
                console.log(res);
                return res;
            };
        }
    }

    private static entitiesChanged(prevEntities: any[], newEntities: any[]) {
        if (prevEntities.length !== newEntities.length) {
            return true;
        }
        return prevEntities.some((prev, index) => prev !== newEntities[index]);
    }

    getConnectionPromise(): Promise<DataSource> {
        return this.connectionPromise.then(connection => {
            if (Database.entitiesChanged(connection.options.entities as any[], this.options.entities as any[])) {
                return this.reconnect(this.options).then(() => this.getConnectionPromise());
            }
            return connection;
        });
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

    async persistToServer(
        modelId: number,
        entityId: number,
        syncContainer: SyncContainer,
        extraData?: JSONValue
    ): Promise<SyncResult<PersistError>> {
        const {isClient} = this.options;

        if (isClient) {
            const {persist, fetchOptions} = this.options;
            if (typeof persist === 'string') {
                return fetch(persist, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({modelId, entityId, syncContainer, extraData}),
                    ...fetchOptions,
                }).then((res) => res.json());
            }
            return persist(modelId, entityId, syncContainer, extraData);
        }
        return {success: false, error: {message: 'Database is not a client database!'}};
    }

    async queryServer(
        lastQueryDate: Date | undefined,
        queryOptions: SyncJsonOptions,
        extraData?: JSONValue
    ): Promise<SyncResult<QueryError>> {
        const {isClient} = this.options;

        if (isClient) {
            const {query, fetchOptions} = this.options;
            if (typeof query === 'string') {
                return fetch(query, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({lastQueryDate, queryOptions, extraData}),
                    ...fetchOptions,
                }).then((res) => res.json()).catch(e => {
                    console.error("Error while querying server:", e);
                    return {success: false, error: e};
                });
            }
            return query(lastQueryDate, queryOptions, extraData);
        }
        return {success: false, error: {message: 'Database is not a client database!'}};
    }

    private static getTableName(model: typeof SyncModel) {
        let {name} = model;
        name = name.substring(0, 1).toLowerCase() + name.substring(1).replace(/([A-Z])/g, (match) => {
            return `_${match.toLowerCase()}`;
        });
        return name;
    }

    async clearTables() {
        if (!this.source){
            return;
        }

        const queryRunner = await this.source.createQueryRunner();

        const promises = (this.options.entities as typeof SyncModel[]).map(model => {
            if (!this.source){
                return undefined;
            }
            const modelMetadata = this.source.getMetadata(model);
            const joinTablePromises = modelMetadata.relations.map(r => r.joinTableName).filter(name => !!name).map(name => queryRunner.clearTable(name));
            return Promise.all([...joinTablePromises, queryRunner.clearTable(modelMetadata.tableName)]);
        });
        await Promise.all(promises);
    }

    async removeFromServer(modelId: number, entityId: number|number[], extraData?: JSONValue) {
        const {isClient} = this.options;

        if (isClient) {
            const {remove, fetchOptions} = this.options;
            if (typeof remove === 'string') {
                return fetch(remove, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({modelId, entityId, extraData}),
                    ...fetchOptions,
                }).then((res) => res.json());
            }
            return remove(modelId, entityId, extraData);
        }
        return {success: false, error: {message: 'Database is not a client database!'}};
    }


    setRepository<T extends typeof SyncModel>(model: T, repository: SyncRepository<T>) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.repositories[model] = repository;
    }

    getRepository<T extends typeof SyncModel>(model: T) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.repositories[model] as SyncRepository<T> | undefined;
    }

    setRepositoryPromise<T extends typeof SyncModel>(model: T, repositoryPromise: Promise<SyncRepository<T>>) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.repositoryPromises[model] = repositoryPromise;
    }

    getRepositoryPromise<T extends typeof SyncModel>(model: T) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.repositoryPromises[model] as Promise<SyncRepository<T>> | undefined;
    }
}
