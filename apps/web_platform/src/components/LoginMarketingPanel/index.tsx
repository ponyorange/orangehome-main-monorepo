import { useRef } from 'react';
import { Typography } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { OrangeMascot } from '@/components/OrangeMascot';
import './LoginMarketingPanel.scss';

const { Title, Text } = Typography;

const BULLET_KEYS = ['bullet1', 'bullet2', 'bullet3', 'bullet4', 'bullet5'] as const;

/**
 * 登录页左栏：产品介绍要点 + 橙子角色（视线跟随在 OrangeMascot 内实现）。
 */
export function LoginMarketingPanel() {
  const { t } = useTranslation();
  const areaRef = useRef<HTMLDivElement>(null);

  const bullets = BULLET_KEYS.map((key) => t(`loginPage.${key}`)).filter(Boolean);

  return (
    <div className="login-marketing-panel" ref={areaRef}>
      <OrangeMascot trackingRef={areaRef} />
      <Title heading={2} className="login-marketing-panel__title">
        {t('loginPage.marketingTitle')}
      </Title>
      <Text className="login-marketing-panel__intro">{t('loginPage.marketingIntro')}</Text>
      <ul className="login-marketing-panel__list">
        {bullets.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

export default LoginMarketingPanel;
