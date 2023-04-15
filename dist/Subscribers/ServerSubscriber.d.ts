import { EntitySubscriberInterface, InsertEvent, UpdateEvent } from "typeorm";
export declare class ServerSubscriber implements EntitySubscriberInterface {
    /**
     * Called before post insertion.
     */
    beforeInsert(event: InsertEvent<any>): void;
    /**
     * Called before entity update.
     */
    beforeUpdate(event: UpdateEvent<any>): void;
}
