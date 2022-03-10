import {SyncEntity} from "../SyncEntity";
import {PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {PrimaryGeneratedColumnNumericOptions} from "typeorm/decorator/options/PrimaryGeneratedColumnNumericOptions";
import {PrimaryGeneratedColumnUUIDOptions} from "typeorm/decorator/options/PrimaryGeneratedColumnUUIDOptions";
import {PrimaryGeneratedColumnIdentityOptions} from "typeorm/decorator/options/PrimaryGeneratedColumnIdentityOptions";
import {PrimaryColumnOptions} from "typeorm/decorator/columns/PrimaryColumn";
import {ColumnType} from "typeorm/driver/types/ColumnTypes";

type PrimaryServerGeneratedColumnOptions = ({
    strategy?: "increment"
    generatedOptions?: PrimaryGeneratedColumnNumericOptions
} | {
    strategy: "uuid"
    generatedOptions?: PrimaryGeneratedColumnUUIDOptions
} | {
    strategy: "rowid"
    generatedOptions?: PrimaryGeneratedColumnUUIDOptions
} | {
    strategy: "identity"
    generatedOptions?: PrimaryGeneratedColumnIdentityOptions
}) & {
    options?: PrimaryColumnOptions
    type?: ColumnType
}

export function PrimaryServerGeneratedColumn({
                                                 strategy = "increment",
                                                 generatedOptions,
                                                 options,
                                                 type
                                             }: PrimaryServerGeneratedColumnOptions = {}) {
    return function (object: SyncEntity, propertyName: string) {
        SyncEntity.addDecoratorHandler(() => {
            if (SyncEntity.isServer()) {
                console.log("LOG-d isServer!")

                switch (strategy) {
                    case "increment": {
                        return PrimaryGeneratedColumn(strategy, generatedOptions)(object, propertyName);
                    }
                    case "uuid": {
                        return PrimaryGeneratedColumn(strategy, generatedOptions)(object, propertyName);
                    }
                    case "rowid": {
                        return PrimaryGeneratedColumn(strategy, generatedOptions)(object, propertyName);
                    }
                    case "identity": {
                        return PrimaryGeneratedColumn(strategy, generatedOptions)(object, propertyName);
                    }
                }
            } else {
                console.log("LOG-d isClient!")
                return PrimaryColumn(type, options)(object, propertyName);
            }
        })
    }
}
