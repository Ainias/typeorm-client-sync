import { SyncContainer, SyncHelper } from '../Sync/SyncHelper';

export async function persistFromClient(entityId: number, modelId: number, syncContainer: SyncContainer) {
    try {
        const modelContainer = SyncHelper.convertToModelContainer(syncContainer);
        const model = modelContainer[entityId][modelId];
        await model.save();

        return SyncHelper.convertToSyncContainer(modelContainer);
    } catch (e) {
        console.error(e);
        throw e;
    }
}
