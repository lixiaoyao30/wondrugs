import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo } from 'react';
import { STATUS_COLORS } from '../constants/colors';
import './StudySelector.css';
export const StudySelector = ({ studies, selectedStudy, onSelect, loading }) => {
    useEffect(() => {
        if (!selectedStudy && studies.length > 0 && !loading) {
            const defaultStudy = studies.find(study => study.number === 'WD102');
            if (defaultStudy) {
                onSelect(defaultStudy);
            }
        }
    }, [studies, selectedStudy, onSelect, loading]);
    // 按照研究阶段对研究进行分组
    const groupedStudies = useMemo(() => {
        return studies.reduce((acc, study) => {
            const phase = study.phase || '未分类';
            if (!acc[phase]) {
                acc[phase] = [];
            }
            acc[phase].push(study);
            return acc;
        }, {});
    }, [studies]);
    // 获取研究状态的样式
    const getStatusStyle = (status) => {
        const normalizedStatus = status?.toLowerCase() || '';
        const backgroundColor = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.DEFAULT;
        return {
            backgroundColor,
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.875rem',
            display: 'inline-block'
        };
    };
    // 获取状态显示名称
    const getStatusDisplayName = (status) => {
        const statusMap = {
            'active__v': '激活',
            'completed__v': '已完成',
            'suspended__v': '暂停',
            'terminated__v': '终止',
            'on_hold__v': '搁置',
            'inactive__v': '未激活'
        };
        return statusMap[status] || status;
    };
    // 获取阶段显示名称
    const getPhaseDisplayName = (phase) => {
        if (!phase)
            return '未分类';
        return `Phase ${phase}`;
    };
    return (_jsxs("div", { className: "study-selector", children: [_jsx("h3", { children: "\u7814\u7A76\u9009\u62E9\u5668" }), _jsx("div", { className: "search-box", children: _jsxs("select", { value: selectedStudy?.id || '', onChange: (e) => {
                        const study = studies.find(s => s.id === e.target.value);
                        if (study)
                            onSelect(study);
                    }, disabled: loading, className: "study-select", children: [_jsx("option", { value: "", children: "\u8BF7\u9009\u62E9\u7814\u7A76..." }), Object.entries(groupedStudies).map(([phase, phaseStudies]) => (_jsx("optgroup", { label: getPhaseDisplayName(phase), children: phaseStudies.map(study => (_jsx("option", { value: study.id, children: study.number }, study.id))) }, phase)))] }) }), loading && (_jsxs("div", { className: "loading-indicator", children: [_jsx("span", { className: "spinner" }), "\u52A0\u8F7D\u4E2D..."] })), selectedStudy && (_jsxs("div", { className: "study-info", children: [_jsx("div", { className: "study-header", children: _jsx("h4", { children: selectedStudy.number }) }), _jsxs("div", { className: "study-details", children: [_jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "\u7814\u7A76\u7F16\u53F7:" }), _jsx("span", { children: selectedStudy.id })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "\u9636\u6BB5:" }), _jsx("span", { children: getPhaseDisplayName(selectedStudy.phase) })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "\u72B6\u6001:" }), _jsx("span", { style: getStatusStyle(selectedStudy.status), children: getStatusDisplayName(selectedStudy.status) })] })] })] }))] }));
};
