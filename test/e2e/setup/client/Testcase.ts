export abstract class Testcase<Result> {
    async before() {

    }

    async after() {

    }

    abstract run(): Promise<Result>|Result

    abstract assert(result: Result): Promise<void>|void

    protected expectTrue(val: boolean, errorMessage?: string) {
        if (val !== true) {
            throw new Error(errorMessage ?? "Value not true, got '" + val + "'");
        }
    }

    protected expectTruthLike<T>(val: T, errorMessage?: string) {
        if (!val) {
            throw new Error(errorMessage ?? "Value not Truth-Like, got '" + val + "'");
        }
    }

    protected expectFalse(val: boolean, errorMessage?: string) {
        if (val !== false) {
            throw new Error(errorMessage ?? "Value not false, got '" + val + "'");
        }
    }

    protected expectFalseLike<T>(val: T, errorMessage?: string) {
        if (val) {
            throw new Error(errorMessage ?? "Value not False-Like, got '" + val + "'");
        }
    }

    protected expectEqual<T>(val: T, expected: T, errorMessage?: string) {
        if (val !== expected) {
            throw new Error(errorMessage ?? "Values not Equal!, got '" + val + "' but expected '" + expected + "'");
        }
    }
}
