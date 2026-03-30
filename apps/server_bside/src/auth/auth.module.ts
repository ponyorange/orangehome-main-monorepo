import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordTransportCryptoService } from './password-transport-crypto.service';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordTransportCryptoService],
  exports: [AuthService, PasswordTransportCryptoService],
})
export class AuthModule {}
