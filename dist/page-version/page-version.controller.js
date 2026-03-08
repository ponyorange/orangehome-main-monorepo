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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageVersionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const page_version_service_1 = require("./page-version.service");
const create_page_version_dto_1 = require("./dto/create-page-version.dto");
let PageVersionController = class PageVersionController {
    pageVersionService;
    constructor(pageVersionService) {
        this.pageVersionService = pageVersionService;
    }
    create(createPageVersionDto) {
        return this.pageVersionService.create(createPageVersionDto);
    }
    findAll(pageId) {
        return this.pageVersionService.findAll(pageId);
    }
    findOne(id) {
        return this.pageVersionService.findOne(id);
    }
    publish(id) {
        return this.pageVersionService.publish(id);
    }
    rollback(pageId, versionId) {
        return this.pageVersionService.rollback(pageId, versionId);
    }
    remove(id) {
        return this.pageVersionService.remove(id);
    }
};
exports.PageVersionController = PageVersionController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new page version' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_version_dto_1.CreatePageVersionDto]),
    __metadata("design:returntype", void 0)
], PageVersionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get version list for page' }),
    (0, swagger_1.ApiQuery)({ name: 'pageId', description: 'Page ID to get versions for' }),
    __param(0, (0, common_1.Query)('pageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PageVersionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get page version details by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PageVersionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish page version' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PageVersionController.prototype, "publish", null);
__decorate([
    (0, common_1.Put)('/page/:pageId/rollback/:versionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback page to specific version' }),
    __param(0, (0, common_1.Param)('pageId')),
    __param(1, (0, common_1.Param)('versionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PageVersionController.prototype, "rollback", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete page version' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PageVersionController.prototype, "remove", null);
exports.PageVersionController = PageVersionController = __decorate([
    (0, swagger_1.ApiTags)('Page Version Management Module'),
    (0, common_1.Controller)('page-version'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [page_version_service_1.PageVersionService])
], PageVersionController);
//# sourceMappingURL=page-version.controller.js.map