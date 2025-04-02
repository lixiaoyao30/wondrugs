import React, { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { StudySelector } from './components/StudySelector';
import { WorldMap } from './components/WorldMap';
import { SiteHealthDashboard } from './components/SiteHealthDashboard';
import { useVault } from './hooks/useVault';
import { STATUS_COLORS, COUNTRY_STATUS_COLORS } from './constants/colors';
import type { StatusColorConfig } from './constants/colors';
import './App.css';
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback() {
  return (
    <div className="error-container">
      <h2>应用加载出错</h2>
      <button onClick={() => window.location.reload()}>
        重新加载
      </button>
    </div>
  );
}


// 定义默认的站点状态颜色配置
const defaultStatusColors: StatusColorConfig[] = [
  { name: '活跃', siteStatus: 'active_site__v', statusColor: STATUS_COLORS.ACTIVE },
  { name: '已完成', siteStatus: 'completed_site__v', statusColor: STATUS_COLORS.COMPLETED },
  { name: '暂停', siteStatus: 'suspended_site__v', statusColor: STATUS_COLORS.SUSPENDED },
  { name: '终止', siteStatus: 'terminated_site__v', statusColor: STATUS_COLORS.TERMINATED },
  { name: '搁置', siteStatus: 'on_hold__v', statusColor: STATUS_COLORS.ON_HOLD },
  { name: '未激活', siteStatus: 'inactive_site__v', statusColor: STATUS_COLORS.INACTIVE }
];

// 定义默认的国家状态颜色配置
const defaultCountryStatusColors = {
  ACTIVE: COUNTRY_STATUS_COLORS.ACTIVE,
  INACTIVE: COUNTRY_STATUS_COLORS.INACTIVE,
  ARCHIVED: COUNTRY_STATUS_COLORS.ARCHIVED
};

const App: React.FC = () => {
  const {
    isLoggedIn,
    studies,
    selectedStudy,
    sites,
    countries,
    statusColors = defaultStatusColors,
    loading,
    error,
    handleLogin,
    handleLogout,
    selectStudy
  } = useVault();

  // 添加视图切换状态
  const [activeView, setActiveView] = useState<'map' | 'health'>('map');

  // 错误处理
  const handleError = (error: Error) => {
    console.error('Application error:', error);
    // 可以添加错误通知或其他处理
  };

  if (!isLoggedIn) {
    return (
      <LoginForm
        onLogin={handleLogin}
        error={error}
        loading={loading}
      />
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="app">
        <header className="app-header">
          <h1>WonderDrugs Study Map</h1>
          <div className="view-controls">
            <button
              className={`view-button ${activeView === 'map' ? 'active' : ''}`}
              onClick={() => setActiveView('map')}
            >
              地图视图
            </button>
            <button
              className={`view-button ${activeView === 'health' ? 'active' : ''}`}
              onClick={() => setActiveView('health')}
            >
              健康仪表盘
            </button>
          </div>
          <button onClick={handleLogout} className="logout-button">
            退出登录
          </button>
        </header>
        <main className="app-main">
          <aside className="app-sidebar">
            <StudySelector
              studies={studies || []}
              selectedStudy={selectedStudy}
              onSelect={selectStudy}
              loading={loading}
            />
          </aside>
          <section className="map-section">
            {loading ? (
              <div className="loading">
                <span className="spinner"></span>
                加载中...
              </div>
            ) : (
              <>
                {activeView === 'map' && (
                  <WorldMap
                    sites={sites || []}
                    countries={countries || []}
                    statusColors={Array.isArray(statusColors) ? statusColors : defaultStatusColors}
                    selectedStudy={selectedStudy?.id || null}
                  />
                )}
                {activeView === 'health' && (
                  <SiteHealthDashboard
                    studyId={selectedStudy?.id || null}
                    loading={loading}
                  />
                )}
              </>
            )}
          </section>
        </main>
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {typeof error === 'string' ? error : error.message}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
