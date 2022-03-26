import {DataSource, DataSourceOptions, FindManyOptions} from 'typeorm';
import type {SyncModel} from './SyncModel';
import {PromiseWithHandlers} from 'js-helper';
import {PersistError} from './Errors/PersistError';
import type {SyncResult} from './Errors/SyncResult';
import type {SyncContainer} from './Sync/SyncHelper';
import {LastQueryDate} from './LastSyncDate/LastQueryDate';
import {QueryError} from './Errors/QueryError';


export type DatabaseOptions = DataSourceOptions & {
    syncModels: ({ new(): SyncModel } & typeof SyncModel)[];
} & (
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
    private static databaseInitPromise = new PromiseWithHandlers<void>();
    private static decoratorPromises: Promise<void>[] = [];

    static addDecoratorHandler(handler: () => void) {
        this.decoratorPromises.push(this.databaseInitPromise.then(handler));
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
            await this.instance.getConnection().destroy();
            this.instance = undefined;
        }
    }

    static getInstance() {
        return this.instance;
    }

    static waitForInstance() {
        return this.instancePromise;
    }

    private options: DatabaseOptions;
    private source?: DataSource;
    private connectionPromise: PromiseWithHandlers<DataSource> = new PromiseWithHandlers<DataSource>();

    private constructor(options: DatabaseOptions) {
        this.options = {entities: [], ...options};
    }

    private async connect() {
        const entities = Object.values(this.options.entities);
        entities.push(...this.options.syncModels);

        if (this.isClientDatabase() && entities.indexOf(LastQueryDate) === -1) {
            entities.push(LastQueryDate);
        }
        this.options = {...this.options, entities};

        Database.databaseInitPromise.resolve();
        await Promise.all(Database.decoratorPromises);

        this.source = new DataSource(this.options);
        await this.source.initialize();
        this.connectionPromise.resolve(this.source);
        Database.instancePromise.resolve(this);

        if (this.isClientDatabase() && typeof window !== "undefined") {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.queryDB = async (sql: string) => {
                const res = await this.source.query(sql);
                console.log(res);
                return res;
            };
        }
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

    getModelIdFor(model: typeof SyncModel) {
        if (!('prototype' in model)) {
            model = model.constructor as typeof SyncModel;
        }
        return this.options.syncModels.findIndex((val) => val === model);
    }

    getModelForId(modelId: number) {
        return this.options.syncModels[modelId];
    }

    async persistToServer(
        entityId: number,
        modelId: number,
        syncContainer: SyncContainer
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
                    body: JSON.stringify({entityId, modelId, syncContainer}),
                    ...fetchOptions,
                }).then((res) => res.json());
            }
            return persist(entityId, modelId, syncContainer);
        }
        return {success: false, error: {message: 'Database is not a client database!'}};
    }

    async queryServer(
        entityId: number,
        lastQueryDate: Date | undefined,
        queryOptions: FindManyOptions
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
                    body: JSON.stringify({entityId, lastQueryDate, queryOptions}),
                    ...fetchOptions,
                }).then((res) => res.json());
            }
            return query(entityId, lastQueryDate, queryOptions);
        }
        return {success: false, error: {message: 'Database is not a client database!'}};
    }

    async removeFromServer(entityId: number, modelId: number) {
        const {isClient} = this.options;

        if (isClient) {
            const {remove, fetchOptions} = this.options;
            if (typeof remove === 'string') {
                return fetch(remove, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({entityId, modelId}),
                    ...fetchOptions,
                }).then((res) => res.json());
            }
            return remove(entityId, modelId);
        }
        return {success: false, error: {message: 'Database is not a client database!'}};
    }
}
