import React, { useEffect, useMemo } from 'react';
import { Study } from '../types';
import { STATUS_COLORS } from '../constants/colors';
import './StudySelector.css';

interface StudySelectorProps {
  studies: Study[];
  selectedStudy: Study | null;
  onSelect: (study: Study) => void;
  loading: boolean;
}

export const StudySelector: React.FC<StudySelectorProps> = ({
  studies,
  selectedStudy,
  onSelect,
  loading
}) => {
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
    }, {} as Record<string, Study[]>);
  }, [studies]);

  // 获取研究状态的样式
  const getStatusStyle = (status: string) => {
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
  const getStatusDisplayName = (status: string): string => {
    const statusMap: Record<string, string> = {
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
  const getPhaseDisplayName = (phase: string): string => {
    if (!phase) return '未分类';
    return `Phase ${phase}`;
  };

  return (
    <div className="study-selector">
      <h3>研究选择器</h3>
      <div className="search-box">
        <select
          value={selectedStudy?.id || ''}
          onChange={(e) => {
            const study = studies.find(s => s.id === e.target.value);
            if (study) onSelect(study);
          }}
          disabled={loading}
          className="study-select"
        >
          <option value="">请选择研究...</option>
          {Object.entries(groupedStudies).map(([phase, phaseStudies]) => (
            <optgroup key={phase} label={getPhaseDisplayName(phase)}>
              {phaseStudies.map(study => (
                <option key={study.id} value={study.id}>
                  {study.number}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {loading && (
        <div className="loading-indicator">
          <span className="spinner"></span>
          加载中...
        </div>
      )}

      {selectedStudy && (
        <div className="study-info">
          <div className="study-header">
            <h4>{selectedStudy.number}</h4>
          </div>
          
          <div className="study-details">
            <div className="detail-item">
              <label>研究编号:</label>
              <span>{selectedStudy.id}</span>
            </div>
            
            <div className="detail-item">
              <label>阶段:</label>
              <span>{getPhaseDisplayName(selectedStudy.phase)}</span>
            </div>
            
            <div className="detail-item">
              <label>状态:</label>
              <span style={getStatusStyle(selectedStudy.status)}>
                {getStatusDisplayName(selectedStudy.status)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
