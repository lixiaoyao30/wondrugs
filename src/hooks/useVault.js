import { useState, useCallback, useEffect } from 'react';
import { authApi, studyApi, siteApi } from '../api';
import { STATUS_COLORS } from '../constants/colors';
// ================ 常量定义 ================
const STATUS_DISPLAY_MAP = {
    'active__v': '活跃',
    'completed__v': '已完成',
    'suspended__v': '暂停',
    'terminated__v': '终止',
    'on_hold__v': '搁置',
    'inactive__v': '未激活',
    'did_not_participate__v': '未参与'
};
const SESSION_CONFIG = {
    KEEP_ALIVE_INTERVAL: 5 * 60 * 1000, // 5分钟
    STORAGE_KEYS: {
        IS_LOGGED_IN: 'isLoggedIn',
        TOKEN: 'token',
        USERNAME: 'username'
    }
};
// ================ 工具函数 ================
const getStatusDisplayName = (status) => STATUS_DISPLAY_MAP[status] || status;
const normalizeSiteStatus = (status) => {
    if (!status)
        return 'inactive__v';
    return status.toLowerCase()
        .replace(/^status_/, '')
        .replace(/_status$/, '')
        .replace('__c', '__v')
        .endsWith('__v') ? status : `${status}__v`;
};
// ================ 数据处理函数 ================
const processSiteData = (site) => ({
    id: site.id,
    number: site.number || site.site_number__v || '',
    name: site.name || site.site_name__v || '',
    status: normalizeSiteStatus(site.status || site.site_status__v || 'inactive__v'),
    siteStatus: normalizeSiteStatus(site.status || site.site_status__v || 'inactive__v'),
    countryId: site.country_id__v || site.countryId || '',
    country: site.country_name__v || site.country || '',
    latitude: parseFloat(site.latitude__v || site.latitude || '0'),
    longitude: parseFloat(site.longitude__v || site.longitude || '0'),
    vaultUrl: site.vault_url__v || site.vaultUrl || `${process.env.REACT_APP_VAULT_URL}/sites/${site.id}`
});
const processCountryData = (country) => ({
    id: country.id,
    name: country.name || country.country_name__v || '',
    code: country.code || country.country_code__v || '',
    abbreviation: country.abbreviation || country.country_abbreviation__v || '',
    status: country.status || 'inactive__v',
    countryStatus: country.status === 'active__v' ? 'ACTIVE' : 'INACTIVE',
    vaultUrl: country.vault_url__v || country.vaultUrl || `${process.env.REACT_APP_VAULT_URL}/countries/${country.id}`
});
// ================ 主Hook ================
export const useVault = () => {
    // 状态定义
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.IS_LOGGED_IN) === 'true');
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [sites, setSites] = useState([]);
    const [countries, setCountries] = useState([]);
    const [statusColors, setStatusColors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // ================ 数据加载函数 ================
    const loadStatusColors = async () => {
        try {
            const formattedColors = Object.entries(STATUS_COLORS)
                .filter(([key]) => key !== 'DEFAULT')
                .map(([status, color]) => ({
                name: getStatusDisplayName(status),
                siteStatus: status,
                statusColor: color
            }));
            setStatusColors(formattedColors);
        }
        catch (err) {
            console.error('加载状态颜色失败:', err);
            // 使用默认颜色配置
            const defaultColors = Object.entries(STATUS_COLORS)
                .filter(([key]) => key !== 'DEFAULT')
                .map(([status, color]) => ({
                name: getStatusDisplayName(status),
                siteStatus: status,
                statusColor: color
            }));
            setStatusColors(defaultColors);
        }
    };
    const loadStudies = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await studyApi.getStudies();
            setStudies(data);
        }
        catch (err) {
            setError('加载研究列表失败');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    // ================ 会话管理 ================
    const handleLogin = async (username, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authApi.login(username, password);
            if (response.status === 'success') {
                localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.IS_LOGGED_IN, 'true');
                localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.USERNAME, username);
                response.token && localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.TOKEN, response.token);
                setIsLoggedIn(true);
                await Promise.all([loadStudies(), loadStatusColors()]);
            }
            else {
                throw new Error(response.message || '用户名或密码错误');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '登录失败，请检查用户名和密码');
            localStorage.clear();
            setIsLoggedIn(false);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogout = useCallback(async () => {
        try {
            setLoading(true);
            await authApi.logout();
        }
        catch (err) {
            console.error('登出失败:', err);
        }
        finally {
            localStorage.clear();
            setIsLoggedIn(false);
            setStudies([]);
            setSelectedStudy(null);
            setSites([]);
            setCountries([]);
            setStatusColors([]);
            setError(null);
            setLoading(false);
        }
    }, []);
    // ================ 研究选择 ================
    const selectStudy = useCallback(async (study) => {
        try {
            setLoading(true);
            setError(null);
            setSelectedStudy(study);
            const [sitesData, countriesData] = await Promise.all([
                siteApi.getSites(study.id),
                siteApi.getCountries(study.id)
            ]);
            const processedSites = sitesData.map(processSiteData);
            const countriesWithStats = countriesData.map(countryData => {
                const baseCountry = processCountryData(countryData);
                const countrySites = processedSites.filter(site => site.countryId === baseCountry.id);
                return {
                    ...baseCountry,
                    siteCount: countrySites.length,
                    activeSiteCount: countrySites.filter(site => site.status === 'active__v').length
                };
            });
            setSites(processedSites);
            setCountries(countriesWithStats);
        }
        catch (err) {
            setError('加载研究数据失败');
            console.error('选择研究失败:', err);
            setSites([]);
            setCountries([]);
        }
        finally {
            setLoading(false);
        }
    }, []);
    // ================ 生命周期效果 ================
    // 初始化检查会话
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.TOKEN);
            const isLoggedInLocal = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.IS_LOGGED_IN) === 'true';
            if (isLoggedInLocal && token) {
                try {
                    setIsLoggedIn(true);
                    await Promise.all([loadStudies(), loadStatusColors()]);
                }
                catch (err) {
                    console.error('Session validation failed:', err);
                }
            }
        };
        checkSession();
    }, []);
    // 保持会话活跃
    useEffect(() => {
        if (!isLoggedIn)
            return;
        const interval = setInterval(async () => {
            try {
                await authApi.keepAlive();
            }
            catch (err) {
                handleLogout();
            }
        }, SESSION_CONFIG.KEEP_ALIVE_INTERVAL);
        return () => clearInterval(interval);
    }, [isLoggedIn, handleLogout]);
    // ================ 返回值 ================
    return {
        isLoggedIn,
        studies,
        selectedStudy,
        sites,
        countries,
        statusColors,
        loading,
        error,
        handleLogin,
        handleLogout,
        selectStudy
    };
};
