export const DEFAULT_PAGE_SCHEMA = {
  id: 'root_q4DDQuSo',
  name: '根节点',
  type: 'Container',
  children: [
    {
      id: 'container_aF7xzmCz',
      name: '欢迎首屏',
      type: 'Container',
      children: [
        {
          id: 'text_DF8Y7OQ2',
          name: '顶部标签',
          type: 'Text',
          children: [],
          props: {
            text: 'NEW ERA MOBILE EXPERIENCE',
            style: {
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: '#6b2dff',
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(8px)',
            },
          },
        },
        {
          id: 'text_Afg_I0aC',
          name: '欢迎标题',
          type: 'Text',
          children: [],
          props: {
            text: '把灵感拖进画布，5 分钟搭出你的手机官网',
            style: {
              marginTop: 16,
              fontSize: 30,
              lineHeight: 1.35,
              fontWeight: 800,
              color: '#1b1140',
            },
          },
        },
        {
          id: 'text_RpsOSb3T',
          name: '欢迎描述',
          type: 'Text',
          children: [],
          props: {
            text: 'Orange Editor 为活动页、品牌页和营销页提供可视化搭建体验，让设计、运营和产品像拼积木一样完成上线。',
            style: {
              marginTop: 12,
              fontSize: 14,
              lineHeight: 1.8,
              color: 'rgba(27,17,64,0.72)',
            },
          },
        },
        {
          id: 'container_ZslSonKM',
          name: '按钮区',
          type: 'Container',
          children: [
            {
              id: 'btn_IVRdPwEZ',
              name: '开始搭建',
              type: 'Button',
              children: [],
              props: {
                text: '立即开始',
                style: {
                  width: 140,
                  height: 44,
                  border: 'none',
                  borderRadius: 22,
                  background: 'linear-gradient(135deg, #ff7a59 0%, #ff3d81 100%)',
                  boxShadow: '0 12px 24px rgba(255, 77, 129, 0.28)',
                  fontWeight: 700,
                },
              },
            },
            {
              id: 'btn_RgifOOHb',
              name: '查看案例',
              type: 'Button',
              children: [],
              props: {
                text: '查看案例',
                style: {
                  width: 140,
                  height: 44,
                  marginLeft: 12,
                  borderRadius: 22,
                  border: '1px solid rgba(27,17,64,0.12)',
                  background: 'rgba(255,255,255,0.78)',
                  color: '#1b1140',
                  boxShadow: '0 8px 20px rgba(89, 60, 155, 0.08)',
                  fontWeight: 700,
                },
              },
            },
          ],
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              marginTop: 20,
            },
          },
        },
        {
          id: 'img_eYK0ryox',
          name: '主视觉插图',
          type: 'Image',
          children: [],
          props: {
            src: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
            alt: '移动端官网主视觉',
            style: {
              width: '100%',
              height: 220,
              marginTop: 24,
              objectFit: 'cover',
              borderRadius: 28,
              boxShadow: '0 20px 40px rgba(91, 58, 180, 0.24)',
            },
          },
        },
        {
          id: 'container_h24hmzjP',
          name: '数据卡片区',
          type: 'Container',
          children: [
            {
              id: 'container_9b3i2YNW',
              name: '卡片一',
              type: 'Container',
              children: [
                {
                  id: 'text_nN4jrji-',
                  name: '数字一',
                  type: 'Text',
                  children: [],
                  props: {
                    text: '1200+',
                    style: {
                      fontSize: 22,
                      fontWeight: 800,
                      color: '#1b1140',
                    },
                  },
                },
                {
                  id: 'text_zeSIT-2r',
                  name: '标签一',
                  type: 'Text',
                  children: [],
                  props: {
                    text: '品牌模板',
                    style: {
                      marginTop: 6,
                      fontSize: 12,
                      color: 'rgba(27,17,64,0.65)',
                    },
                  },
                },
              ],
              props: {
                style: {
                  flex: 1,
                  padding: 14,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.75)',
                  boxShadow: '0 10px 24px rgba(91,58,180,0.10)',
                  backdropFilter: 'blur(10px)',
                },
              },
            },
            {
              id: 'container_VTo2eYob',
              name: '卡片二',
              type: 'Container',
              children: [
                {
                  id: 'text_YsrFli1O',
                  name: '数字二',
                  type: 'Text',
                  children: [],
                  props: {
                    text: '89%',
                    style: {
                      fontSize: 22,
                      fontWeight: 800,
                      color: '#1b1140',
                    },
                  },
                },
                {
                  id: 'text_EdPd5Nb5',
                  name: '标签二',
                  type: 'Text',
                  children: [],
                  props: {
                    text: '搭建效率提升',
                    style: {
                      marginTop: 6,
                      fontSize: 12,
                      color: 'rgba(27,17,64,0.65)',
                    },
                  },
                },
              ],
              props: {
                style: {
                  flex: 1,
                  padding: 14,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.75)',
                  boxShadow: '0 10px 24px rgba(91,58,180,0.10)',
                  backdropFilter: 'blur(10px)',
                },
              },
            },
            {
              id: 'container_Gbvbe7Nk',
              name: '卡片三',
              type: 'Container',
              children: [
                {
                  id: 'text_T-4WxPwu',
                  name: '数字三',
                  type: 'Text',
                  children: [],
                  props: {
                    text: '24h',
                    style: {
                      fontSize: 22,
                      fontWeight: 800,
                      color: '#1b1140',
                    },
                  },
                },
                {
                  id: 'text_b-wfb98t',
                  name: '标签三',
                  type: 'Text',
                  children: [],
                  props: {
                    text: '极速上线',
                    style: {
                      marginTop: 6,
                      fontSize: 12,
                      color: 'rgba(27,17,64,0.65)',
                    },
                  },
                },
              ],
              props: {
                style: {
                  flex: 1,
                  padding: 14,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.75)',
                  boxShadow: '0 10px 24px rgba(91,58,180,0.10)',
                  backdropFilter: 'blur(10px)',
                },
              },
            },
          ],
          props: {
            style: {
              display: 'flex',
              gap: 10,
              marginTop: 18,
            },
          },
        },
      ],
      props: {
        style: {
          margin: '0 16px',
          padding: '22px 18px 20px',
          borderRadius: 32,
          background: 'linear-gradient(135deg, #ffe3f5 0%, #e9ddff 45%, #dff5ff 100%)',
          boxShadow: '0 20px 60px rgba(83, 48, 186, 0.16)',
          overflow: 'hidden',
        },
      },
    },
  ],
  props: {
    style: {
      width: '100%',
      minHeight: '',
      boxSizing: 'border-box',
      padding: '',
      background: 'linear-gradient(180deg, #fff6fb 0%, #f6f7ff 42%, #fffdf8 100%)',
    },
  },
} as const;

export const DEFAULT_PAGE_SCHEMA_JSON = JSON.stringify(DEFAULT_PAGE_SCHEMA);
