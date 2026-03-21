import React from 'react';
import { useThemeStore } from './themeStore';
import { getAllThemes } from './theme-config';

export const ThemeSwitcher: React.FC = () => {
  const { currentThemeId, setTheme } = useThemeStore();
  const themes = getAllThemes();

  const handleThemeClick = (themeId: string) => {
    setTheme(themeId);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>主题</span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: '#f5f5f5',
          padding: '4px',
          borderRadius: '20px',
          border: '1px solid #e0e0e0',
        }}
      >
        {themes.map((theme) => {
          const isActive = theme.id === currentThemeId;
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme.id)}
              title={`${theme.name} - ${theme.description}`}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: isActive ? `2px solid #fff` : '2px solid transparent',
                backgroundColor: theme.colors.primary,
                cursor: 'pointer',
                padding: 0,
                boxShadow: isActive
                  ? `0 0 0 2px ${theme.colors.primary}, 0 2px 4px rgba(0,0,0,0.2)`
                  : '0 1px 2px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary,
                    border: '1px solid #fff',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 简化版本 - 只显示颜色点
export const ThemeSwitcherCompact: React.FC = () => {
  const { currentThemeId, setTheme } = useThemeStore();
  const themes = getAllThemes();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {themes.map((theme) => {
        const isActive = theme.id === currentThemeId;
        return (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            title={theme.name}
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: isActive ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
              backgroundColor: theme.colors.primary,
              cursor: 'pointer',
              padding: 0,
              boxShadow: isActive
                ? `0 0 0 2px #fff, 0 0 0 4px ${theme.colors.primaryLight}`
                : 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        );
      })}
    </div>
  );
};

// 下拉菜单版本
export const ThemeSwitcherDropdown: React.FC = () => {
  const { currentThemeId, setTheme, currentTheme } = useThemeStore();
  const themes = getAllThemes();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: 12,
          color: '#666',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: currentTheme.colors.primary,
          }}
        />
        <span>{currentTheme.name}</span>
        <span style={{ marginLeft: 4, fontSize: 10 }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: 180,
            padding: '8px 0',
          }}
        >
          {themes.map((theme) => {
            const isSelected = theme.id === currentThemeId;
            return (
              <div
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? theme.colors.primaryLight : 'transparent',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary,
                    border: isSelected ? `2px solid ${theme.colors.primary}` : '2px solid #e0e0e0',
                    boxShadow: isSelected ? `0 0 0 2px ${theme.colors.primaryLight}` : 'none',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: isSelected ? theme.colors.primary : '#333',
                    }}
                  >
                    {theme.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                    {theme.description}
                  </div>
                </div>
                {isSelected && (
                  <span style={{ fontSize: 14, color: theme.colors.primary }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
