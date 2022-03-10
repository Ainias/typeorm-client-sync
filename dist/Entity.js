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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
const typeorm_1 = require("typeorm");
const PrimaryServerGeneratedColumn_1 = require("./decorators/PrimaryServerGeneratedColumn");
class Entity extends typeorm_1.BaseEntity {
    static setDatabase(database) {
        this.database = database;
    }
    static isServer() {
        var _a;
        return (_a = this.database) === null || _a === void 0 ? void 0 : _a.isServerDatabase();
    }
}
__decorate([
    (0, PrimaryServerGeneratedColumn_1.PrimaryServerGeneratedColumn)(),
    __metadata("design:type", Number)
], Entity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Entity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Entity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Entity.prototype, "deletedAt", void 0);
exports.Entity = Entity;
//# sourceMappingURL=Entity.js.map