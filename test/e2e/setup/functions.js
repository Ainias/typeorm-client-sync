async function execTest(name) {
    return browser.executeAsync(async (name, done) => {
        while (!window.initPromise) {
            await new Promise(r => setTimeout(r, 50));
        }
        await window.initPromise;
        const result = await window.runner.run(name);
        console.log("LOG-d result", result);
        // await new Promise(r => setTimeout(r, 1000*30));
        done(result)
    }, name);
}

async function test(name, cb) {
    it(name, async function () {
        const result = await execTest(name);

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
