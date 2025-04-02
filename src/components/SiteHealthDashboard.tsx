import React, { useState, useEffect, useRef } from 'react';
import './SiteHealthDashboard.css';

interface SiteHealth {
  id: string;
  name: string;
  number: string;
  status: string;
  countryId: string;
  country: string;
  healthScore: number;
  healthStatus: string;
  trend: string;
  issues: string[];
  lastUpdated: string;
  vaultUrl: string;
}

interface SiteHealthDashboardProps {
  studyId: string | null;
  loading: boolean;
}

export const SiteHealthDashboard: React.FC<SiteHealthDashboardProps> = ({ studyId, loading }) => {
  const [healthData, setHealthData] = useState<SiteHealth[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef<{[key: string]: boolean}>({});
  
  useEffect(() => {
    if (!studyId) return;
    
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
          dataFetchedRef.current[studyId] = true;  // 标记该studyId的数据已获取
        } else {
          throw new Error('没有找到站点健康数据');
        }
      } catch (err) {
        console.error('获取站点健康数据错误:', err);
        setError(err instanceof Error ? err.message : '获取数据失败');
      } finally {
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
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#4caf50'; // 绿色
    if (score >= 60) return '#ff9800'; // 橙色
    return '#f44336'; // 红色
  };
  
  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case '上升':
        return <span className="trend-icon up">↑</span>;
      case '下降':
        return <span className="trend-icon down">↓</span>;
      default:
        return <span className="trend-icon stable">→</span>;
    }
  };
  
  if (loading || localLoading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!studyId) {
    return <div className="empty-state">请选择一个研究以查看站点健康数据</div>;
  }
  
  if (healthData.length === 0) {
    return <div className="empty-state">没有找到站点健康数据</div>;
  }

  const getStatusStyle = (status: string | string[]): React.CSSProperties => {
    const baseStatus = Array.isArray(status) ? status[0] : status;
    
    const styleMap: { [key: string]: React.CSSProperties } = {
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

  const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
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
  
  return (
    <div className="health-dashboard">
      <h2>站点健康指数仪表盘</h2>
      
      <div className="dashboard-summary">
        <div className="summary-item">
          <span className="summary-label">总站点数:</span>
          <span className="summary-value">{healthData.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">健康站点:</span>
          <span className="summary-value">{healthData.filter(site => site.healthScore >= 80).length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">需关注站点:</span>
          <span className="summary-value">{healthData.filter(site => site.healthScore < 60).length}</span>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {healthData.map(site => (
          <div key={site.id} className="site-health-card">
            <div className="site-header">
              <h3>{site.name}</h3>
              <div className="site-status">
                <span className="health-score" style={{ color: getHealthColor(site.healthScore) }}>
                  {site.healthScore}%
                </span>
                {getTrendIcon(site.trend)}
              </div>
            </div>
            
            <div className="health-indicator-container">
              <div className="health-indicator-bg"></div>
              <div 
                className="health-indicator" 
                style={{ 
                  width: `${site.healthScore}%`,
                  backgroundColor: getHealthColor(site.healthScore)
                }}
              ></div>
            </div>
            
            <div className="site-details">
              <div className="detail-item">
                <span className="detail-label">站点ID:</span>
                <span className="detail-value">{site.number}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">国家:</span>
                <span className="detail-value">{site.country}</span>
              </div>
              <div className="detail-item">
              <span className="detail-label">状态:</span>
                <span 
                  className="detail-value status-badge"
                  style={getStatusStyle(site.status)}
                >
                  {getStatusText(site.status)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">健康状态:</span>
                <span className="detail-value health-status" style={{ color: getHealthColor(site.healthScore) }}>
                  {site.healthStatus}
                </span>
              </div>
            </div>
            
            <div className="site-issues">
              <h4>状态说明:</h4>
              <ul>
                {site.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
            
            <div className="site-actions">
              <a 
                href={site.vaultUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="view-details"
              >
                在Vault中查看详情
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
