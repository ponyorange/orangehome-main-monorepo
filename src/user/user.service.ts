import { Injectable } from '@nestjs/common';
import { CoreService } from '../core-service/core-service.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(private coreService: CoreService) {}

  async register(registerDto: RegisterDto) {
    return this.coreService.post('/auth/register', registerDto);
  }

  async login(loginDto: LoginDto) {
    return this.coreService.post('/auth/login', loginDto);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    return this.coreService.put(`/user/${userId}/password`, changePasswordDto);
  }

  async getProfile(userId: string) {
    return this.coreService.get(`/user/${userId}`);
  }
}
