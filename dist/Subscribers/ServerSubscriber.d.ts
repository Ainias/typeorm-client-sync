import { EntityMetadata, EntitySubscriberInterface, InsertEvent, QueryRunner, RemoveEvent, UpdateEvent } from "typeorm";
export declare class ServerSubscriber implements EntitySubscriberInterface {
    updateUpdatedAt(ids: Record<string, number>, metadata: EntityMetadata, queryRunner: QueryRunner): Promise<void>;
    /**
     * Called before post insertion.
     */
    beforeInsert({ entity }: InsertEvent<any>): Promise<void>;
    afterInsert({ entity, metadata, queryRunner }: InsertEvent<any>): Promise<void>;
    afterRemove({ metadata, entityId, queryRunner }: RemoveEvent<any>): Promise<void>;
    /**
     * Called before entity update.
     */
    beforeUpdate(event: UpdateEvent<any>): void;
    beforeRemove({ metadata, entity, ...other }: RemoveEvent<any>): Promise<any> | void;
}
