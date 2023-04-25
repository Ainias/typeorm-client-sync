import {  SyncHelper } from '../Sync/SyncHelper';
import {waitForSyncRepository} from "../Repository/SyncRepository";
import {SyncModel} from "../SyncModel";
import {SyncContainer} from "../Sync/SyncTypes";

export async function persistFromClient(modelId: number, entityId: number, syncContainer: SyncContainer) {
    try {
        const entityContainer = SyncHelper.convertToEntityContainer(syncContainer);
        const entity = entityContainer[modelId][entityId];
        const repository = await waitForSyncRepository(entity.constructor as typeof SyncModel);
        await repository.manager.transaction(async entityManager => {
            await entityManager.save(entity, {reload: true});
        });
        return SyncHelper.convertToSyncContainer(entityContainer);
    } catch (e) {
        console.error(e);
        throw e;
    }
}
