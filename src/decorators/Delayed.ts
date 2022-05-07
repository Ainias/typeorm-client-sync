import {Database} from "../Database";

export function Delayed<T extends any[]>(decorator: (...args: T) => PropertyDecorator, optionsGenerator: () => T) {
    return function inner(object: T, propertyName: string) {
        Database.addDecoratorHandler(() => {
            decorator(...optionsGenerator())(object, propertyName);
        });
    };
}
