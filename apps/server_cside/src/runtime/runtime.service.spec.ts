import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import * as ejs from 'ejs';
import { RuntimeService } from './runtime.service';
import { CoreGrpcClientService } from '../core-grpc/core-grpc-client.service';

jest.mock('ejs', () => ({
  renderFile: jest.fn((_path, _data, cb) => cb(null, '<html>ok</html>')),
}));

describe('RuntimeService', () => {
  let service: RuntimeService;
  let core: jest.Mocked<
    Pick<
      CoreGrpcClientService,
      | 'getPage'
      | 'getLatestPageVersionByStatus'
      | 'getMaterialsWithLatestVersion'
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
        RuntimeService,
        {
          provide: CoreGrpcClientService,
          useValue: core,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (k: string) => {
              if (k === 'runtimeSiteName') return 'TestSite';
              if (k === 'releaseCacheMaxAge') return 60;
              if (k === 'releaseCacheStaleWhileRevalidate') return 300;
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = mod.get(RuntimeService);
  });

  it('release: 404 when GetLatestPageVersionByStatus returns no data', async () => {
    core.getPage.mockResolvedValue({
      data: { title: 'T' },
    });
    core.getLatestPageVersionByStatus.mockResolvedValue({ data: null });

    await expect(
      service.render('release', '507f1f77bcf86cd799439011'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('release: renders HTML and sets public cache when successful', async () => {
    core.getPage.mockResolvedValue({
      data: {
        title: 'Hello',
      },
    });
    core.getLatestPageVersionByStatus.mockResolvedValue({
      data: {
        id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        pageSchemaJson: JSON.stringify({ root: true }),
      },
    });
    core.getMaterialsWithLatestVersion.mockResolvedValue({
      data: [],
    });

    const out = await service.render('release', '507f1f77bcf86cd799439011');

    expect(out.html).toContain('ok');
    expect(out.cacheControl).toContain('public');
    expect(ejs.renderFile).toHaveBeenCalled();
  });

  it('release: fails when material URL missing', async () => {
    core.getPage.mockResolvedValue({
      data: {
        title: 'Hello',
      },
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
          latestVersion: { fileUrl: undefined },
        },
      ],
    });

    await expect(
      service.render('release', '507f1f77bcf86cd799439011'),
    ).rejects.toThrow();
  });
});
