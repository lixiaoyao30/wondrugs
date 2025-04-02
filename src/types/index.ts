export interface Site {
  id: string;
  name: string;
  number: string;
  status: string;
  siteStatus: string;
  countryId: string;
  country: string;
  latitude: number;
  longitude: number;
  vaultUrl?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  abbreviation: string;
  countryStatus: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  siteCount: number;
  activeSiteCount: number;
  vaultUrl?: string;
}

export interface Study {
  id: string;
  name: string;
  number: string;
  phase: string;
  type: string;
  status: string;
  vaultUrl?: string;
}


export interface AuthResponse {
  status: 'success' | 'error';
  sessionId: string;
  refreshToken: string;
  expiresIn: number;
  message?: string;
}

export interface StatusColorConfig {
  name: string;
  siteStatus: string;
  statusColor: string;
}
