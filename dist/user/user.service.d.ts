import { CoreService } from '../core-service/core-service.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UserService {
    private coreService;
    constructor(coreService: CoreService);
    register(registerDto: RegisterDto): Promise<any>;
    login(loginDto: LoginDto): Promise<any>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<any>;
    getProfile(userId: string): Promise<any>;
}
