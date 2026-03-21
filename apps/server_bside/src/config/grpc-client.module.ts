import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcClientService } from './grpc-client.service';
import { CORE_GRPC_CLIENT } from './grpc-client.constants';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CORE_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'orangehome.core',
            protoPath: join(__dirname, '../../proto/core.proto'),
            url: configService.get<string>('CORE_SERVICE_GRPC_URL') || 'localhost:50051',
          },
        }),
      },
    ]),
  ],
  providers: [GrpcClientService],
  exports: [GrpcClientService],
})
export class GrpcClientModule {}
