import {  SyncHelper } from '../Sync/SyncHelper';
import {waitForSyncRepository} from "../Repository/SyncRepository";
import {SyncModel} from "../SyncModel";
import {SyncContainer} from "../Sync/SyncTypes";

export async function persistFromClient(modelId: number, entityId: number, syncContainer: SyncContainer) {
    try {
        const entityContainer = SyncHelper.convertToModelContainer(syncContainer);
        const entity = entityContainer[modelId][entityId];
        const repository = await waitForSyncRepository(entity.constructor as typeof SyncModel);
        await repository.save(entity, {reload: true});

        return SyncHelper.convertToSyncContainer(entityContainer);
    } catch (e) {
        console.error(e);
        throw e;
    }
}
