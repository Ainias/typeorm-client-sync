import { Database } from '../Database';
import { getRepository } from 'typeorm';

export async function removeOnServer(entityId: number, modelId: number) {
    const entity = Database.getInstance().getEntityForId(entityId);
    const repository = getRepository(entity);
    await repository.softDelete(modelId);
    return true;
}
