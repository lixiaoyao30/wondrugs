import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import './SiteHealthDashboard.css';
export const SiteHealthDashboard = ({ studyId, loading }) => {
    const [healthData, setHealthData] = useState([]);
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState(null);
    const dataFetchedRef = useRef({});
    useEffect(() => {
        if (!studyId)
            return;
        const fetchHealthData = async () => {
            // 检查是否已经获取过该studyId的数据
            if (dataFetchedRef.current[studyId]) {
                return;
            }
            // 先尝试从sessionStorage获取缓存数据
            const cachedData = sessionStorage.getItem(`site-health-${studyId}`);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    setHealthData(parsedData);
                    dataFetchedRef.current[studyId] = true;
                    return;
                }
            }
            setLocalLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/${studyId}/site-health`, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                if (!response.ok) {
                    throw new Error('获取站点健康数据失败');
                }
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setHealthData(data);
                    sessionStorage.setItem(`site-health-${studyId}`, JSON.stringify(data));
                    dataFetchedRef.current[studyId] = true; // 标记该studyId的数据已获取
                }
                else {
                    throw new Error('没有找到站点健康数据');
                }
            }
            catch (err) {
                console.error('获取站点健康数据错误:', err);
                setError(err instanceof Error ? err.message : '获取数据失败');
            }
            finally {
                setLocalLoading(false);
            }
        };
        fetchHealthData();
        // 组件卸载时的清理函数
        return () => {
            // 可以在这里清理特定的数据
            if (studyId) {
                delete dataFetchedRef.current[studyId];
            }
        };
    }, [studyId]);
    // 获取健康状态颜色
    const getHealthColor = (score) => {
        if (score >= 80)
            return '#4caf50'; // 绿色
        if (score >= 60)
            return '#ff9800'; // 橙色
        return '#f44336'; // 红色
    };
    // 获取趋势图标
    const getTrendIcon = (trend) => {
        switch (trend) {
            case '上升':
                return _jsx("span", { className: "trend-icon up", children: "\u2191" });
            case '下降':
                return _jsx("span", { className: "trend-icon down", children: "\u2193" });
            default:
                return _jsx("span", { className: "trend-icon stable", children: "\u2192" });
        }
    };
    if (loading || localLoading) {
        return _jsx("div", { className: "loading", children: "\u52A0\u8F7D\u4E2D..." });
    }
    if (error) {
        return _jsx("div", { className: "error-message", children: error });
    }
    if (!studyId) {
        return _jsx("div", { className: "empty-state", children: "\u8BF7\u9009\u62E9\u4E00\u4E2A\u7814\u7A76\u4EE5\u67E5\u770B\u7AD9\u70B9\u5065\u5EB7\u6570\u636E" });
    }
    if (healthData.length === 0) {
        return _jsx("div", { className: "empty-state", children: "\u6CA1\u6709\u627E\u5230\u7AD9\u70B9\u5065\u5EB7\u6570\u636E" });
    }
    const getStatusStyle = (status) => {
        const baseStatus = Array.isArray(status) ? status[0] : status;
        const styleMap = {
            'active__v': {
                backgroundColor: '#4caf50',
                color: 'white'
            },
            'inactive__v': {
                backgroundColor: '#f44336',
                color: 'white'
            },
            'did_not_participate__c': {
                backgroundColor: '#9e9e9e',
                color: 'white'
            },
            'candidate__c': {
                backgroundColor: '#2196f3',
                color: 'white'
            },
            'pending__v': {
                backgroundColor: '#ff9800',
                color: 'white'
            }
        };
        return styleMap[baseStatus] || {};
    };
    const getStatusText = (status) => {
        const statusMap = {
            'active__v': '活跃',
            'inactive__v': '不活跃',
            'did_not_participate__c': '未参与',
            'candidate__c': '候选',
            'pending__v': '待定',
            'completed__v': '已完成',
            'terminated__v': '已终止',
            'suspended__v': '已暂停',
            // 可以根据需要添加更多状态映射
        };
        return statusMap[status] || status; // 如果没有匹配的映射，返回原始状态
    };
    return (_jsxs("div", { className: "health-dashboard", children: [_jsx("h2", { children: "\u7AD9\u70B9\u5065\u5EB7\u6307\u6570\u4EEA\u8868\u76D8" }), _jsxs("div", { className: "dashboard-summary", children: [_jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "\u603B\u7AD9\u70B9\u6570:" }), _jsx("span", { className: "summary-value", children: healthData.length })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "\u5065\u5EB7\u7AD9\u70B9:" }), _jsx("span", { className: "summary-value", children: healthData.filter(site => site.healthScore >= 80).length })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "\u9700\u5173\u6CE8\u7AD9\u70B9:" }), _jsx("span", { className: "summary-value", children: healthData.filter(site => site.healthScore < 60).length })] })] }), _jsx("div", { className: "dashboard-grid", children: healthData.map(site => (_jsxs("div", { className: "site-health-card", children: [_jsxs("div", { className: "site-header", children: [_jsx("h3", { children: site.name }), _jsxs("div", { className: "site-status", children: [_jsxs("span", { className: "health-score", style: { color: getHealthColor(site.healthScore) }, children: [site.healthScore, "%"] }), getTrendIcon(site.trend)] })] }), _jsxs("div", { className: "health-indicator-container", children: [_jsx("div", { className: "health-indicator-bg" }), _jsx("div", { className: "health-indicator", style: {
                                        width: `${site.healthScore}%`,
                                        backgroundColor: getHealthColor(site.healthScore)
                                    } })] }), _jsxs("div", { className: "site-details", children: [_jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "\u7AD9\u70B9ID:" }), _jsx("span", { className: "detail-value", children: site.number })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "\u56FD\u5BB6:" }), _jsx("span", { className: "detail-value", children: site.country })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "\u72B6\u6001:" }), _jsx("span", { className: "detail-value status-badge", style: getStatusStyle(site.status), children: getStatusText(site.status) })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "\u5065\u5EB7\u72B6\u6001:" }), _jsx("span", { className: "detail-value health-status", style: { color: getHealthColor(site.healthScore) }, children: site.healthStatus })] })] }), _jsxs("div", { className: "site-issues", children: [_jsx("h4", { children: "\u72B6\u6001\u8BF4\u660E:" }), _jsx("ul", { children: site.issues.map((issue, index) => (_jsx("li", { children: issue }, index))) })] }), _jsx("div", { className: "site-actions", children: _jsx("a", { href: site.vaultUrl, target: "_blank", rel: "noopener noreferrer", className: "view-details", children: "\u5728Vault\u4E2D\u67E5\u770B\u8BE6\u60C5" }) })] }, site.id))) })] }));
};
