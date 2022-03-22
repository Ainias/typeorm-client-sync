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
const Database_1 = require("./Database");
const SyncHelper_1 = require("./Sync/SyncHelper");
const ServerBeforeUpdate_1 = require("./decorators/ServerBeforeUpdate");
const ServerBeforeInsert_1 = require("./decorators/ServerBeforeInsert");
const LastQueryDate_1 = require("./LastSyncDate/LastQueryDate");
class SyncEntity extends typeorm_1.BaseEntity {
    static getFieldDefinitions() {
        const bases = [this];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let currentBase = this;
        while (currentBase.prototype) {
            currentBase = Object.getPrototypeOf(currentBase);
            bases.push(currentBase);
        }
        const columnDefinitions = (0, typeorm_1.getMetadataArgsStorage)().columns.filter((c) => bases.indexOf(c.target) !== -1);
        const relationDefinitions = (0, typeorm_1.getMetadataArgsStorage)().relations.filter((c) => bases.indexOf(c.target) !== -1);
        return { columnDefinitions, relationDefinitions };
    }
    static find(options) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete },
            find: { get: () => super.find }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (Database_1.Database.getInstance().isClientDatabase() && !(options === null || options === void 0 ? void 0 : options.clientOnly)) {
                const relevantSyncOptions = {
                    where: options === null || options === void 0 ? void 0 : options.where,
                    relations: options === null || options === void 0 ? void 0 : options.relations,
                    skip: options === null || options === void 0 ? void 0 : options.skip,
                    take: options === null || options === void 0 ? void 0 : options.take,
                };
                if ((options === null || options === void 0 ? void 0 : options.skip) || (options === null || options === void 0 ? void 0 : options.take)) {
                    relevantSyncOptions.order = options === null || options === void 0 ? void 0 : options.order;
                }
                let lastQueryDate = yield LastQueryDate_1.LastQueryDate.findOne({ where: { query: JSON.stringify(relevantSyncOptions) } });
                if (!lastQueryDate) {
                    lastQueryDate = new LastQueryDate_1.LastQueryDate();
                    lastQueryDate.query = JSON.stringify(relevantSyncOptions);
                }
                const entityId = Database_1.Database.getInstance().getEntityIdFor(this);
                const result = yield Database_1.Database.getInstance().queryServer(entityId, lastQueryDate.lastQueried, relevantSyncOptions);
                if (result.success === true) {
                    if (result.deleted.length > 0) {
                        // debugger;
                        const deleted = yield _super.delete.call(this, result.deleted);
                        // debugger;
                        console.log('LOG-d deleted', deleted);
                    }
                    const modelContainer = SyncHelper_1.SyncHelper.convertToModelContainer(result.syncContainer);
                    const savePromises = [];
                    Object.entries(modelContainer).forEach(([queriedEntityId, modelMap]) => {
                        const entity = Database_1.Database.getInstance().getEntityForId(Number(queriedEntityId));
                        savePromises.push(entity.save(Object.values(modelMap)));
                    });
                    lastQueryDate.lastQueried = new Date(result.lastQueryDate);
                    yield Promise.all(savePromises);
                    yield lastQueryDate.save();
                }
                else {
                    throw new Error(result.error.message);
                }
            }
            return _super.find.call(this, options);
        });
    }
    updateCreatedAt() {
        this.createdAt = new Date();
    }
    updateUpdatedAt() {
        this.updatedAt = new Date();
    }
    save(options) {
        const _super = Object.create(null, {
            save: { get: () => super.save }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (Database_1.Database.getInstance().isClientDatabase() && !(options === null || options === void 0 ? void 0 : options.clientOnly)) {
                const modelContainer = {};
                SyncHelper_1.SyncHelper.addToModelContainer(this, modelContainer);
                const syncContainer = SyncHelper_1.SyncHelper.convertToSyncContainer(modelContainer);
                const entityId = Database_1.Database.getInstance().getEntityIdFor(this);
                const result = yield Database_1.Database.getInstance().persistToServer(entityId, this.id, syncContainer);
                if (result.success === true) {
                    SyncHelper_1.SyncHelper.updateModelContainer(modelContainer, result.syncContainer);
                }
                else {
                    throw new Error(result.error.message);
                }
            }
            return _super.save.call(this, options);
        });
    }
    remove(options) {
        const _super = Object.create(null, {
            remove: { get: () => super.remove }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (Database_1.Database.getInstance().isClientDatabase() && !(options === null || options === void 0 ? void 0 : options.clientOnly)) {
                const entityId = Database_1.Database.getInstance().getEntityIdFor(this);
                const result = yield Database_1.Database.getInstance().removeFromServer(entityId, this.id);
                if (result.success === false) {
                    throw new Error(result.error.message);
                }
            }
            return _super.remove.call(this, options);
        });
    }
    setColumns(columns) {
        Object.assign(this, columns);
        return this;
    }
}
__decorate([
    (0, PrimaryServerGeneratedColumn_1.PrimaryServerGeneratedColumn)(),
    __metadata("design:type", Number)
], SyncEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], SyncEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], SyncEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], SyncEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, ServerBeforeInsert_1.ServerBeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SyncEntity.prototype, "updateCreatedAt", null);
__decorate([
    (0, ServerBeforeInsert_1.ServerBeforeInsert)(),
    (0, ServerBeforeUpdate_1.ServerBeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SyncEntity.prototype, "updateUpdatedAt", null);
exports.SyncEntity = SyncEntity;
//# sourceMappingURL=SyncEntity.js.map