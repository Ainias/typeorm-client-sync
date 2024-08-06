// Do not change the columns here. It is needed for migration, aka creation of the database
export function getCreateTableColumns() {
    return [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
        isNullable: false,
    }, {
        name: 'createdAt',
        type: 'datetime',
        isNullable: false,
    }, {
        name: 'updatedAt',
        type: 'datetime',
        isNullable: false,
    }, {
        name: 'deletedAt',
        type: 'datetime(6)',
        isNullable: true,
    }, {
        name: 'version',
        type: 'int',
        isNullable: false,
    }] as const;
}
