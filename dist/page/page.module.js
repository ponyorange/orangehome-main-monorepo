"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageModule = void 0;
const common_1 = require("@nestjs/common");
const page_controller_1 = require("./page.controller");
const page_service_1 = require("./page.service");
const core_service_module_1 = require("../core-service/core-service.module");
let PageModule = class PageModule {
};
exports.PageModule = PageModule;
exports.PageModule = PageModule = __decorate([
    (0, common_1.Module)({
        imports: [core_service_module_1.CoreServiceModule],
        controllers: [page_controller_1.PageController],
        providers: [page_service_1.PageService],
    })
], PageModule);
//# sourceMappingURL=page.module.js.map