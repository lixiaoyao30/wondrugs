import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { StudySelector } from './components/StudySelector';
import { WorldMap } from './components/WorldMap';
import { SiteHealthDashboard } from './components/SiteHealthDashboard';
import { useVault } from './hooks/useVault';
import { STATUS_COLORS, COUNTRY_STATUS_COLORS } from './constants/colors';
import './App.css';
import { ErrorBoundary } from 'react-error-boundary';
function ErrorFallback() {
    return (_jsxs("div", { className: "error-container", children: [_jsx("h2", { children: "\u5E94\u7528\u52A0\u8F7D\u51FA\u9519" }), _jsx("button", { onClick: () => window.location.reload(), children: "\u91CD\u65B0\u52A0\u8F7D" })] }));
}
// 定义默认的站点状态颜色配置
const defaultStatusColors = [
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
const App = () => {
    const { isLoggedIn, studies, selectedStudy, sites, countries, statusColors = defaultStatusColors, loading, error, handleLogin, handleLogout, selectStudy } = useVault();
    // 添加视图切换状态
    const [activeView, setActiveView] = useState('map');
    // 错误处理
    const handleError = (error) => {
        console.error('Application error:', error);
        // 可以添加错误通知或其他处理
    };
    if (!isLoggedIn) {
        return (_jsx(LoginForm, { onLogin: handleLogin, error: error, loading: loading }));
    }
    return (_jsx(ErrorBoundary, { FallbackComponent: ErrorFallback, children: _jsxs("div", { className: "app", children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { children: "WonderDrugs Study Map" }), _jsxs("div", { className: "view-controls", children: [_jsx("button", { className: `view-button ${activeView === 'map' ? 'active' : ''}`, onClick: () => setActiveView('map'), children: "\u5730\u56FE\u89C6\u56FE" }), _jsx("button", { className: `view-button ${activeView === 'health' ? 'active' : ''}`, onClick: () => setActiveView('health'), children: "\u5065\u5EB7\u4EEA\u8868\u76D8" })] }), _jsx("button", { onClick: handleLogout, className: "logout-button", children: "\u9000\u51FA\u767B\u5F55" })] }), _jsxs("main", { className: "app-main", children: [_jsx("aside", { className: "app-sidebar", children: _jsx(StudySelector, { studies: studies || [], selectedStudy: selectedStudy, onSelect: selectStudy, loading: loading }) }), _jsx("section", { className: "map-section", children: loading ? (_jsxs("div", { className: "loading", children: [_jsx("span", { className: "spinner" }), "\u52A0\u8F7D\u4E2D..."] })) : (_jsxs(_Fragment, { children: [activeView === 'map' && (_jsx(WorldMap, { sites: sites || [], countries: countries || [], statusColors: Array.isArray(statusColors) ? statusColors : defaultStatusColors, selectedStudy: selectedStudy?.id || null })), activeView === 'health' && (_jsx(SiteHealthDashboard, { studyId: selectedStudy?.id || null, loading: loading }))] })) })] }), error && (_jsxs("div", { className: "error-message", children: [_jsx("span", { className: "error-icon", children: "\u26A0" }), typeof error === 'string' ? error : error.message] }))] }) }));
};
export default App;
