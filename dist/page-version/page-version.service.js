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
exports.PageVersionService = void 0;
const common_1 = require("@nestjs/common");
const core_service_service_1 = require("../core-service/core-service.service");
let PageVersionService = class PageVersionService {
    coreService;
    constructor(coreService) {
        this.coreService = coreService;
    }
    async create(createPageVersionDto) {
        return this.coreService.post('/page-version', createPageVersionDto);
    }
    async findAll(pageId) {
        return this.coreService.get(`/page-version?pageId=${pageId}`);
    }
    async findOne(id) {
        return this.coreService.get(`/page-version/${id}`);
    }
    async publish(id) {
        return this.coreService.put(`/page-version/${id}/publish`);
    }
    async rollback(pageId, versionId) {
        return this.coreService.put(`/page/${pageId}/rollback/${versionId}`);
    }
    async remove(id) {
        return this.coreService.delete(`/page-version/${id}`);
    }
};
exports.PageVersionService = PageVersionService;
exports.PageVersionService = PageVersionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_service_service_1.CoreService])
], PageVersionService);
//# sourceMappingURL=page-version.service.js.map