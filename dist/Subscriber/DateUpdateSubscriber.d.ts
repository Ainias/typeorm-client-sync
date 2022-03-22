import { EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';
export declare class DateUpdateSubscriber implements EntitySubscriberInterface {
    /**
     * Called before post insertion.
     */
    beforeInsert(event: InsertEvent<any>): void;
    beforeUpdate(event: UpdateEvent<any>): Promise<any> | void;
}
