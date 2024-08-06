/* eslint-disable class-methods-use-this */
import {
    EntityMetadata,
    EntitySubscriberInterface,
    EventSubscriber, getMetadataArgsStorage,
    InsertEvent, ObjectLiteral,
    OptimisticLockVersionMismatchError, QueryRunner, RemoveEvent,
    UpdateEvent, ValueTransformer
} from "typeorm";
import { FileWriter } from "../decorators/FileColumn/FileWriter";
import { FileTransformer } from "../decorators/FileColumn/FileTransformer";
import { FileType } from "../decorators/FileColumn/FileType";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";

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
        await queryRunner.manager.createQueryBuilder().callListeners(false).update(ownerTarget).set({
            [ownerProperty]: new Date(),
            version: () => "version"
        }).where("id = :id", {id: ownerId}).execute();
        await queryRunner.manager.createQueryBuilder().callListeners(false).update(inverseTarget).set({
            [inverseProperty]: new Date(),
            version: () => "version"
        }).where("id = :id", {id: inverseId}).execute();
    }

    async saveFiles(entity: ObjectLiteral, columns: ColumnMetadata[]) {
        const promises = [];
        columns.forEach(column => {
            const transformer = column.transformer as FileTransformer | undefined;
            if (transformer?.isFile) {
                let values: FileType | FileType[] | undefined = Reflect.get(entity, column.propertyName);
                if (values) {
                    let single = false;
                    if (!Array.isArray(values)) {
                        values = [values];
                        single = true;
                    }
                    promises.push(Promise.all(values.map(value => FileWriter.writeToFile(value.src, transformer.fileOptions.saveDirectory).then(newUrl => {
                        return {...value, src: newUrl};
                    }))).then(newValues => {
                        if (single) {
                            Reflect.set(entity, column.propertyName, newValues[0]);
                        } else {
                            Reflect.set(entity, column.propertyName, newValues);
                        }
                    }));
                }
            }
        });
        await Promise.all(promises);
    }

    /**
     * Called before post insertion.
     */
    async beforeInsert({entity, metadata: {columns}}: InsertEvent<any>) {
        if (entity) {
            Reflect.set(entity, "updatedAt", new Date());
            Reflect.set(entity, "createdAt", new Date());

            await this.saveFiles(entity, columns);
        }
    }

    async afterInsert({entityId, metadata, queryRunner}: InsertEvent<any>) {
        if (metadata.isJunction && metadata.tableType === "junction" && entityId) {
            await this.updateUpdatedAt(entityId, metadata, queryRunner);
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
    async beforeUpdate(event: UpdateEvent<any>) {
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

        const {columns} = event.metadata;
        const {entity} = event;
        await this.saveFiles(entity, columns);
    }

    beforeRemove({metadata, entity, ...other}: RemoveEvent<any>): Promise<any> | void {
        // TODO Remove files from server (?)
    }
}
