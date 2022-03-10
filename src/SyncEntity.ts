import {BaseEntity, CreateDateColumn, DeleteDateColumn, UpdateDateColumn} from "typeorm";
import {Database} from "./Database";
import {PrimaryServerGeneratedColumn} from "./decorators/PrimaryServerGeneratedColumn";
import {PromiseWithHandlers} from "js-helper";

export class SyncEntity extends BaseEntity {
    private static database?: Database
    private static databaseInitPromise = new PromiseWithHandlers<void>();
    private static decoratorPromises: Promise<void>[] = [];


    static async setDatabase(database: Database){
        console.log("-- set Database")
        this.database = database;
        this.databaseInitPromise.resolve();
        await Promise.all(this.decoratorPromises);
    }

    static isServer(){
        return this.database?.isServerDatabase();
    }

    static addDecoratorHandler(handler: () => void){
        this.decoratorPromises.push(this.databaseInitPromise.then(handler));
    }

    @PrimaryServerGeneratedColumn()
    id?: number;

    @CreateDateColumn()
    createdAt?: Date

    @UpdateDateColumn()
    updatedAt?: Date

    @DeleteDateColumn()
    deletedAt?: Date
}
