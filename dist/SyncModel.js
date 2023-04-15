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
exports.SyncModel = void 0;
const typeorm_1 = require("typeorm");
const PrimaryServerGeneratedColumn_1 = require("./decorators/PrimaryServerGeneratedColumn");
const ServerVersionColumn_1 = require("./decorators/ServerVersionColumn");
class SyncModel {
}
__decorate([
    (0, PrimaryServerGeneratedColumn_1.PrimaryServerGeneratedColumn)(),
    __metadata("design:type", Number)
], SyncModel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], SyncModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], SyncModel.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], SyncModel.prototype, "deletedAt", void 0);
__decorate([
    (0, ServerVersionColumn_1.ServerVersionColumn)(),
    __metadata("design:type", Number)
], SyncModel.prototype, "version", void 0);
exports.SyncModel = SyncModel;
//# sourceMappingURL=SyncModel.js.map