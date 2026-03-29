import React, { useCallback, useState } from 'react';
import { Button, Dropdown, Modal } from '@douyinfe/semi-ui';
import { IconSetting } from '@douyinfe/semi-icons';
import { ThemeSwitcher } from '../../../../core/theme/ThemeSwitcher';

/**
 * 顶栏工具组内：下拉「切换主题」打开弹层，内嵌 ThemeSwitcher。
 */
export const EditorSettingsMenu: React.FC = () => {
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const openThemeModal = useCallback(() => {
    setThemeModalVisible(true);
  }, []);

  return (
    <>
      <Dropdown
        trigger="click"
        position="bottomLeft"
        getPopupContainer={() => document.body}
        render={
          <Dropdown.Menu>
            <Dropdown.Item onClick={openThemeModal}>切换主题</Dropdown.Item>
          </Dropdown.Menu>
        }
      >
        <Button
          icon={<IconSetting />}
          type="tertiary"
          size="small"
          theme="borderless"
          aria-label="设置"
          title="设置：主题等"
          style={{
            borderRadius: 999,
            background: 'rgba(255,255,255,0.62)',
            border: '1px solid var(--theme-border-soft)',
            color: 'var(--theme-text-secondary)',
          }}
        >
          设置
        </Button>
      </Dropdown>

      <Modal
        title="切换主题"
        visible={themeModalVisible}
        onCancel={() => setThemeModalVisible(false)}
        footer={null}
        width={440}
        maskClosable
        centered
      >
        <div style={{ padding: '8px 0 16px' }}>
          <ThemeSwitcher />
        </div>
      </Modal>
    </>
  );
};
