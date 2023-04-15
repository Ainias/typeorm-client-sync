/* eslint-disable class-methods-use-this */
import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    OptimisticLockVersionMismatchError,
    UpdateEvent
} from "typeorm";

@EventSubscriber()
export class ServerSubscriber implements EntitySubscriberInterface {

    /**
     * Called before post insertion.
     */
    beforeInsert(event: InsertEvent<any>) {
        Reflect.set(event.entity, "updatedAt", new Date());
        Reflect.set(event.entity, "createdAt", new Date());
    }


    /**
     * Called before entity update.
     */
    beforeUpdate(event: UpdateEvent<any>) {
        // To know if an entity has a version number, we check if versionColumn
        // is defined in the metadatas of that entity.
        if (event.metadata.versionColumn && event.entity) {
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

        Reflect.set(event.entity, "updatedAt", new Date());
    }
}
