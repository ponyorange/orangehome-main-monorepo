import { create } from 'zustand';
import type { ISchema } from '../../types/base';
import { generateIdWithPrefix } from '../../utils/id';
import { historyService } from '../../extensions/undo-redo/services/HistoryService';

const createText = (name: string, text: string, style: Record<string, unknown> = {}): ISchema => ({
  id: generateIdWithPrefix('text'),
  name,
  type: 'Text',
  children: [],
  props: {
    text,
    style,
  },
});

const createImage = (name: string, src: string, style: Record<string, unknown> = {}, alt = name): ISchema => ({
  id: generateIdWithPrefix('img'),
  name,
  type: 'Image',
  children: [],
  props: {
    src,
    alt,
    style,
  },
});

const createButton = (name: string, text: string, style: Record<string, unknown> = {}): ISchema => ({
  id: generateIdWithPrefix('btn'),
  name,
  type: 'Button',
  children: [],
  props: {
    text,
    style,
  },
});

const createContainer = (name: string, children: ISchema[], style: Record<string, unknown> = {}): ISchema => ({
  id: generateIdWithPrefix('container'),
  name,
  type: 'Container',
  children,
  props: {
    style,
  },
});

/** 默认示例 Schema */
const createDemoSchema = (): ISchema => ({
  id: generateIdWithPrefix('root'),
  name: '根节点',
  type: 'Container',
  children: [
    createContainer(
      '欢迎首屏',
      [
        createText('顶部标签', 'NEW ERA MOBILE EXPERIENCE', {
          display: 'inline-block',
          padding: '6px 12px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          color: '#6b2dff',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(8px)',
        }),
        createText('欢迎标题', '把灵感拖进画布，5 分钟搭出你的手机官网', {
          marginTop: 16,
          fontSize: 30,
          lineHeight: 1.35,
          fontWeight: 800,
          color: '#1b1140',
        }),
        createText('欢迎描述', 'Orange Editor 为活动页、品牌页和营销页提供可视化搭建体验，让设计、运营和产品像拼积木一样完成上线。', {
          marginTop: 12,
          fontSize: 14,
          lineHeight: 1.8,
          color: 'rgba(27,17,64,0.72)',
        }),
        createContainer(
          '按钮区',
          [
            createButton('开始搭建', '立即开始', {
              width: 140,
              height: 44,
              border: 'none',
              borderRadius: 22,
              background: 'linear-gradient(135deg, #ff7a59 0%, #ff3d81 100%)',
              boxShadow: '0 12px 24px rgba(255, 77, 129, 0.28)',
              fontWeight: 700,
            }),
            createButton('查看案例', '查看案例', {
              width: 140,
              height: 44,
              marginLeft: 12,
              borderRadius: 22,
              border: '1px solid rgba(27,17,64,0.12)',
              background: 'rgba(255,255,255,0.78)',
              color: '#1b1140',
              boxShadow: '0 8px 20px rgba(89, 60, 155, 0.08)',
              fontWeight: 700,
            }),
          ],
          {
            display: 'flex',
            alignItems: 'center',
            marginTop: 20,
          }
        ),
        createImage(
          '主视觉插图',
          'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
          {
            width: '100%',
            height: 220,
            marginTop: 24,
            objectFit: 'cover',
            borderRadius: 28,
            boxShadow: '0 20px 40px rgba(91, 58, 180, 0.24)',
          },
          '移动端官网主视觉'
        ),
        createContainer(
          '数据卡片区',
          [
            createContainer(
              '卡片一',
              [
                createText('数字一', '1200+', {
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#1b1140',
                }),
                createText('标签一', '品牌模板', {
                  marginTop: 6,
                  fontSize: 12,
                  color: 'rgba(27,17,64,0.65)',
                }),
              ],
              {
                flex: 1,
                padding: 14,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.75)',
                boxShadow: '0 10px 24px rgba(91,58,180,0.10)',
                backdropFilter: 'blur(10px)',
              }
            ),
            createContainer(
              '卡片二',
              [
                createText('数字二', '89%', {
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#1b1140',
                }),
                createText('标签二', '搭建效率提升', {
                  marginTop: 6,
                  fontSize: 12,
                  color: 'rgba(27,17,64,0.65)',
                }),
              ],
              {
                flex: 1,
                padding: 14,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.75)',
                boxShadow: '0 10px 24px rgba(91,58,180,0.10)',
                backdropFilter: 'blur(10px)',
              }
            ),
            createContainer(
              '卡片三',
              [
                createText('数字三', '24h', {
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#1b1140',
                }),
                createText('标签三', '极速上线', {
                  marginTop: 6,
                  fontSize: 12,
                  color: 'rgba(27,17,64,0.65)',
                }),
              ],
              {
                flex: 1,
                padding: 14,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.75)',
                boxShadow: '0 10px 24px rgba(91,58,180,0.10)',
                backdropFilter: 'blur(10px)',
              }
            ),
          ],
          {
            display: 'flex',
            gap: 10,
            marginTop: 18,
          }
        ),
      ],
      {
        margin: '0 16px',
        padding: '22px 18px 20px',
        borderRadius: 32,
        background: 'linear-gradient(135deg, #ffe3f5 0%, #e9ddff 45%, #dff5ff 100%)',
        boxShadow: '0 20px 60px rgba(83, 48, 186, 0.16)',
        overflow: 'hidden',
      }
    ),
    createContainer(
      '能力亮点',
      [
        createText('区块标题', '为什么品牌团队都在用它', {
          fontSize: 24,
          lineHeight: 1.45,
          fontWeight: 800,
          color: '#181818',
        }),
        createText('区块说明', '从页面结构、配色素材到转化组件，整套体验都为移动端增长场景而生。', {
          marginTop: 10,
          fontSize: 14,
          lineHeight: 1.75,
          color: '#667085',
        }),
        createContainer(
          '能力卡一',
          [
            createText('能力标题一', '沉浸式视觉', {
              fontSize: 18,
              fontWeight: 800,
              color: '#101828',
            }),
            createText('能力描述一', '大图、渐变、卡片分层和按钮动线一次搭好，让手机页面看起来更像成熟品牌官网。', {
              marginTop: 8,
              fontSize: 13,
              lineHeight: 1.8,
              color: '#667085',
            }),
          ],
          {
            marginTop: 18,
            padding: 18,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #fff6d9 0%, #fff1f1 100%)',
            boxShadow: '0 12px 28px rgba(255, 153, 102, 0.12)',
          }
        ),
        createContainer(
          '能力卡二',
          [
            createText('能力标题二', '搭建像排版一样简单', {
              fontSize: 18,
              fontWeight: 800,
              color: '#101828',
            }),
            createText('能力描述二', '拖拽、对齐、图层和属性面板全部围绕可视化设计，非研发也能快速上手。', {
              marginTop: 8,
              fontSize: 13,
              lineHeight: 1.8,
              color: '#667085',
            }),
          ],
          {
            marginTop: 12,
            padding: 18,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #eef7ff 0%, #f3eeff 100%)',
            boxShadow: '0 12px 28px rgba(111, 147, 255, 0.12)',
          }
        ),
        createContainer(
          '能力卡三',
          [
            createText('能力标题三', '为转化而设计', {
              fontSize: 18,
              fontWeight: 800,
              color: '#101828',
            }),
            createText('能力描述三', 'CTA、卖点、用户证言与视觉焦点自然串联，帮助欢迎页从好看走向有效。', {
              marginTop: 8,
              fontSize: 13,
              lineHeight: 1.8,
              color: '#667085',
            }),
          ],
          {
            marginTop: 12,
            padding: 18,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #e8fff7 0%, #f5ffea 100%)',
            boxShadow: '0 12px 28px rgba(68, 196, 141, 0.12)',
          }
        ),
      ],
      {
        margin: '18px 16px 0',
        padding: 22,
        borderRadius: 30,
        background: '#ffffff',
        boxShadow: '0 16px 40px rgba(16,24,40,0.08)',
      }
    ),
    createContainer(
      '场景展示',
      [
        createText('场景标题', '图文并茂的移动端表达', {
          fontSize: 24,
          lineHeight: 1.45,
          fontWeight: 800,
          color: '#ffffff',
        }),
        createText('场景描述', '你可以把它当成品牌欢迎页、活动引导页，或是新产品发布页的默认起点。', {
          marginTop: 10,
          fontSize: 14,
          lineHeight: 1.75,
          color: 'rgba(255,255,255,0.78)',
        }),
        createImage(
          '场景配图一',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
          {
            width: '100%',
            height: 170,
            marginTop: 20,
            objectFit: 'cover',
            borderRadius: 24,
          },
          '团队协作场景'
        ),
        createContainer(
          '场景文案一',
          [
            createText('场景文案标题一', '适合产品、品牌、活动三类页面统一出稿', {
              fontSize: 18,
              fontWeight: 700,
              color: '#ffffff',
            }),
            createText('场景文案描述一', '默认页已经预留大图、数字区块和卖点区块，稍改文案和图片就能变成可交付方案。', {
              marginTop: 8,
              fontSize: 13,
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.72)',
            }),
          ],
          {
            marginTop: 14,
          }
        ),
        createImage(
          '场景配图二',
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
          {
            width: '100%',
            height: 170,
            marginTop: 18,
            objectFit: 'cover',
            borderRadius: 24,
          },
          '设计工作台场景'
        ),
      ],
      {
        margin: '18px 16px 0',
        padding: 22,
        borderRadius: 30,
        background: 'linear-gradient(135deg, #18122b 0%, #2d1f62 52%, #4729a8 100%)',
        boxShadow: '0 18px 42px rgba(71, 41, 168, 0.24)',
      }
    ),
    createContainer(
      '底部行动区',
      [
        createText('底部标题', '从这张欢迎页开始，继续搭你的下一张爆款页面', {
          fontSize: 22,
          lineHeight: 1.5,
          fontWeight: 800,
          color: '#0f172a',
          textAlign: 'center',
        }),
        createText('底部描述', '保留这套视觉框架，替换品牌色、文案和素材，就能快速生成属于你的手机版 H5 官网。', {
          marginTop: 10,
          fontSize: 14,
          lineHeight: 1.8,
          color: '#667085',
          textAlign: 'center',
        }),
        createButton('底部按钮', '开始自定义', {
          width: '100%',
          height: 48,
          marginTop: 18,
          border: 'none',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
          boxShadow: '0 14px 28px rgba(124, 58, 237, 0.25)',
          fontWeight: 700,
        }),
      ],
      {
        margin: '18px 16px 24px',
        padding: 22,
        borderRadius: 30,
        background: '#ffffff',
        boxShadow: '0 16px 40px rgba(16,24,40,0.08)',
      }
    ),
  ],
  props: {
    style: {
      width: '100%',
      minHeight: '100%',
      boxSizing: 'border-box',
      padding: '20px 0 32px',
      background: 'linear-gradient(180deg, #fff6fb 0%, #f6f7ff 42%, #fffdf8 100%)',
    },
  },
});

interface SchemaState {
  schema: ISchema;
  canUndo: boolean;
  canRedo: boolean;
  setSchema: (schema: ISchema, options?: { record?: boolean }) => void;
  undo: () => void;
  redo: () => void;
}

const initialSchema = createDemoSchema();
historyService.init(initialSchema);

export const useSchemaStore = create<SchemaState>((set) => ({
  schema: initialSchema,
  canUndo: historyService.canUndo(),
  canRedo: historyService.canRedo(),
  setSchema: (schema, options) => {
    if (options?.record !== false) {
      historyService.record(schema);
    }

    set({
      schema,
      canUndo: historyService.canUndo(),
      canRedo: historyService.canRedo(),
    });
  },
  undo: () => {
    const previous = historyService.undo();
    if (!previous) return;

    set({
      schema: previous,
      canUndo: historyService.canUndo(),
      canRedo: historyService.canRedo(),
    });
  },
  redo: () => {
    const next = historyService.redo();
    if (!next) return;

    set({
      schema: next,
      canUndo: historyService.canUndo(),
      canRedo: historyService.canRedo(),
    });
  },
}));
