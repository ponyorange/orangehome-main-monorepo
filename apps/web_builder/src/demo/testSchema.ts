import type { ISchema } from '../types/base';

/** 测试用 Schema：包含 div 和 button 的树 */
export const TEST_SCHEMA: ISchema = {
  id: 'root',
  name: 'Root',
  type: 'div',
  props: { className: 'test-root' },
  children: [
    {
      id: 'header',
      name: 'Header',
      type: 'div',
      props: { style: { padding: '16px', fontSize: '18px', fontWeight: 600 } },
      children: [
        {
          id: 'title',
          name: 'Title',
          type: 'div',
          props: { children: 'Orange Editor 测试' },
        },
      ],
    },
    {
      id: 'actions',
      name: 'Actions',
      type: 'div',
      props: { style: { padding: '16px', display: 'flex', gap: '8px' } },
      children: [
        {
          id: 'btn1',
          name: 'Button1',
          type: 'button',
          props: { children: '按钮一' },
          event2action: { onClick: 'action1' },
        },
        {
          id: 'btn2',
          name: 'Button2',
          type: 'button',
          props: { children: '按钮二' },
        },
      ],
    },
  ],
};
