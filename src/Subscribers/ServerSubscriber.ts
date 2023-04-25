/* eslint-disable class-methods-use-this */
import {
    EntityMetadata,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    OptimisticLockVersionMismatchError, QueryRunner, RemoveEvent,
    UpdateEvent
} from "typeorm";

@EventSubscriber()
export class ServerSubscriber implements EntitySubscriberInterface {

    async updateUpdatedAt(ids: Record<string, number>, metadata: EntityMetadata, queryRunner: QueryRunner) {
        const [ownerColumn] = metadata.ownerColumns;
        const [inverseColumn] = metadata.inverseColumns;

        if (!ownerColumn || !inverseColumn) {
            return;
        }

        const ownerProperty = ownerColumn.referencedColumn?.entityMetadata?.propertiesMap?.updatedAt;
        const inverseProperty = inverseColumn.referencedColumn?.entityMetadata?.propertiesMap?.updatedAt;

        const ownerTarget = ownerColumn.referencedColumn?.entityMetadata?.tableName;
        const inverseTarget = inverseColumn.referencedColumn?.entityMetadata?.tableName;

        const ownerId = ids[ownerColumn.propertyName];
        const inverseId = ids[inverseColumn.propertyName];

        if (!ownerProperty || !inverseProperty || !ownerTarget || !inverseTarget || !ownerId || !inverseId) {
            return;
        }

        // Set version = version to not update version
        await queryRunner.manager.createQueryBuilder().callListeners(false).update(ownerTarget).set({[ownerProperty]: new Date(), version: () => "version"}).where("id = :id", {id: ownerId}).execute();
        await queryRunner.manager.createQueryBuilder().callListeners(false).update(inverseTarget).set({[inverseProperty]: new Date(), version: () => "version"}).where("id = :id", {id: inverseId}).execute();
    }

    /**
     * Called before post insertion.
     */
    async beforeInsert({entity}: InsertEvent<any>) {
        if (entity) {
            Reflect.set(entity, "updatedAt", new Date());
            Reflect.set(entity, "createdAt", new Date());
        }
    }

    async afterInsert({entity, metadata, queryRunner}: InsertEvent<any>) {
        if (metadata.isJunction && metadata.tableType === "junction" && entity) {
            await this.updateUpdatedAt(entity, metadata, queryRunner);
        }
    }

    async afterRemove({metadata, entityId, queryRunner}: RemoveEvent<any>) {
        if (metadata.isJunction && metadata.tableType === "junction" && entityId) {
            await this.updateUpdatedAt(entityId, metadata, queryRunner);
        }
    }


    /**
     * Called before entity update.
     */
    beforeUpdate(event: UpdateEvent<any>) {
        // To know if an entity has a version number, we check if versionColumn
        // is defined in the metadatas of that entity.
        if (event.metadata.versionColumn && event.entity && event.databaseEntity) {
            // Getting the current version of the requested entity update
            const versionFromUpdate = Reflect.get(
                event.entity,
                event.metadata.versionColumn.propertyName
            );

            // Getting the entity's version from the database
            const versionFromDatabase = event.databaseEntity[event.metadata.versionColumn.propertyName];

            // they should match otherwise someone has changed it underneath us
            if (versionFromDatabase !== versionFromUpdate) {
                throw new OptimisticLockVersionMismatchError(
                    event.metadata.name,
                    versionFromDatabase,
                    versionFromUpdate
                );
            }
        }

        if (event.entity) {
            Reflect.set(event.entity, "updatedAt", new Date());
        }
    }

    beforeRemove({metadata, entity, ...other}: RemoveEvent<any>): Promise<any> | void {
        if (metadata.tableName === "project_questions_question") {
            debugger
            console.log(entity, other);
        }
    }
}
