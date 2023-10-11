"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSubscriber = void 0;
/* eslint-disable class-methods-use-this */
const typeorm_1 = require("typeorm");
let ServerSubscriber = class ServerSubscriber {
    updateUpdatedAt(ids, metadata, queryRunner) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, void 0, function* () {
            const [ownerColumn] = metadata.ownerColumns;
            const [inverseColumn] = metadata.inverseColumns;
            if (!ownerColumn || !inverseColumn) {
                return;
            }
            const ownerProperty = (_c = (_b = (_a = ownerColumn.referencedColumn) === null || _a === void 0 ? void 0 : _a.entityMetadata) === null || _b === void 0 ? void 0 : _b.propertiesMap) === null || _c === void 0 ? void 0 : _c.updatedAt;
            const inverseProperty = (_f = (_e = (_d = inverseColumn.referencedColumn) === null || _d === void 0 ? void 0 : _d.entityMetadata) === null || _e === void 0 ? void 0 : _e.propertiesMap) === null || _f === void 0 ? void 0 : _f.updatedAt;
            const ownerTarget = (_h = (_g = ownerColumn.referencedColumn) === null || _g === void 0 ? void 0 : _g.entityMetadata) === null || _h === void 0 ? void 0 : _h.tableName;
            const inverseTarget = (_k = (_j = inverseColumn.referencedColumn) === null || _j === void 0 ? void 0 : _j.entityMetadata) === null || _k === void 0 ? void 0 : _k.tableName;
            const ownerId = ids[ownerColumn.propertyName];
            const inverseId = ids[inverseColumn.propertyName];
            if (!ownerProperty || !inverseProperty || !ownerTarget || !inverseTarget || !ownerId || !inverseId) {
                return;
            }
            // Set version = version to not update version
            yield queryRunner.manager.createQueryBuilder().callListeners(false).update(ownerTarget).set({ [ownerProperty]: new Date(), version: () => "version" }).where("id = :id", { id: ownerId }).execute();
            yield queryRunner.manager.createQueryBuilder().callListeners(false).update(inverseTarget).set({ [inverseProperty]: new Date(), version: () => "version" }).where("id = :id", { id: inverseId }).execute();
        });
    }
    /**
     * Called before post insertion.
     */
    beforeInsert({ entity }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (entity) {
                Reflect.set(entity, "updatedAt", new Date());
                Reflect.set(entity, "createdAt", new Date());
            }
        });
    }
    afterInsert({ entity, metadata, queryRunner }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("LOG-d afterInsert", entity, metadata.isJunction, metadata.tableType, metadata.tableName);
            if (metadata.isJunction && metadata.tableType === "junction" && entity) {
                yield this.updateUpdatedAt(entity, metadata, queryRunner);
            }
        });
    }
    afterRemove({ metadata, entityId, queryRunner }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (metadata.isJunction && metadata.tableType === "junction" && entityId) {
                yield this.updateUpdatedAt(entityId, metadata, queryRunner);
            }
        });
    }
    /**
     * Called before entity update.
     */
    beforeUpdate(event) {
        // To know if an entity has a version number, we check if versionColumn
        // is defined in the metadatas of that entity.
        if (event.metadata.versionColumn && event.entity && event.databaseEntity) {
            // Getting the current version of the requested entity update
            const versionFromUpdate = Reflect.get(event.entity, event.metadata.versionColumn.propertyName);
            // Getting the entity's version from the database
            const versionFromDatabase = event.databaseEntity[event.metadata.versionColumn.propertyName];
            // they should match otherwise someone has changed it underneath us
            if (versionFromDatabase !== versionFromUpdate) {
                throw new typeorm_1.OptimisticLockVersionMismatchError(event.metadata.name, versionFromDatabase, versionFromUpdate);
            }
        }
        if (event.entity) {
            Reflect.set(event.entity, "updatedAt", new Date());
        }
    }
    beforeRemove(_a) {
        var { metadata, entity } = _a, other = __rest(_a, ["metadata", "entity"]);
        if (metadata.tableName === "project_questions_question") {
            debugger;
            console.log(entity, other);
        }
    }
};
ServerSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], ServerSubscriber);
exports.ServerSubscriber = ServerSubscriber;
//# sourceMappingURL=ServerSubscriber.js.map