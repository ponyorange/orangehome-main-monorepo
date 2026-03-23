import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join, dirname } from 'path';

/**
 * gRPC 客户端延迟初始化：未配置环境变量时仍可启动应用（如只测 /health），
 * 首次调用 core 时再校验并建连。
 */
export type CoreGrpcTaggedError = grpc.ServiceError & { coreRpc?: string };

@Injectable()
export class CoreGrpcClientService {
  private readonly logger = new Logger(CoreGrpcClientService.name);
  private pageStub!: grpc.Client;
  private pageVersionStub!: grpc.Client;
  private materialStub!: grpc.Client;
  private jwt!: string;
  private stubsReady = false;

  constructor(private readonly config: ConfigService) {}

  private ensureStubs(): void {
    if (this.stubsReady) return;

    const url = this.config.get<string>('coreGrpcUrl')?.trim();
    const jwt = this.config.get<string>('coreGrpcJwt')?.trim();
    if (!url || !jwt) {
      throw new Error(
        '缺少 core gRPC 配置：请在环境变量或 .env 中设置 CORE_SERVICE_GRPC_URL 与 CORE_SERVICE_GRPC_JWT（非空），参见 apps/server_cside/.env.example',
      );
    }
    this.jwt = jwt;

    const protoPath = join(__dirname, '../../proto/core.proto');
    const googleRoot = dirname(
      require.resolve('google-proto-files/package.json'),
    );
    const packageDefinition = protoLoader.loadSync(protoPath, {
      includeDirs: [googleRoot, dirname(protoPath)],
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    const core = proto.orangehome?.core;
    if (!core) {
      throw new Error('Failed to load gRPC package orangehome.core');
    }

    const creds = this.config.get<boolean>('coreGrpcUseSsl')
      ? grpc.credentials.createSsl()
      : grpc.credentials.createInsecure();

    const CtorPage = core.PageService as typeof grpc.Client;
    const CtorPageVersion = core.PageVersionService as typeof grpc.Client;
    const CtorMaterial = core.MaterialService as typeof grpc.Client;

    this.pageStub = new CtorPage(url, creds);
    this.pageVersionStub = new CtorPageVersion(url, creds);
    this.materialStub = new CtorMaterial(url, creds);
    this.stubsReady = true;
  }

  private meta(): grpc.Metadata {
    const m = new grpc.Metadata();
    m.add('authorization', `Bearer ${this.jwt}`);
    return m;
  }

  /** 须在 ensureStubs() 之后取 stub：禁止把未初始化的 this.pageStub 等提前传入闭包 */
  private promisify<TReq, TRes>(
    pickStub: () => grpc.Client,
    method: string,
    request: TReq,
    /** 日志 / 异常过滤用：完整 RPC 名，如 PageService.getPage */
    rpcLabel: string,
  ): Promise<TRes> {
    this.ensureStubs();
    const stub = pickStub();
    return new Promise((resolve, reject) => {
      const fn = (stub as any)[method];
      if (typeof fn !== 'function') {
        reject(new Error(`gRPC method not found: ${method}`));
        return;
      }
      fn.call(stub, request, this.meta(), (err: grpc.ServiceError | null, res: TRes) => {
        if (err) {
          const tagged = Object.assign(err, { coreRpc: rpcLabel }) as CoreGrpcTaggedError;
          this.logger.warn({
            msg: 'core.grpc.rpcFailed',
            coreRpc: rpcLabel,
            code: tagged.code,
            details: tagged.details,
          });
          reject(tagged);
          return;
        }
        resolve(res);
      });
    });
  }

  getPage(id: string): Promise<any> {
    return this.promisify(
      () => this.pageStub,
      'getPage',
      {
        id,
        withDeleted: false,
      },
      'PageService.getPage',
    );
  }

  getLatestPageVersionByStatus(
    pageId: string,
    versionStatus: number,
  ): Promise<any> {
    return this.promisify(
      () => this.pageVersionStub,
      'getLatestPageVersionByStatus',
      {
        pageId,
        versionStatus,
      },
      'PageVersionService.getLatestPageVersionByStatus',
    );
  }

  getMaterialsWithLatestVersion(
    materialUids: string[],
    /** 与 proto `repeated int32 version_status` 对应，grpc-js 字段名为 camelCase */
    versionStatus: number[],
  ): Promise<any> {
    return this.promisify(
      () => this.materialStub,
      'getMaterialsWithLatestVersion',
      {
        materialUids,
        versionStatus,
      },
      'MaterialService.getMaterialsWithLatestVersion',
    );
  }
}
