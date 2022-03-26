import { Database } from '../Database';
import {getSyncRepository} from "../Repository/SyncRepository";

export async function removeOnServer(entityId: number, modelId: number) {
    const entity = Database.getInstance().getModelForId(entityId);
    const repository = getSyncRepository(entity);
    await repository.softDelete(modelId);
    return true;
}
