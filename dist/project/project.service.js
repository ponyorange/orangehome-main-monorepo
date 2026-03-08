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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const core_service_service_1 = require("../core-service/core-service.service");
let ProjectService = class ProjectService {
    coreService;
    constructor(coreService) {
        this.coreService = coreService;
    }
    async create(createProjectDto) {
        return this.coreService.post('/project', createProjectDto);
    }
    async findAll(userId) {
        return this.coreService.get(`/project?userId=${userId}`);
    }
    async findOne(id) {
        return this.coreService.get(`/project/${id}`);
    }
    async update(id, updateProjectDto) {
        return this.coreService.put(`/project/${id}`, updateProjectDto);
    }
    async remove(id) {
        return this.coreService.delete(`/project/${id}`);
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_service_service_1.CoreService])
], ProjectService);
//# sourceMappingURL=project.service.js.map