import { useState, useEffect } from 'react';
import { Database } from './Database';

export function useDatabase<T>(executor: (db: Database) => Promise<T>, dependencies: any[] = []) {
    const [value, setValue] = useState<T>();

    useEffect(() => {
        Database.waitForInstance().then(executor).then(setValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return value;
}
