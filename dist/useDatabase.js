"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDatabase = void 0;
const react_1 = require("react");
const Database_1 = require("./Database");
function useDatabase(executor, dependencies = []) {
    const [value, setValue] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        Database_1.Database.waitForInstance().then(executor).then(setValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
    return value;
}
exports.useDatabase = useDatabase;
//# sourceMappingURL=useDatabase.js.map