import axios from 'axios';
import type { AuthResponse, Study, Site, Country } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const VAULT_URL = import.meta.env.VITE_VAULT_URL || 'https://mssandbox-clinical.veevavault.com';

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 存储会话信息
interface SessionInfo {
  sessionId: string;
  refreshToken: string;
  expiresAt: number;
}

// 会话管理
const sessionManager = {
  // 保存会话信息
  saveSession(data: AuthResponse) {
    const sessionInfo: SessionInfo = {
      sessionId: data.sessionId,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + (data.expiresIn || 3600) * 1000
    };
    localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));
    localStorage.setItem('sessionId', data.sessionId);
  },

  // 获取会话信息
  getSession(): SessionInfo | null {
    const data = localStorage.getItem('sessionInfo');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  // 清除会话信息
  clearSession() {
    localStorage.removeItem('sessionInfo');
    localStorage.removeItem('sessionId');
  },

  // 检查会话是否过期
  isSessionExpired(): boolean {
    const session = this.getSession();
    if (!session) return true;
    // 提前5分钟认为过期，以便有时间刷新
    return Date.now() > session.expiresAt - 5 * 60 * 1000;
  }
};

// 请求拦截器 - 添加认证信息和自动刷新token
api.interceptors.request.use(async (config) => {
  let session = sessionManager.getSession();

  // 如果没有会话信息，不添加认证头
  if (!session) {
    return config;
  }

  // 如果会话即将过期，尝试刷新
  if (sessionManager.isSessionExpired()) {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/refresh`, {
        refreshToken: session.refreshToken
      });
      sessionManager.saveSession(response.data);
      session = sessionManager.getSession();
    } catch (error) {
      // 刷新失败，清除会话信息
      sessionManager.clearSession();
      // 可以在这里添加重定向到登录页的逻辑
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }

  // 添加认证头
  if (session) {
    config.headers.Authorization = `Bearer ${session.sessionId}`;
  }

  return config;
});

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // 尝试刷新token
      const session = sessionManager.getSession();
      if (session?.refreshToken) {
        try {
          const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/refresh`, {
            refreshToken: session.refreshToken
          });
          sessionManager.saveSession(response.data);
          
          // 重试失败的请求
          const config = error.config;
          config.headers.Authorization = `Bearer ${response.data.sessionId}`;
          return axios(config);
        } catch {
          // 刷新失败，清除会话信息
          sessionManager.clearSession();
          window.location.href = '/login';
        }
      } else {
        // 没有刷新token，直接跳转登录
        sessionManager.clearSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Vault API
export const vaultApi = {
  async getSession(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/api/vault/session');
    return response.data;
  },

  async validateSession(): Promise<boolean> {
    try {
      await api.get('/api/vault/validate');
      return true;
    } catch {
      return false;
    }
  }
};

export const authApi = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      username,
      password
    });
    sessionManager.saveSession(response.data);
    return response.data;
  },

  async keepAlive(): Promise<void> {
    await api.post('/api/auth/keep-alive');
  },

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      await api.post('/api/auth/validate', { sessionId });
      return true;
    } catch {
      return false;
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    const session = sessionManager.getSession();
    if (!session?.refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await api.post<AuthResponse>('/api/auth/refresh', {
      refreshToken: session.refreshToken
    });
    sessionManager.saveSession(response.data);
    return response.data;
  },

  logout() {
    const session = sessionManager.getSession();
    if (session) {
      // 调用后端注销接口
      api.post('/api/auth/logout', {
        refreshToken: session.refreshToken
      }).finally(() => {
        sessionManager.clearSession();
      });
    }
  }
};

export const studyApi = {
  async getStudies(): Promise<Study[]> {
    const response = await api.get<Study[]>('/api/studies');
    return response.data;
  }
};

export const siteApi = {
  async getSites(studyId: string): Promise<Site[]> {
    const response = await api.get<Site[]>(`/api/${studyId}/sites`);
    return response.data;
  },

  async getCountries(studyId: string): Promise<Country[]> {
    const response = await api.get<Country[]>(`/api/${studyId}/countries`);
    return response.data;
  },

  async getStatusColors(): Promise<Record<string, string>> {
    const response = await api.get<Record<string, string>>('/api/status-colors');
    return response.data;
  }
};

// 导出会话管理器以供其他模块使用
export { sessionManager };
