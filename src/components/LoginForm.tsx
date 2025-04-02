import React, { useState } from 'react';
import './LoginForm.css';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, error: externalError, loading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  
  // 使用内部错误或外部错误
  const error = internalError || externalError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    // 基本验证
    if (!username.trim()) {
      setInternalError('用户名不能为空');
      return;
    }
    
    if (!password.trim()) {
      setInternalError('密码不能为空');
      return;
    }
    
    // 清除之前的错误
    setInternalError(null);
    
    try {
      await onLogin(username, password);
    } catch (err: any) {
      // 处理不同类型的错误
      if (err.response) {
        // 服务器响应了，但状态码不在 2xx 范围内
        if (err.response.status === 400) {
          setInternalError('用户名或密码不正确');
        } else if (err.response.status === 401) {
          setInternalError('用户名或密码不正确');
        } else {
          setInternalError('登录失败，请稍后再试');
        }
      } else if (err.request) {
        // 请求已发送但没有收到响应
        setInternalError('无法连接到服务器，请检查网络连接');
      } else {
        // 请求设置时出错
        setInternalError('发生错误，请稍后再试');
      }
      console.error('Login error:', err);
    }
  };

  // 当用户输入时清除错误
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (internalError) {
      setInternalError(null);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>WonderDrugs Map Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => handleInputChange(setUsername, e.target.value)}
            placeholder="Enter your username"
            disabled={loading}
            className={!username && error ? 'input-error' : ''}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => handleInputChange(setPassword, e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
            className={!password && error ? 'input-error' : ''}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="login-button"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
