import type { SyncModel } from "../SyncModel";
import { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, RemoveOptions, Repository, SaveOptions } from "typeorm";
import { Database } from "../Database";
import { JSONValue } from "@ainias42/js-helper";
import { MultipleInitialResult, MultipleInitialResultJSON } from "../InitialResult/MultipleInitialResult";
import { SingleInitialResult, SingleInitialResultJSON } from "../InitialResult/SingleInitialResult";
export type SyncOptions<T> = T & {
    runOnServer?: boolean;
    extraData?: JSONValue;
};
export type SyncJsonOptions = FindManyOptions & {
    modelId: number;
};
export type SyncWithCallbackOptions<T, Result> = SyncOptions<T> & {
    runOnClient?: boolean;
    callback: (value: Result, isServerData: boolean) => void;
    errorCallback?: (error: any, isServerError: boolean) => void;
};
export declare function getSyncRepository<T extends typeof SyncModel>(model: T): Repository<InstanceType<T>> & {
    saveAndSync: {
        (entities: InstanceType<T>[], options?: SaveOptions & {
            runOnServer?: boolean;
            extraData?: JSONValue;
        } & {
            reload: false;
            clientOnly: true;
        }): Promise<InstanceType<T>[]>;
        (entity: InstanceType<T>, options?: SaveOptions & {
            runOnServer?: boolean;
            extraData?: JSONValue;
        } & {
            reload: false;
        }): Promise<InstanceType<T>>;
    };
    save: (__0_0: DeepPartial<InstanceType<T>>, __0_1?: SaveOptions, __0_2?: boolean) => Promise<DeepPartial<InstanceType<T>> & InstanceType<T>>;
    remove: (__0_0: InstanceType<T>, __0_1?: RemoveOptions, __0_2?: boolean) => Promise<InstanceType<T>>;
    saveInitialResult: {
        (initialResult: SingleInitialResult<T> | {
            isServer: boolean;
            date: string;
            entity: import("../Sync/SyncTypes").SingleSyncResult;
            modelId: number;
            isJson: true;
            query: FindOneOptions<InstanceType<T>>;
        }): any;
        (initialResult: MultipleInitialResult<T> | {
            isServer: boolean;
            date: string;
            entities: import("../Sync/SyncTypes").MultipleSyncResults;
            modelId: number;
            isJson: true;
            query: FindManyOptions<InstanceType<T>>;
        }): any;
    };
    removeAndSync(entity: InstanceType<T>, options?: SyncOptions<RemoveOptions>): Promise<InstanceType<T>>;
    findAndSync(options: SyncWithCallbackOptions<FindManyOptions<InstanceType<T>>, InstanceType<T>[]>): Promise<void>;
    promiseFindAndSync(options?: FindManyOptions<InstanceType<T>>): Promise<[InstanceType<T>[], InstanceType<T>[]]>;
    findOneAndSync(options: SyncWithCallbackOptions<FindOneOptions<InstanceType<T>>, InstanceType<T>>): Promise<void>;
    initialFind(options?: FindManyOptions<InstanceType<T>>): Promise<MultipleInitialResult<T>>;
    initialFindOne(options: FindOneOptions<InstanceType<T>>): Promise<SingleInitialResult<T>>;
    initialFindOneBy(options: FindOptionsWhere<InstanceType<T>> | FindOptionsWhere<InstanceType<T>>[]): Promise<SingleInitialResult<T>>;
    initialFindOneById(id: number): Promise<SingleInitialResult<T>>;
    getRelevantSyncOptions: (options?: FindManyOptions<InstanceType<T>>) => SyncJsonOptions;
};
export declare function waitForSyncRepository<T extends typeof SyncModel>(model: T): Promise<Repository<InstanceType<T>> & {
    saveAndSync: {
        (entities: InstanceType<T>[], options?: SaveOptions & {
            runOnServer?: boolean;
            extraData?: JSONValue;
        } & {
            reload: false;
            clientOnly: true;
        }): Promise<InstanceType<T>[]>;
        (entity: InstanceType<T>, options?: SaveOptions & {
            runOnServer?: boolean;
            extraData?: JSONValue;
        } & {
            reload: false;
        }): Promise<InstanceType<T>>;
    };
    save: (__0_0: DeepPartial<InstanceType<T>>, __0_1?: SaveOptions, __0_2?: boolean) => Promise<DeepPartial<InstanceType<T>> & InstanceType<T>>;
    remove: (__0_0: InstanceType<T>, __0_1?: RemoveOptions, __0_2?: boolean) => Promise<InstanceType<T>>;
    saveInitialResult: {
        (initialResult: SingleInitialResult<T> | {
            isServer: boolean;
            date: string;
            entity: import("../Sync/SyncTypes").SingleSyncResult;
            modelId: number;
            isJson: true;
            query: FindOneOptions<InstanceType<T>>;
        }): any;
        (initialResult: MultipleInitialResult<T> | {
            isServer: boolean;
            date: string;
            entities: import("../Sync/SyncTypes").MultipleSyncResults;
            modelId: number;
            isJson: true;
            query: FindManyOptions<InstanceType<T>>;
        }): any;
    };
    removeAndSync(entity: InstanceType<T>, options?: SyncOptions<RemoveOptions>): Promise<InstanceType<T>>;
    findAndSync(options: SyncWithCallbackOptions<FindManyOptions<InstanceType<T>>, InstanceType<T>[]>): Promise<void>;
    promiseFindAndSync(options?: FindManyOptions<InstanceType<T>>): Promise<[InstanceType<T>[], InstanceType<T>[]]>;
    findOneAndSync(options: SyncWithCallbackOptions<FindOneOptions<InstanceType<T>>, InstanceType<T>>): Promise<void>;
    initialFind(options?: FindManyOptions<InstanceType<T>>): Promise<MultipleInitialResult<T>>;
    initialFindOne(options: FindOneOptions<InstanceType<T>>): Promise<SingleInitialResult<T>>;
    initialFindOneBy(options: FindOptionsWhere<InstanceType<T>> | FindOptionsWhere<InstanceType<T>>[]): Promise<SingleInitialResult<T>>;
    initialFindOneById(id: number): Promise<SingleInitialResult<T>>;
    getRelevantSyncOptions: (options?: FindManyOptions<InstanceType<T>>) => SyncJsonOptions;
}>;
export declare function createSyncRepositoryExtension<Model extends typeof SyncModel>(model: Model, repository: Repository<InstanceType<Model>>, db: Database): {
    saveAndSync: {
        (entities: InstanceType<Model>[], options?: SyncOptions<SaveOptions> & {
            reload: false;
            clientOnly: true;
        }): Promise<InstanceType<Model>[]>;
        (entity: InstanceType<Model>, options?: SyncOptions<SaveOptions> & {
            reload: false;
        }): Promise<InstanceType<Model>>;
    };
    save: (__0_0: DeepPartial<InstanceType<Model>>, __0_1?: SaveOptions, __0_2?: boolean) => Promise<DeepPartial<InstanceType<Model>> & InstanceType<Model>>;
    remove: (__0_0: InstanceType<Model>, __0_1?: RemoveOptions, __0_2?: boolean) => Promise<InstanceType<Model>>;
    saveInitialResult: {
        (initialResult: SingleInitialResultJSON<Model> | SingleInitialResult<Model>): any;
        (initialResult: MultipleInitialResultJSON<Model> | MultipleInitialResult<Model>): any;
    };
    removeAndSync(entity: InstanceType<Model>, options?: SyncOptions<RemoveOptions>): Promise<InstanceType<Model>>;
    findAndSync(options: SyncWithCallbackOptions<FindManyOptions<InstanceType<Model>>, InstanceType<Model>[]>): Promise<void>;
    promiseFindAndSync(options?: FindManyOptions<InstanceType<Model>>): Promise<[InstanceType<Model>[], InstanceType<Model>[]]>;
    findOneAndSync(options: SyncWithCallbackOptions<FindOneOptions<InstanceType<Model>>, InstanceType<Model>>): Promise<void>;
    initialFind(options?: FindManyOptions<InstanceType<Model>>): Promise<MultipleInitialResult<Model>>;
    initialFindOne(options: FindOneOptions<InstanceType<Model>>): Promise<SingleInitialResult<Model>>;
    initialFindOneBy(options: FindOptionsWhere<InstanceType<Model>> | FindOptionsWhere<InstanceType<Model>>[]): Promise<SingleInitialResult<Model>>;
    initialFindOneById(id: number): Promise<SingleInitialResult<Model>>;
    getRelevantSyncOptions: (options?: FindManyOptions<InstanceType<Model>>) => SyncJsonOptions;
};
declare class TypeWrapper<T extends typeof SyncModel> {
    mediate: (model: T) => Promise<Repository<InstanceType<T>> & {
        saveAndSync: {
            (entities: InstanceType<T>[], options?: SaveOptions & {
                runOnServer?: boolean;
                extraData?: JSONValue;
            } & {
                reload: false;
                clientOnly: true;
            }): Promise<InstanceType<T>[]>;
            (entity: InstanceType<T>, options?: SaveOptions & {
                runOnServer?: boolean;
                extraData?: JSONValue;
            } & {
                reload: false;
            }): Promise<InstanceType<T>>;
        };
        save: (__0_0: DeepPartial<InstanceType<T>>, __0_1?: SaveOptions, __0_2?: boolean) => Promise<DeepPartial<InstanceType<T>> & InstanceType<T>>;
        remove: (__0_0: InstanceType<T>, __0_1?: RemoveOptions, __0_2?: boolean) => Promise<InstanceType<T>>;
        saveInitialResult: {
            (initialResult: SingleInitialResult<T> | {
                isServer: boolean;
                date: string;
                entity: import("../Sync/SyncTypes").SingleSyncResult;
                modelId: number;
                isJson: true;
                query: FindOneOptions<InstanceType<T>>;
            }): any;
            (initialResult: MultipleInitialResult<T> | {
                isServer: boolean;
                date: string;
                entities: import("../Sync/SyncTypes").MultipleSyncResults;
                modelId: number;
                isJson: true;
                query: FindManyOptions<InstanceType<T>>;
            }): any;
        };
        removeAndSync(entity: InstanceType<T>, options?: SyncOptions<RemoveOptions>): Promise<InstanceType<T>>;
        findAndSync(options: SyncWithCallbackOptions<FindManyOptions<InstanceType<T>>, InstanceType<T>[]>): Promise<void>;
        promiseFindAndSync(options?: FindManyOptions<InstanceType<T>>): Promise<[InstanceType<T>[], InstanceType<T>[]]>;
        findOneAndSync(options: SyncWithCallbackOptions<FindOneOptions<InstanceType<T>>, InstanceType<T>>): Promise<void>;
        initialFind(options?: FindManyOptions<InstanceType<T>>): Promise<MultipleInitialResult<T>>;
        initialFindOne(options: FindOneOptions<InstanceType<T>>): Promise<SingleInitialResult<T>>;
        initialFindOneBy(options: FindOptionsWhere<InstanceType<T>> | FindOptionsWhere<InstanceType<T>>[]): Promise<SingleInitialResult<T>>;
        initialFindOneById(id: number): Promise<SingleInitialResult<T>>;
        getRelevantSyncOptions: (options?: FindManyOptions<InstanceType<T>>) => SyncJsonOptions;
    }>;
}
export type SyncRepository<T extends typeof SyncModel> = Awaited<ReturnType<TypeWrapper<T>["mediate"]>>;
export {};
