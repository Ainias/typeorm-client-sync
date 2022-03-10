"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.SyncEntity = void 0;
const typeorm_1 = require("typeorm");
const PrimaryServerGeneratedColumn_1 = require("./decorators/PrimaryServerGeneratedColumn");
const js_helper_1 = require("js-helper");
class SyncEntity extends typeorm_1.BaseEntity {
    static setDatabase(database) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("-- set Database");
            this.database = database;
            this.databaseInitPromise.resolve();
            yield Promise.all(this.decoratorPromises);
        });
    }
    static isServer() {
        var _a;
        return (_a = this.database) === null || _a === void 0 ? void 0 : _a.isServerDatabase();
    }
    static addDecoratorHandler(handler) {
        this.decoratorPromises.push(this.databaseInitPromise.then(handler));
    }
}
SyncEntity.databaseInitPromise = new js_helper_1.PromiseWithHandlers();
SyncEntity.decoratorPromises = [];
__decorate([
    (0, PrimaryServerGeneratedColumn_1.PrimaryServerGeneratedColumn)(),
    __metadata("design:type", Number)
], SyncEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SyncEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SyncEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], SyncEntity.prototype, "deletedAt", void 0);
exports.SyncEntity = SyncEntity;
//# sourceMappingURL=SyncEntity.js.map