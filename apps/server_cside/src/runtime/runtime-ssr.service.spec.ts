import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
import * as ejs from 'ejs';
import { RuntimeSsrService } from './runtime-ssr.service';
import { CoreGrpcClientService } from '../core-grpc/core-grpc-client.service';

jest.mock('ejs', () => ({
  renderFile: jest.fn((_path, _data, cb) => cb(null, '<html>ssr-ok</html>')),
}));

describe('RuntimeSsrService', () => {
  let service: RuntimeSsrService;
  let core: jest.Mocked<
    Pick<
      CoreGrpcClientService,
      'getPage' | 'getLatestPageVersionByStatus' | 'getMaterialsWithLatestVersion'
    >
  >;

  beforeEach(async () => {
    core = {
      getPage: jest.fn(),
      getLatestPageVersionByStatus: jest.fn(),
      getMaterialsWithLatestVersion: jest.fn(),
    };

    const mod = await Test.createTestingModule({
      providers: [
        RuntimeSsrService,
        { provide: CoreGrpcClientService, useValue: core },
        {
          provide: ConfigService,
          useValue: {
            get: (k: string) =>
              k === 'runtimeSiteName' ? 'TestSite' : undefined,
          },
        },
      ],
    }).compile();

    service = mod.get(RuntimeSsrService);
  });

  it('renderPreview: BadGatewayException when material lacks SSR fields', async () => {
    core.getPage.mockResolvedValue({
      data: { title: 'Hello' },
    });
    core.getLatestPageVersionByStatus.mockResolvedValue({
      data: {
        id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        pageSchemaJson: JSON.stringify({ type: 'u1', children: [] }),
      },
    });
    core.getMaterialsWithLatestVersion.mockResolvedValue({
      data: [
        {
          material: { id: 'm1', materialUid: 'u1' },
          latestVersion: {
            fileUrl: 'http://example.com/amd.js',
            fileObjectKey: 'k/a.js',
          },
        },
      ],
    });

    await expect(
      service.renderPreview('507f1f77bcf86cd799439011'),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('renderPreview: 404 when no page', async () => {
    core.getPage.mockResolvedValue({ data: null });

    await expect(
      service.renderPreview('507f1f77bcf86cd799439011'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('renderPreview: renders when SSR URL present', async () => {
    core.getPage.mockResolvedValue({
      data: { title: 'Hi' },
    });
    core.getLatestPageVersionByStatus.mockResolvedValue({
      data: {
        id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        pageSchemaJson: JSON.stringify({ type: 'u1', children: [] }),
      },
    });
    core.getMaterialsWithLatestVersion.mockResolvedValue({
      data: [
        {
          material: { materialUid: 'u1' },
          latestVersion: {
            ssrFileUrl: 'http://example.com/ssr.js',
          },
        },
      ],
    });

    const out = await service.renderPreview('507f1f77bcf86cd799439011');

    expect(out.html).toContain('ssr-ok');
    expect(out.cacheControl).toBe('private, no-store');
    expect(ejs.renderFile).toHaveBeenCalled();
  });
});
