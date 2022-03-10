"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const typeorm_1 = require("typeorm");
class Database {
    constructor(options) {
        if (options.isClient === undefined) {
            options.isClient = options.serverUrl !== undefined;
        }
        this.options = options;
    }
    static init(options) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("-- before init");
            if (!this.instance) {
                this.instance = new Database(options);
                yield this.instance.connect();
            }
            console.log("-- after connect");
            return this.instance;
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("-- in connect");
            this.options.entities.forEach(entity => entity.setDatabase(this));
            console.log("-- middle connect");
            this.connection = yield (0, typeorm_1.createConnection)(this.options);
            console.log("-- after connect");
        });
    }
    getConnection() {
        return this.connection;
    }
    isClientDatabase() {
        console.log("LOG Database is Client?", this.options.isClient);
        return this.options.isClient === true;
    }
    isServerDatabase() {
        return !this.isClientDatabase();
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map