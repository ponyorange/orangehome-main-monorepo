export default () => ({
  coreGrpcUrl: process.env.CORE_SERVICE_GRPC_URL ?? '',
  coreGrpcJwt: process.env.CORE_SERVICE_GRPC_JWT ?? '',
  runtimeSiteName: process.env.RUNTIME_SITE_NAME ?? 'OrangeHome',
  releaseCacheMaxAge: Number(process.env.RUNTIME_RELEASE_MAX_AGE ?? 60),
  releaseCacheStaleWhileRevalidate: Number(
    process.env.RUNTIME_RELEASE_SWR ?? 300,
  ),
  coreGrpcUseSsl: process.env.CORE_SERVICE_GRPC_USE_SSL === 'true',
});
