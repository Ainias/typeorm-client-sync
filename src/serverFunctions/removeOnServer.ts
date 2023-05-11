import { Database } from '../Database';
import {waitForSyncRepository} from "../Repository/SyncRepository";

export async function removeOnServer(modelId: number, entityIds: number|number[]) {
    const model = Database.getModelForId(modelId);
    const repository = await waitForSyncRepository(model);
    await repository.softDelete(entityIds);
    return true;
}
