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
exports.PageService = void 0;
const common_1 = require("@nestjs/common");
const core_service_service_1 = require("../core-service/core-service.service");
let PageService = class PageService {
    coreService;
    constructor(coreService) {
        this.coreService = coreService;
    }
    async create(createPageDto) {
        return this.coreService.post('/page', createPageDto);
    }
    async findAll(projectId) {
        return this.coreService.get(`/page?projectId=${projectId}`);
    }
    async findOne(id) {
        return this.coreService.get(`/page/${id}`);
    }
    async update(id, updatePageDto) {
        return this.coreService.put(`/page/${id}`, updatePageDto);
    }
    async remove(id) {
        return this.coreService.delete(`/page/${id}`);
    }
};
exports.PageService = PageService;
exports.PageService = PageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_service_service_1.CoreService])
], PageService);
//# sourceMappingURL=page.service.js.map