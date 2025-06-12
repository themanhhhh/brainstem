// src/app/context/AuthContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authResponses, userResponses } from '../data/apiResponses';
import { authService } from '../api/auth/authService';

const AuthContext = createContext();

const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch profile function
  const fetchProfile = async () => {
    try {
      // Chỉ fetch profile khi có token
      const token = getCookie('token');
      if (!token) {
        return null;
      }
      
      const profileData = await authService.getProfile();
      setProfile(profileData);
      return profileData;
    } catch (error) {
      // Silent error handling - không log error để tránh console spam
      // console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Kiểm tra token trong cookies
    const token = getCookie('token');
    const userData = getCookie('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Fetch profile data for complete user information
        fetchProfile();
        
        // Chỉ chuyển hướng khi cần thiết
        const currentPath = window.location.pathname;
        
        // Nếu đang ở trang login và đã đăng nhập
        if (currentPath === '/login') {
          if (parsedUser.role === "ADMIN") {
            window.location.href = '/admin/dashboard';
          } else if (parsedUser.role === "MANAGER") {
            window.location.href = '/manager/dashboard';
          } else {
            window.location.href = '/';
          }
        }
        
        // Nếu đang ở trang admin nhưng không phải admin
        if (currentPath.startsWith('/admin') && parsedUser.role !== "ADMIN") {
          window.location.href = '/';
        }
        
        // Nếu đang ở trang manager nhưng không phải manager
        if (currentPath.startsWith('/manager/dashboard') && parsedUser.role !== "MANAGER") {
          window.location.href = '/';
        }
        
        // Nếu đang ở trang menu nhưng là admin hoặc manager
        if (currentPath === '/') {
          if (parsedUser.role === "ADMIN") {
            window.location.href = '/admin/dashboard';
          } else if (parsedUser.role === "MANAGER") {
            window.location.href = '/manager/dashboard';
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        removeCookie('user');
        removeCookie('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password, rememberMe) => {
    try {
      console.log('Attempting login with:', { username });
      
      const data = await authService.login(username, password, rememberMe);
      console.log('API Response:', data);

      // Tạo user object từ response
      const userData = {
        username: data.username,
        role: data.role,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      };

      setUser(userData);
      
      // Lưu thông tin vào cookies
      setCookie('token', data.accessToken, 7); // Hết hạn sau 7 ngày
      setCookie('refreshToken', data.refreshToken, 7);
      setCookie('user', JSON.stringify(userData), 7);

      // Fetch profile data after login
      await fetchProfile();

      // Chuyển hướng dựa vào role
      if (userData.role === "ADMIN") {
        window.location.href = '/admin/dashboard';
      } else if (userData.role === "MANAGER") {
        window.location.href = '/manager/dashboard';
      } else {
        window.location.href = '/';
      }

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      removeCookie('token');
      removeCookie('user');
      removeCookie('refreshToken');
      window.location.href = '/login';
    }
  };

  const register = async (fullName, username, password, phoneNumber, email) => {
    try {
      const data = await authService.register(fullName, username, password, phoneNumber, email);
      console.log('Registration Response:', data);

      // Chỉ trả về data, không tự động đăng nhập
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.role === "ADMIN";
  };

  const isUser = () => {
    return user?.role === "USER";
  };

  const isManager = () => {
    return user?.role === "MANAGER";
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      loading, 
      login, 
      logout,
      register,
      fetchProfile,
      isAdmin, 
      isUser,
      isManager 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};