import {Connection, ConnectionOptions} from "typeorm";
import {SyncEntity} from "./SyncEntity";
import {createConnection} from "typeorm";

type DistributiveOmit<T, K extends keyof any> = T extends any
    ? Omit<T, K>
    : never;

export type DatabaseOptions = DistributiveOmit<ConnectionOptions, "entities"> & {
    isClient?: boolean,
    serverUrl?: string,
    entities: ({ new(): SyncEntity, setDatabase(db: Database): void })[]
}

export class Database {
    private static instance?: Database;
    static async init(options: DatabaseOptions){
        console.log("-- before init")
        if (!this.instance){
            this.instance = new Database(options);
            await this.instance.connect();
        }
        console.log("-- after connect")
        return this.instance;
    }

    private options: DatabaseOptions;
    private connection?: Connection;

    private constructor(options: DatabaseOptions) {
        if (options.isClient === undefined){
            options.isClient = options.serverUrl !== undefined;
        }

        this.options = options;
    }

    private async connect(){
        console.log("-- in connect")
        this.options.entities.forEach(entity => entity.setDatabase(this));
        console.log("-- middle connect")
        this.connection = await createConnection(this.options as ConnectionOptions);
        console.log("-- after connect")
    }

    getConnection(){
        return this.connection;
    }

    isClientDatabase(){
        console.log("LOG Database is Client?", this.options.isClient)
        return this.options.isClient === true;
    }

    isServerDatabase(){
        return !this.isClientDatabase();
    }
}
