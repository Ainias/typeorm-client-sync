"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSubscriber = void 0;
/* eslint-disable class-methods-use-this */
const typeorm_1 = require("typeorm");
let ClientSubscriber = class ClientSubscriber {
    /**
     * Called after entity insertion.
     */
    afterInsert(event) {
        console.log(`AFTER ENTITY INSERTED: `, event.entity);
    }
    /**
     * Called after entity update.
     */
    afterUpdate(event) {
        console.log(`AFTER ENTITY UPDATED: `, event.entity);
    }
    /**
     * Called after entity removal.
     */
    afterRemove(event) {
        console.log(`AFTER ENTITY WITH ID ${event.entityId} REMOVED: `, event.entity);
    }
    /**
     * Called after entity removal.
     */
    afterSoftRemove(event) {
        console.log(`AFTER ENTITY WITH ID ${event.entityId} SOFT REMOVED: `, event.entity);
    }
};
ClientSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], ClientSubscriber);
exports.ClientSubscriber = ClientSubscriber;
//# sourceMappingURL=ClientSubscriber.js.map