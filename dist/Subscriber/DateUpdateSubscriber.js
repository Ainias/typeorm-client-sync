"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUpdateSubscriber = void 0;
/* eslint-disable class-methods-use-this */
const typeorm_1 = require("typeorm");
const SyncEntity_1 = require("../SyncEntity");
let DateUpdateSubscriber = class DateUpdateSubscriber {
    /**
     * Called before post insertion.
     */
    beforeInsert(event) {
        console.log(`BEFORE POST INSERTED: `, event.entity);
        if (event.entity instanceof SyncEntity_1.SyncEntity) {
            console.log('Change date');
            // event.entity.createdAt = new Date();
        }
    }
    beforeUpdate(event) {
        console.log('BEFORE UPDATE', event.entity);
    }
};
DateUpdateSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], DateUpdateSubscriber);
exports.DateUpdateSubscriber = DateUpdateSubscriber;
//# sourceMappingURL=DateUpdateSubscriber.js.map