import type { SyncError } from './SyncError';
import type { SyncContainer } from '../Sync/SyncHelper';

export type SyncResult<Error extends SyncError> =
    | {
          success: true;
          syncContainer: SyncContainer;
          lastQueryDate: string;
          deleted: number[];
      }
    | { success: false; error: Error };
