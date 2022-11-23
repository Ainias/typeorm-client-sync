const Service = require('./setup/setup');

const baseUrl = "http://127.0.0.1:3000";

exports.config = {
    isMobile: false,

    runner: 'local',

    // wdio will run your tests using the framework below. You can choose from several,
    // much like the reporters. The full list is at https://www.npmjs.com/search?q=wdio-framework
    framework: 'jasmine',

    // By default, Jasmine times out within 10 seconds. This is not really enough time
    // for us as it takes a while for Appium to get set up.
    jasmineNodeOpts: {
        defaultTimeoutInterval: 90000,
    },

    // How much detail should be logged. The options are:
    // trace | debug | info | warn | error | silent
    logLevel: 'error',

    mysqlConnection: Service.mysqlConnection,

    deprecationWarnings: true,

    bail: 0,

    baseUrl,

    waitForTimeout: 60000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,

    // The reporter is what formats your test results on the command line. 'spec' lists
    // the names of the tests with a tick or X next to them. See
    // https://www.npmjs.com/search?q=wdio-reporter for a full list of reporters.
    reporters: ['spec'],

    // Use the Appium plugin for Webdriver. Without this, we would need to run appium
    // separately on the command line.
    hostname: '127.0.0.1',
    services: [
        'chromedriver',
    ],

    delayFactor: 1,
    hasAlertDialogs: false,

    // Where the files we are testing can be found.
    specs: [
        './test/e2e/specs/*.js',
    ],

    capabilities: [
        {
            browserName: 'chrome',
            maxInstances: 1,
            hostname: '127.0.0.1',
            'goog:chromeOptions': {
                // to run chrome headless the following flags are required
                // (see https://developers.google.com/web/updates/2017/04/headless-chrome)
                // args: ['--headless', '--disable-gpu'],
            },
        },
    ],
    onPrepare: async function (conf, cap) {
        await Service.setup();
    },
    onComplete: async function () {
        await Service.tearDown();
    },

    lastCapability: null,

    before: async function (config, cap, spec) {
    },

    beforeTest: async function () {
        // TODO reset server db
        await browser.url(baseUrl);
    },
};
