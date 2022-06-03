async function execTest(name) {
    return browser.executeAsync(async (name, done) => {
        while (!window.initPromise) {
            await new Promise(r => setTimeout(r, 50));
        }
        await window.initPromise;
        window.runner.run(name).then(done);
    }, name);
}

async function test(name, cb) {
    it(name, async function () {
        const result = await execTest("cleanSyncTest");

        expect(result.success).toEqual(true);
        expect(result.reason).toEqual(undefined);
        expect(result.error).toEqual(undefined);

        if (cb){
            await cb();
        }
    });
}

module.exports = {
    execTest,
    test
}
