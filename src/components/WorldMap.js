import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { STATUS_COLORS, COUNTRY_STATUS_COLORS } from '../constants/colors';
import { countryCoordinates } from '../constants/countryCoordinates';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
// ================ 常量配置 ================
const MAP_CONFIG = {
    defaultCenter: [35, 105],
    defaultZoom: 4,
    minZoom: 2,
    maxZoom: 18,
    bounds: {
        padding: [50, 50],
        maxZoom: 4,
        animate: true
    }
};
const MARKER_STYLES = {
    site: {
        radius: 6,
        pathOptions: {
            fillOpacity: 1,
            color: '#FFFFFF',
            weight: 2.5
        }
    },
    country: {
        radius: 12,
        pathOptions: {
            fillOpacity: 0.6,
            color: '#FFFFFF',
            weight: 2
        }
    }
};
const STATUS_DISPLAY_NAMES = {
    site: {
        'active__v': '活跃',
        'completed__v': '已完成',
        'suspended__v': '暂停',
        'terminated__v': '终止',
        'on_hold__v': '搁置',
        'inactive__v': '未激活',
        'did_not_participate__v': '未参与'
    },
    country: {
        'active__v': '活跃',
        'inactive__v': '非活跃',
        'archived__v': '已归档',
        'ACTIVE': '活跃',
        'INACTIVE': '非活跃',
        'ARCHIVED': '已归档'
    }
};
// ================ 工具函数 ================
const getStatusDisplayName = (status, type) => STATUS_DISPLAY_NAMES[type][status] || status;
const getSiteColor = (site) => {
    const status = site.status || site.siteStatus;
    return STATUS_COLORS[status] || STATUS_COLORS.DEFAULT;
};
const getCountryColor = (country) => country.status === 'active__v' ? COUNTRY_STATUS_COLORS.ACTIVE : COUNTRY_STATUS_COLORS.INACTIVE;
const calculateSiteOffset = (index, total) => {
    const baseRadius = Math.max(1, Math.min(total * 0.3, 3));
    const angle = (index / total) * 2 * Math.PI;
    if (total === 1)
        return [baseRadius, 0];
    const spiralRadius = baseRadius * (1 + index * 0.1);
    return [
        spiralRadius * Math.cos(angle),
        spiralRadius * Math.sin(angle)
    ];
};
// ================ 子组件 ================
const BoundsUpdater = ({ sites, countries }) => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            const bounds = new LatLngBounds([]);
            countries.forEach(country => {
                const center = countryCoordinates[country.abbreviation];
                if (center)
                    bounds.extend(center);
            });
            if (bounds.isValid()) {
                map.fitBounds(bounds, MAP_CONFIG.bounds);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [map, sites, countries]);
    return null;
};
const ResetViewButton = () => {
    const map = useMap();
    const handleReset = () => map.setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom, { animate: true });
    return (_jsx("div", { className: "leaflet-top leaflet-right", children: _jsx("div", { className: "leaflet-control leaflet-bar", children: _jsx("button", { onClick: handleReset, className: "reset-view-button", title: "\u91CD\u7F6E\u89C6\u56FE", children: _jsx("span", { children: "\u27F2" }) }) }) }));
};
// ================ 弹窗内容组件 ================
const SitePopup = ({ site, color }) => (_jsxs("div", { className: "site-popup", children: [_jsx("h3", { children: site.name }), _jsxs("div", { className: "site-info", children: [_jsxs("p", { children: [_jsx("strong", { children: "\u7AD9\u70B9\u7F16\u53F7:" }), " ", site.id] }), _jsxs("p", { children: [_jsx("strong", { children: "\u72B6\u6001:" }), _jsx("span", { className: "status-badge", style: { backgroundColor: color }, children: getStatusDisplayName(site.status, 'site') })] }), _jsxs("p", { children: [_jsx("strong", { children: "\u56FD\u5BB6:" }), " ", site.country] })] }), site.vaultUrl && (_jsx("div", { className: "site-actions", children: _jsx("a", { href: site.vaultUrl, target: "_blank", rel: "noopener noreferrer", className: "vault-link", children: _jsx("span", { style: { color: '#fff' }, children: "\u5728 Vault \u4E2D\u67E5\u770B\u8BE6\u60C5" }) }) }))] }));
const CountryPopup = ({ country, color }) => (_jsxs("div", { className: "country-popup", children: [_jsx("h3", { children: country.name }), _jsx("h3", { children: country.id }), _jsxs("div", { className: "country-info", children: [_jsxs("p", { children: [_jsx("strong", { children: "\u72B6\u6001:" }), _jsx("span", { className: "status-badge", style: { backgroundColor: color }, children: getStatusDisplayName(country.status, 'country') })] }), _jsxs("p", { children: [_jsx("strong", { children: "\u7AD9\u70B9\u6570\u91CF:" }), " ", country.siteCount || 0] }), _jsxs("p", { children: [_jsx("strong", { children: "\u6D3B\u8DC3\u7AD9\u70B9:" }), " ", country.activeSiteCount || 0] }), country.vaultUrl && (_jsx("div", { className: "country-actions", children: _jsx("a", { href: country.vaultUrl, target: "_blank", rel: "noopener noreferrer", className: "vault-link", children: _jsx("span", { style: { color: '#fff' }, children: "\u5728 Vault \u4E2D\u67E5\u770B\u8BE6\u60C5" }) }) }))] })] }));
export const WorldMap = ({ sites = [], countries = [], statusColors = [], selectedStudy }) => {
    // 渲染站点标记
    const renderSiteMarker = (site, siteIndex, totalSites) => {
        const color = getSiteColor(site);
        const country = countries.find(c => c.id === site.countryId);
        let center = [site.latitude, site.longitude];
        if (country && countryCoordinates[country.abbreviation]) {
            const countryCenter = countryCoordinates[country.abbreviation];
            const [offsetX, offsetY] = calculateSiteOffset(siteIndex, totalSites);
            center = [countryCenter[0] + offsetY, countryCenter[1] + offsetX];
        }
        return (_jsx(CircleMarker, { center: center, ...MARKER_STYLES.site, pathOptions: { ...MARKER_STYLES.site.pathOptions, fillColor: color }, children: _jsx(Popup, { children: _jsx(SitePopup, { site: site, color: color }) }) }, `${site.id}-${siteIndex}`));
    };
    // 渲染国家标记
    const renderCountryMarker = (country) => {
        const center = countryCoordinates[country.abbreviation];
        if (!center)
            return null;
        const color = getCountryColor(country);
        return (_jsx(CircleMarker, { center: center, ...MARKER_STYLES.country, pathOptions: { ...MARKER_STYLES.country.pathOptions, fillColor: color }, children: _jsx(Popup, { children: _jsx(CountryPopup, { country: country, color: color }) }) }, country.id));
    };
    return (_jsxs("div", { className: "map-container", children: [_jsxs(MapContainer, { center: MAP_CONFIG.defaultCenter, zoom: MAP_CONFIG.defaultZoom, minZoom: MAP_CONFIG.minZoom, maxZoom: MAP_CONFIG.maxZoom, style: { height: '100%', width: '100%' }, children: [_jsx(TileLayer, { url: "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", attribution: '\u00A9 \u9AD8\u5FB7\u5730\u56FE', subdomains: ['1', '2', '3', '4'], maxZoom: 18 }), _jsx(BoundsUpdater, { sites: sites, countries: countries }), _jsx(ResetViewButton, {}), countries.map(country => (_jsxs(React.Fragment, { children: [renderCountryMarker(country), sites
                                .filter(site => site.countryId === country.id)
                                .map((site, index, array) => renderSiteMarker(site, index, array.length))] }, country.id)))] }), _jsxs("div", { className: "map-legend", children: [_jsxs("div", { className: "legend-section", children: [_jsx("h4", { children: "\u7AD9\u70B9\u72B6\u6001" }), statusColors.map(({ name, siteStatus, statusColor }) => (_jsxs("div", { className: "legend-item", children: [_jsx("span", { className: "legend-color", style: { backgroundColor: statusColor } }), _jsx("span", { className: "legend-label", children: name })] }, siteStatus)))] }), _jsxs("div", { className: "legend-section", children: [_jsx("h4", { children: "\u56FD\u5BB6\u72B6\u6001" }), Object.entries(COUNTRY_STATUS_COLORS).map(([status, color]) => (status !== 'DEFAULT' && (_jsxs("div", { className: "legend-item", children: [_jsx("span", { className: "legend-color", style: { backgroundColor: color } }), _jsx("span", { className: "legend-label", children: getStatusDisplayName(status.toLowerCase() + '__v', 'country') })] }, status))))] })] })] }));
};
