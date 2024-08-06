import { DefaultNamingStrategy, NamingStrategyInterface, Table } from "typeorm";

export class DbNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {

    private createKey(prefix: string, tableOrName: Table | string, columnNames: string[], suffix?: string): string {
        const clonedColumnNames = [...columnNames]
        clonedColumnNames.sort()
        const tableName = this.getTableName(tableOrName)
        const replacedTableName = tableName.replace(".", "_")
        let key = `${prefix}_${replacedTableName}_${clonedColumnNames.join("_")}`
        if (suffix){
            key += `_${suffix}`;
        }
        return key;
    }

    indexName(tableOrName: Table | string, columnNames: string[], where?: string): string {
        return this.createKey("IDX", tableOrName, columnNames, where)
    }

    foreignKeyName(
        tableOrName: Table | string,
        columnNames: string[],
    ): string {
        return this.createKey("FK", tableOrName, columnNames)
    }

    uniqueConstraintName(
        tableOrName: Table | string,
        columnNames: string[],
    ): string {
        // There is a bug in the cli. They use the indexName method to generate unique constraint names
        return this.createKey("IDX", tableOrName, columnNames)
    }

    primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
        return this.createKey("PK", tableOrName, columnNames)
    }

    relationConstraintName(
        tableOrName: Table | string,
        columnNames: string[],
        where?: string,
    ): string {
        return this.createKey("REL", tableOrName, columnNames, where)
    }

    checkConstraintName(
        tableOrName: Table | string,
        expression: string,
        isEnum?: boolean,
    ): string {
        return this.createKey("CHK", tableOrName, [expression], isEnum ? "ENUM" : undefined)
    }

    exclusionConstraintName(
        tableOrName: Table | string,
        expression: string,
    ): string {
        return this.createKey("XCL", tableOrName, [expression])
    }
}
