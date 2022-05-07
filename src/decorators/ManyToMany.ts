import {SyncModel} from "../SyncModel";
import {Database} from "../Database";
import {ManyToMany as TypeormManyToMany} from "typeorm";

export function ManyToMany(...args: Parameters<typeof TypeormManyToMany>) {
    return function decorator(object: SyncModel, propertyName: string) {
        Database.addDecoratorHandler(() => {
            TypeormManyToMany(...args)(object, propertyName);
        });
    };
}
