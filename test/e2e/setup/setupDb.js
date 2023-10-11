const {generateDb} = require('./setup');

generateDb().then(() => {
    console.log("done");
    process.exit(0);
});
