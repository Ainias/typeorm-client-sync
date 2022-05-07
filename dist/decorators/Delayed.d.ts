export declare function Delayed<T extends any[]>(decorator: (...args: T) => PropertyDecorator, optionsGenerator: () => T): (object: T, propertyName: string) => void;
