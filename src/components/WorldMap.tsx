import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { Site, Country } from '../types';
import { STATUS_COLORS, COUNTRY_STATUS_COLORS, StatusColorConfig } from '../constants/colors';
import { countryCoordinates } from '../constants/countryCoordinates';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';

// ================ 常量配置 ================
const MAP_CONFIG = {
  defaultCenter: [35, 105] as [number, number],
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
const getStatusDisplayName = (status: string, type: 'site' | 'country'): string =>
  STATUS_DISPLAY_NAMES[type][status as keyof typeof STATUS_DISPLAY_NAMES[typeof type]] || status;

const getSiteColor = (site: Site): string => {
  const status = site.status || site.siteStatus;
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.DEFAULT;
};

const getCountryColor = (country: Country): string =>
  country.status === 'active__v' ? COUNTRY_STATUS_COLORS.ACTIVE : COUNTRY_STATUS_COLORS.INACTIVE;

const calculateSiteOffset = (index: number, total: number): [number, number] => {
  const baseRadius = Math.max(1, Math.min(total * 0.3, 3));
  const angle = (index / total) * 2 * Math.PI;

  if (total === 1) return [baseRadius, 0];

  const spiralRadius = baseRadius * (1 + index * 0.1);
  return [
    spiralRadius * Math.cos(angle),
    spiralRadius * Math.sin(angle)
  ];
};

// ================ 子组件 ================
const BoundsUpdater: React.FC<{ sites: Site[]; countries: Country[] }> = ({ sites, countries }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      const bounds = new LatLngBounds([]);
      countries.forEach(country => {
        const center = countryCoordinates[country.abbreviation];
        if (center) bounds.extend(center);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, MAP_CONFIG.bounds);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [map, sites, countries]);

  return null;
};

const ResetViewButton: React.FC = () => {
  const map = useMap();
  const handleReset = () => map.setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom, { animate: true });

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button onClick={handleReset} className="reset-view-button" title="重置视图">
          <span>⟲</span>
        </button>
      </div>
    </div>
  );
};

// ================ 弹窗内容组件 ================
const SitePopup: React.FC<{ site: Site; color: string }> = ({ site, color }) => (
  <div className="site-popup">
    <h3>{site.name}</h3>
    <div className="site-info">
      <p><strong>站点编号:</strong> {site.id}</p>
      <p>
        <strong>状态:</strong>
        <span className="status-badge" style={{ backgroundColor: color }}>
          {getStatusDisplayName(site.status, 'site')}
        </span>
      </p>
      <p><strong>国家:</strong> {site.country}</p>
    </div>
    {site.vaultUrl && (
      <div className="site-actions">
        <a href={site.vaultUrl} target="_blank" rel="noopener noreferrer" className="vault-link">
          <span style={{ color: '#fff' }}>在 Vault 中查看详情</span>
        </a>
      </div>
    )}
  </div>
);

const CountryPopup: React.FC<{ country: Country; color: string }> = ({ country, color }) => (
  <div className="country-popup">
    <h3>{country.name}</h3>
    <h3>{country.id}</h3>
    <div className="country-info">
      <p>
        <strong>状态:</strong>
        <span className="status-badge" style={{ backgroundColor: color }}>
          {getStatusDisplayName(country.status, 'country')}
        </span>
      </p>
      <p><strong>站点数量:</strong> {country.siteCount || 0}</p>
      <p><strong>活跃站点:</strong> {country.activeSiteCount || 0}</p>
      {country.vaultUrl && (
        <div className="country-actions">
          <a href={country.vaultUrl} target="_blank" rel="noopener noreferrer" className="vault-link">
            <span style={{ color: '#fff' }}>在 Vault 中查看详情</span>
          </a>
        </div>
      )}
    </div>
  </div>
);

// ================ 主组件 ================
interface WorldMapProps {
  sites: Site[];
  countries: Country[];
  statusColors: StatusColorConfig[];
  selectedStudy: string | null;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  sites = [],
  countries = [],
  statusColors = [],
  selectedStudy
}) => {
  // 渲染站点标记
  const renderSiteMarker = (site: Site, siteIndex: number, totalSites: number) => {
    const color = getSiteColor(site);
    const country = countries.find(c => c.id === site.countryId);
    let center: [number, number] = [site.latitude, site.longitude];

    if (country && countryCoordinates[country.abbreviation]) {
      const countryCenter = countryCoordinates[country.abbreviation];
      const [offsetX, offsetY] = calculateSiteOffset(siteIndex, totalSites);
      center = [countryCenter[0] + offsetY, countryCenter[1] + offsetX];
    }

    return (
      <CircleMarker
        key={`${site.id}-${siteIndex}`}
        center={center}
        {...MARKER_STYLES.site}
        pathOptions={{ ...MARKER_STYLES.site.pathOptions, fillColor: color }}
      >
        <Popup>
          <SitePopup site={site} color={color} />
        </Popup>
      </CircleMarker>
    );
  };

  // 渲染国家标记
  const renderCountryMarker = (country: Country) => {
    const center = countryCoordinates[country.abbreviation];
    if (!center) return null;

    const color = getCountryColor(country);

    return (
      <CircleMarker
        key={country.id}
        center={center}
        {...MARKER_STYLES.country}
        pathOptions={{ ...MARKER_STYLES.country.pathOptions, fillColor: color }}
      >
        <Popup>
          <CountryPopup country={country} color={color} />
        </Popup>
      </CircleMarker>
    );
  };

  return (
    <div className="map-container">
      <MapContainer
        center={MAP_CONFIG.defaultCenter}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          attribution='&copy; 高德地图'
          subdomains={['1', '2', '3', '4']}
          maxZoom={18}
        />
        <BoundsUpdater sites={sites} countries={countries} />
        <ResetViewButton />

        {countries.map(country => (
          <React.Fragment key={country.id}>
            {renderCountryMarker(country)}
            {sites
              .filter(site => site.countryId === country.id)
              .map((site, index, array) => renderSiteMarker(site, index, array.length))}
          </React.Fragment>
        ))}
      </MapContainer>

      <div className="map-legend">
        <div className="legend-section">
          <h4>站点状态</h4>
          {statusColors.map(({ name, siteStatus, statusColor }) => (
            <div key={siteStatus} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: statusColor }} />
              <span className="legend-label">{name}</span>
            </div>
          ))}
        </div>
        <div className="legend-section">
          <h4>国家状态</h4>
          {Object.entries(COUNTRY_STATUS_COLORS).map(([status, color]) => (
            status !== 'DEFAULT' && (
              <div key={status} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: color }} />
                <span className="legend-label">
                  {getStatusDisplayName(status.toLowerCase() + '__v', 'country')}
                </span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};
