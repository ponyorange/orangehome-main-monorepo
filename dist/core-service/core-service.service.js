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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let CoreService = class CoreService {
    configService;
    axiosInstance;
    constructor(configService) {
        this.configService = configService;
        const coreServiceUrl = this.configService.get('CORE_SERVICE_URL');
        this.axiosInstance = axios_1.default.create({
            baseURL: coreServiceUrl,
            timeout: 10000,
        });
        this.axiosInstance.interceptors.response.use((response) => response, (error) => {
            const status = error.response?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data?.message || error.message || 'Internal server error';
            throw new common_1.HttpException(message, status);
        });
    }
    async request(config) {
        const response = await this.axiosInstance.request(config);
        return response.data;
    }
    async get(url, config) {
        return this.request({ method: 'GET', url, ...config });
    }
    async post(url, data, config) {
        return this.request({ method: 'POST', url, data, ...config });
    }
    async put(url, data, config) {
        return this.request({ method: 'PUT', url, data, ...config });
    }
    async patch(url, data, config) {
        return this.request({ method: 'PATCH', url, data, ...config });
    }
    async delete(url, config) {
        return this.request({ method: 'DELETE', url, ...config });
    }
};
exports.CoreService = CoreService;
exports.CoreService = CoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CoreService);
//# sourceMappingURL=core-service.service.js.map