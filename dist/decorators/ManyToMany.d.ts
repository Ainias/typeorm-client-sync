import { SyncModel } from "../SyncModel";
import { ManyToMany as TypeormManyToMany } from "typeorm";
export declare function ManyToMany(...args: Parameters<typeof TypeormManyToMany>): (object: SyncModel, propertyName: string) => void;
