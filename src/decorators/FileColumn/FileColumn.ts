import { Database } from "../../Database";
import { Column, getMetadataArgsStorage } from "typeorm";
import { ColumnMetadataArgs } from "typeorm/metadata-args/ColumnMetadataArgs";
import { FileType } from "./FileType";

export function FileColumn(options: { saveDirectory: string, publicPath: string }) {
    return function decorator(object: any, propertyName: string) {
        Database.addDecoratorHandler(() => {
            if (Database.isServerDatabase()) {
                getMetadataArgsStorage().columns.push({
                    target: object.constructor,
                    propertyName,
                    mode: "regular",
                    options: {
                        type: "json",
                        isFile: true,
                        nullable: true,
                        transformer: {
                            isFile: true,
                            fileOptions: options,
                            to: (values: FileType | FileType[] | undefined) => {
                                if (values) {
                                    let single = false;
                                    if (!Array.isArray(values)) {
                                        values = [values];
                                        single = true;
                                    }
                                    values.forEach(value => {
                                        if (value.src.startsWith(options.publicPath)) {
                                            value.src = value.src.substring(options.publicPath.length);
                                        }
                                    });
                                    if (single){
                                        return values[0];
                                    }
                                }
                                return values;
                            },
                            from: (values: FileType | FileType[] | undefined) => {
                                if (values) {
                                    let single = false;
                                    if (!Array.isArray(values)) {
                                        values = [values];
                                        single = true;
                                    }
                                    values.forEach(value => {
                                        if (!value.src.startsWith("data:")) {
                                            value.src = options.publicPath + value.src;
                                        }
                                    });
                                    if (single){
                                        return values[0];
                                    }
                                }
                                return values;
                            }
                        }
                    },
                } as ColumnMetadataArgs);
                // BeforeInsert()(object, propertyName);
            } else {
                Column("text", {
                    nullable: true,
                    transformer: {
                        to: (value: FileType | FileType[]) => {
                            return JSON.stringify(value);
                        },
                        from: (value: string) => {
                            try {
                                return JSON.parse(value);
                            } catch (error) {
                                return null;
                            }
                        }
                    }
                })(object, propertyName);
            }
        });
    };
}
