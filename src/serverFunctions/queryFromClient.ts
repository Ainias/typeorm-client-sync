import {FindManyOptions, FindOneOptions, IsNull, MoreThan, Not} from 'typeorm';
import {Database} from '../Database';
import {SyncHelper} from '../Sync/SyncHelper';
import {DateHelper, JsonHelper} from '@ainias42/js-helper';
import {SyncJsonOptions, waitForSyncRepository} from "../Repository/SyncRepository";

export async function queryFromClient(
    lastQueryDate: Date | string | undefined,
    queryOptions: SyncJsonOptions,
    syncOne = false
) {

    const {modelId} = queryOptions;
    const deleteOptions = JsonHelper.deepCopy(queryOptions);
    queryOptions.where = SyncHelper.convertJsonToWhere(queryOptions.where ?? {});
    deleteOptions.where = SyncHelper.convertJsonToWhere(deleteOptions.where ?? {});

    if (typeof lastQueryDate === "string"){
        lastQueryDate = new Date(lastQueryDate);
    }

    const lastQueryString = lastQueryDate ?  DateHelper.strftime("%Y-%m-%d %H:%M:%S", lastQueryDate) : undefined;

    if (lastQueryDate && !("relations" in queryOptions)) {
        if (Array.isArray(queryOptions.where)) {
            queryOptions.where.forEach((orCondition) => (orCondition.updatedAt = MoreThan(lastQueryString)));
        } else {
            queryOptions.where.updatedAt = MoreThan(lastQueryString);
        }
    }

    const compareOperator = lastQueryString ? MoreThan(lastQueryString) : Not(IsNull());
    if (Array.isArray(deleteOptions.where)) {
        deleteOptions.where.forEach((orCondition) => (orCondition.deletedAt = compareOperator));
    } else {
        deleteOptions.where.deletedAt = compareOperator;
    }

    deleteOptions.withDeleted = true;
    deleteOptions.select = ['id'];

    const model = Database.getModelForId(modelId);
    const newLastQueryDate = new Date();
    const repository = await waitForSyncRepository(model);

    const entityPromise = syncOne ? repository.findOne(queryOptions as FindOneOptions).then(entity => entity ? [entity] : []) : repository.find(queryOptions as FindManyOptions);
    const deletedPromise = syncOne ? repository.findOne(deleteOptions as FindOneOptions).then(entity => entity ? [entity] : []) : repository.find(deleteOptions as FindManyOptions);

    const entities = await entityPromise;
    const deleted = (await deletedPromise).map((m) => m.id);
    const {syncContainer} = SyncHelper.toServerResult(entities);

    if (lastQueryDate && ("relations" in queryOptions)){
        SyncHelper.removeOlderEntities(syncContainer, lastQueryDate);
    }

    return {
        lastQueryDate: newLastQueryDate,
        deleted,
        syncContainer,
    };
}
