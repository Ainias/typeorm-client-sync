import {FindManyOptions, IsNull, MoreThan, Not} from 'typeorm';
import {Database} from '../Database';
import {EntityContainer, SyncHelper} from '../Sync/SyncHelper';
import {JsonHelper} from 'js-helper';
import {getSyncRepository} from "../Repository/SyncRepository";

export async function queryFromClient(
    entityId: number,
    lastQueryDate: Date | undefined,
    queryOptions: FindManyOptions
) {
    queryOptions.where = queryOptions.where ?? {};
    const deleteOptions = JsonHelper.deepCopy(queryOptions);

    if (lastQueryDate) {
        if (Array.isArray(queryOptions.where)) {
            queryOptions.where.forEach((orCondition) => (orCondition.updatedAt = MoreThan(lastQueryDate)));
        } else {
            queryOptions.where.updatedAt = MoreThan(lastQueryDate);
        }
    }

    const compareOperator = lastQueryDate ? MoreThan(lastQueryDate) : Not(IsNull());
    if (Array.isArray(deleteOptions.where)) {
        deleteOptions.where.forEach((orCondition) => (orCondition.deletedAt = compareOperator));
    } else {
        deleteOptions.where.deletedAt = compareOperator;
    }

    deleteOptions.withDeleted = true;
    deleteOptions.select = ['id'];

    const model = Database.getInstance().getModelForId(entityId);
    const newLastQueryDate = new Date();
    const repository = getSyncRepository(model);
    const entityPromise = repository.find(queryOptions);
    const deletedPromise = repository.find(deleteOptions);

    const entities = await entityPromise;
    const entityContainer: EntityContainer = {};
    entities.forEach((entity) => {
        SyncHelper.addToEntityContainer(entity, entityContainer);
    });
    const deleted = (await deletedPromise).map((m) => m.id);

    return {
        lastQueryDate: newLastQueryDate,
        deleted,
        syncContainer: SyncHelper.convertToSyncContainer(entityContainer),
    };
}
