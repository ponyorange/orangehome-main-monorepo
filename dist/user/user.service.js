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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const core_service_service_1 = require("../core-service/core-service.service");
let UserService = class UserService {
    coreService;
    constructor(coreService) {
        this.coreService = coreService;
    }
    async register(registerDto) {
        return this.coreService.post('/auth/register', registerDto);
    }
    async login(loginDto) {
        return this.coreService.post('/auth/login', loginDto);
    }
    async changePassword(userId, changePasswordDto) {
        return this.coreService.put(`/user/${userId}/password`, changePasswordDto);
    }
    async getProfile(userId) {
        return this.coreService.get(`/user/${userId}`);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_service_service_1.CoreService])
], UserService);
//# sourceMappingURL=user.service.js.map