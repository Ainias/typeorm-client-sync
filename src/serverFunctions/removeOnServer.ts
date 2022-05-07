import { Database } from '../Database';
import {waitForSyncRepository} from "../Repository/SyncRepository";

export async function removeOnServer(modelId: number, entityId: number) {
    const entity = Database.getModelForId(modelId);
    const repository = await waitForSyncRepository(entity);
    await repository.softDelete(entityId);
    return true;
}
