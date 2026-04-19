import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
import * as React from 'react';
import * as ejs from 'ejs';
import { RuntimeSsrService } from './runtime-ssr.service';
import { CoreGrpcClientService } from '../core-grpc/core-grpc-client.service';
import { loadSsrComponentRegistry } from './load-ssr-cjs-registry.util';
import {
  MATERIAL_VERSION_STATUSES_DEV,
  MATERIAL_VERSION_STATUSES_RELEASE_ONLY,
} from './material-version-status';

jest.mock('./load-ssr-cjs-registry.util', () => ({
  loadSsrComponentRegistry: jest.fn(),
  resetSsrCjsMemoryCacheForTests: jest.fn(),
}));

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
    (ejs.renderFile as jest.Mock).mockClear();
    (loadSsrComponentRegistry as jest.Mock).mockReset();
    (loadSsrComponentRegistry as jest.Mock).mockResolvedValue({
      u1: function MockU1(props: Record<string, unknown>) {
        return React.createElement(
          'div',
          { 'data-ssr-mock': 'u1', id: props.id as string | undefined },
          props.children as React.ReactNode,
        );
      },
    });

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

  it('renderSsr preview: BadGateway when material lacks SSR fields', async () => {
    core.getPage.mockResolvedValue({
      data: { title: 'Hello' },
    });
    core.getLatestPageVersionByStatus.mockResolvedValue({
      data: {
        id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        pageSchemaJson: JSON.stringify({ id: 'r1', type: 'u1', children: [] }),
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
      service.renderSsr('507f1f77bcf86cd799439011', 'preview'),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(loadSsrComponentRegistry).not.toHaveBeenCalled();
  });

  it('renderSsr preview: 404 when no page', async () => {
    core.getPage.mockResolvedValue({ data: null });

    await expect(
      service.renderSsr('507f1f77bcf86cd799439011', 'preview'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('renderSsr preview: SSR tree + AMD map when SSR URL present', async () => {
    core.getPage.mockResolvedValue({
      data: { title: 'Hi' },
    });
    core.getLatestPageVersionByStatus.mockResolvedValue({
      data: {
        id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        pageSchemaJson: JSON.stringify({ id: 'r1', type: 'u1', children: [] }),
      },
    });
    core.getMaterialsWithLatestVersion.mockResolvedValue({
      data: [
        {
          material: { materialUid: 'u1' },
          latestVersion: {
            fileUrl: 'http://example.com/amd.js',
            ssrFileUrl: 'http://example.com/ssr.cjs',
          },
        },
      ],
    });

    const out = await service.renderSsr('507f1f77bcf86cd799439011', 'preview');

    expect(out.html).toContain('ssr-ok');
    expect(out.cacheControl).toBe('private, no-store');
    expect(ejs.renderFile).toHaveBeenCalled();
    expect(core.getMaterialsWithLatestVersion).toHaveBeenCalledWith(
      ['u1'],
      MATERIAL_VERSION_STATUSES_RELEASE_ONLY,
    );
    expect(loadSsrComponentRegistry).toHaveBeenCalledWith(
      ['u1'],
      { u1: 'http://example.com/ssr.cjs' },
    );
    const renderData = (ejs.renderFile as jest.Mock).mock.calls[0][1] as {
      componentsAmdMap: Record<string, string>;
    };
    expect(renderData.componentsAmdMap).toEqual({
      u1: 'http://example.com/amd.js',
    });
  });

  it('renderSsr dev: getMaterialsWithLatestVersion uses developing+testing+published', async () => {
    core.getPage.mockResolvedValue({
      data: { title: 'Dev' },
    });
    core.getLatestPageVersionByStatus.mockResolvedValue({
      data: {
        id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        pageSchemaJson: JSON.stringify({ id: 'r1', type: 'u1', children: [] }),
      },
    });
    core.getMaterialsWithLatestVersion.mockResolvedValue({
      data: [
        {
          material: { materialUid: 'u1' },
          latestVersion: {
            fileUrl: 'http://example.com/amd-dev.js',
            ssrFileUrl: 'http://example.com/ssr-dev.cjs',
          },
        },
      ],
    });

    await service.renderSsr('507f1f77bcf86cd799439011', 'dev');

    expect(core.getMaterialsWithLatestVersion).toHaveBeenCalledWith(
      ['u1'],
      MATERIAL_VERSION_STATUSES_DEV,
    );
    expect(loadSsrComponentRegistry).toHaveBeenCalledWith(
      ['u1'],
      { u1: 'http://example.com/ssr-dev.cjs' },
    );
  });
});
