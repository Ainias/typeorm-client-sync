import {
    BaseEntity,
    Column,
    DeleteDateColumn,
    FindManyOptions,
    getMetadataArgsStorage,
    RemoveOptions,
    SaveOptions,
} from 'typeorm';
import { PrimaryServerGeneratedColumn } from './decorators/PrimaryServerGeneratedColumn';
import { JSONObject } from './JSONType';
import { Database } from './Database';
import { ModelContainer, SyncHelper } from './Sync/SyncHelper';
import { ServerBeforeUpdate } from './decorators/ServerBeforeUpdate';
import { ServerBeforeInsert } from './decorators/ServerBeforeInsert';
import { LastQueryDate } from './LastSyncDate/LastQueryDate';

export type SyncOptions<T> = T & {
    clientOnly?: boolean;
};

export class SyncEntity extends BaseEntity {
    static getFieldDefinitions() {
        const bases = [this];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let currentBase = this;
        while (currentBase.prototype) {
            currentBase = Object.getPrototypeOf(currentBase);
            bases.push(currentBase);
        }

        const columnDefinitions = getMetadataArgsStorage().columns.filter(
            (c) => bases.indexOf(c.target as typeof SyncEntity) !== -1
        );
        const relationDefinitions = getMetadataArgsStorage().relations.filter(
            (c) => bases.indexOf(c.target as typeof SyncEntity) !== -1
        );

        return { columnDefinitions, relationDefinitions };
    }

    static async find(options?: SyncOptions<FindManyOptions>) {
        if (Database.getInstance().isClientDatabase() && !options?.clientOnly) {
            const relevantSyncOptions: JSONObject = {
                where: options?.where,
                relations: options?.relations,
                skip: options?.skip,
                take: options?.take,
            };
            if (options?.skip || options?.take) {
                relevantSyncOptions.order = options?.order;
            }

            let lastQueryDate = await LastQueryDate.findOne({ where: { query: JSON.stringify(relevantSyncOptions) } });
            if (!lastQueryDate) {
                lastQueryDate = new LastQueryDate();
                lastQueryDate.query = JSON.stringify(relevantSyncOptions);
            }

            const entityId = Database.getInstance().getEntityIdFor(this);
            const result = await Database.getInstance().queryServer(
                entityId,
                lastQueryDate.lastQueried,
                relevantSyncOptions
            );
            if (result.success === true) {
                if (result.deleted.length > 0) {
                    await super.delete(result.deleted);
                }
                const modelContainer = SyncHelper.convertToModelContainer(result.syncContainer);
                const savePromises = [];
                Object.entries(modelContainer).forEach(([queriedEntityId, modelMap]) => {
                    const entity = Database.getInstance().getEntityForId(Number(queriedEntityId));
                    savePromises.push(entity.save(Object.values(modelMap)));
                });

                lastQueryDate.lastQueried = new Date(result.lastQueryDate);

                await Promise.all(savePromises);
                await lastQueryDate.save();
            } else {
                throw new Error(result.error.message);
            }
        }
        return super.find(options);
    }

    @PrimaryServerGeneratedColumn()
    id?: number;

    @Column()
    createdAt?: Date;

    @Column()
    updatedAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @ServerBeforeInsert()
    updateCreatedAt() {
        this.createdAt = new Date();
    }

    @ServerBeforeInsert()
    @ServerBeforeUpdate()
    updateUpdatedAt() {
        this.updatedAt = new Date();
    }

    async save(options?: SyncOptions<SaveOptions>): Promise<this> {
        if (Database.getInstance().isClientDatabase() && !options?.clientOnly) {
            const modelContainer: ModelContainer = {};
            SyncHelper.addToModelContainer(this, modelContainer);
            const syncContainer = SyncHelper.convertToSyncContainer(modelContainer);

            const entityId = Database.getInstance().getEntityIdFor(this);
            const result = await Database.getInstance().persistToServer(entityId, this.id, syncContainer);
            if (result.success === true) {
                SyncHelper.updateModelContainer(modelContainer, result.syncContainer);
            } else {
                throw new Error(result.error.message);
            }
        }
        return super.save(options);
    }

    async remove(options?: SyncOptions<RemoveOptions>): Promise<this> {
        if (Database.getInstance().isClientDatabase() && !options?.clientOnly) {
            const entityId = Database.getInstance().getEntityIdFor(this);
            const result = await Database.getInstance().removeFromServer(entityId, this.id);
            if (result.success === false) {
                throw new Error(result.error.message);
            }
        }
        return super.remove(options);
    }

    setColumns(columns: JSONObject) {
        Object.assign(this, columns);
        return this;
    }
}
