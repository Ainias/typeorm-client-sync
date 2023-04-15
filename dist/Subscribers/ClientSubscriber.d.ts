import { EntitySubscriberInterface, InsertEvent, RemoveEvent, SoftRemoveEvent, UpdateEvent } from "typeorm";
export declare class ClientSubscriber implements EntitySubscriberInterface {
    /**
     * Called after entity insertion.
     */
    afterInsert(event: InsertEvent<any>): void;
    /**
     * Called after entity update.
     */
    afterUpdate(event: UpdateEvent<any>): void;
    /**
     * Called after entity removal.
     */
    afterRemove(event: RemoveEvent<any>): void;
    /**
     * Called after entity removal.
     */
    afterSoftRemove(event: SoftRemoveEvent<any>): void;
}
