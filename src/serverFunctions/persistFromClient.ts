import { SyncContainer, SyncHelper } from '../Sync/SyncHelper';
import {getSyncRepository} from "../Repository/SyncRepository";
import {SyncModel} from "../SyncModel";

export async function persistFromClient(entityId: number, modelId: number, syncContainer: SyncContainer) {
    try {
        const entityContainer = SyncHelper.convertToModelContainer(syncContainer);
        const entity = entityContainer[entityId][modelId];
        const repository = getSyncRepository(entity.constructor as typeof SyncModel);
        await repository.save(entity, {reload: true});

        return SyncHelper.convertToSyncContainer(entityContainer);
    } catch (e) {
        console.error(e);
        throw e;
    }
}
