// src/app/context/AuthContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authResponses, userResponses } from '../data/apiResponses';
import { authService } from '../api/auth/authService';
import toast from 'react-hot-toast';

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

const clearAllAuthCookies = () => {
  removeCookie('token');
  removeCookie('user');
  removeCookie('refreshToken');
  // Xoá thêm các cookie khác có thể tồn tại
  removeCookie('session');
  removeCookie('auth');
  removeCookie('remember_me');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileFetched, setProfileFetched] = useState(false); // Để tránh fetch profile liên tục
  const [isRedirecting, setIsRedirecting] = useState(false); // Để tránh redirect liên tục
  const [autoFetchDisabled, setAutoFetchDisabled] = useState(false); // Để tắt auto fetch khi có ProfileSync
  const router = useRouter();

  // Fetch profile function
  const fetchProfile = async (forceRefetch = false) => {
    console.log('🔍 fetchProfile called with forceRefetch:', forceRefetch);
    try {
      // Chỉ fetch profile khi có token
      const token = getCookie('token');
      if (!token) {
        console.log('⚠️ No token found, skipping profile fetch');
        setProfileFetched(true);
        return null;
      }
      
      // Tránh fetch liên tục nếu đã fetch rồi và không force
      if (profileFetched && !forceRefetch) {
        console.log('⚠️ Profile already fetched, returning cached data');
        return profile;
      }
      
      console.log('📡 Calling authService.getProfile()...');
      const profileData = await authService.getProfile();
      console.log('✅ Profile fetched successfully:', profileData);
      setProfile(profileData);
      setProfileFetched(true);
      return profileData;
    } catch (error) {
      console.log('❌ Error in fetchProfile:', error);
      // Log error cho việc debug, nhưng chỉ log thông tin quan trọng
      console.error('Error fetching profile:', {
        status: error?.response?.status || error?.status,
        message: error?.message,
        error: error,
        currentPath: window.location.pathname
      });
      setProfileFetched(true);
      
      // Tránh redirect liên tục
      if (isRedirecting) {
        console.log('⚠️ Already redirecting, skipping...');
        return null;
      }
      
      // Khi fetchProfile thất bại, clear token và user data
      const currentPath = window.location.pathname;
      console.log('🔍 Checking error type for path:', currentPath);
      
      // Xử lý cụ thể cho "Invalid token" - logout và điều hướng về trang chủ
      console.log('🔍 Checking for Invalid token:', {
        messageIncludes: error?.message?.includes('Invalid token'),
        responseDataError: error?.response?.data?.error,
        responseDataMessage: error?.response?.data?.message,
        errorField: error?.error,
        stringCheck: (typeof error === 'string' && error.includes('Invalid token'))
      });
      
      if (error?.message?.includes('Invalid token') || 
          error?.response?.data?.error === 'Invalid token' ||
          error?.response?.data?.message === 'Invalid token' ||
          error?.error === 'Invalid token' ||
          (typeof error === 'string' && error.includes('Invalid token'))) {
        console.log('🚨 Invalid token detected, logging out and redirecting to homepage');
        
        // Hiển thị thông báo cho user
        toast.error('Phiên đăng nhập không hợp lệ! Hệ thống sẽ đăng xuất bạn.', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#ff4444',
            color: 'white',
            fontWeight: '500',
          },
        });
        
        setIsRedirecting(true);
        setUser(null);
        setProfile(null);
        setProfileFetched(false);
        
        // Thực hiện logout trước khi redirect (nếu có refreshToken)
        const refreshToken = getCookie('refreshToken');
        console.log('Debug - RefreshToken available:', !!refreshToken);
        
        if (refreshToken) {
          try {
            console.log('Attempting to logout via API with refreshToken:', refreshToken.substring(0, 20) + '...');
            const logoutResult = await authService.logout();
            console.log('Logout API completed successfully:', logoutResult);
            
            // Thông báo nhỏ cho biết đã logout server-side
            toast.success('Đã đăng xuất khỏi server', {
              duration: 1500,
              position: 'top-right',
              style: {
                fontSize: '12px',
                background: '#28a745',
                color: 'white',
              },
            });
          } catch (logoutError) {
            console.warn('Logout API failed during invalid token handling:', {
              error: logoutError,
              message: logoutError.message,
              status: logoutError.status
            });
            // Tiếp tục xử lý dù logout API thất bại
          }
        } else {
          console.log('No refreshToken found, skipping logout API call');
        }
        
        clearAllAuthCookies();
        
        // Luôn chuyển về trang chủ khi gặp Invalid token (delay để user thấy thông báo)
        setTimeout(() => {
          window.location.href = '/';
        }, 3500); // Tăng thời gian để user đọc thông báo
        return null;
      }
      
      // Nếu là lỗi 401 (Unauthorized) hoặc token không hợp lệ, chuyển về login
      if (error?.response?.status === 401 || error?.status === 401 || 
          error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        
        // Hiển thị thông báo cho user
        toast.error('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#ff6b6b',
            color: 'white',
            fontWeight: '500',
          },
        });
        
        setIsRedirecting(true);
        setUser(null);
        setProfile(null);
        clearAllAuthCookies();
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 3500);
        return null;
      }
      
      // Nếu đang ở trang protected (admin/manager) thì chuyển về login
      if (currentPath.startsWith('/admin') || currentPath.startsWith('/manager')) {
        
        // Hiển thị thông báo cho user
        toast.error('Bạn không có quyền truy cập! Hệ thống sẽ chuyển về trang đăng nhập.', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#ff8c00',
            color: 'white',
            fontWeight: '500',
          },
        });
        
        setIsRedirecting(true);
        setUser(null);
        setProfile(null);
        clearAllAuthCookies();
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 3500);
        return null;
      }
      
      // Với các lỗi khác, chỉ chuyển về trang chủ nếu không phải đang ở trang chủ hoặc login
      if (currentPath !== '/' && currentPath !== '/login') {
        
        // Hiển thị thông báo cho user
        toast.error('Có lỗi xảy ra với phiên đăng nhập! Hệ thống sẽ chuyển về trang chủ.', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#666',
            color: 'white',
            fontWeight: '500',
          },
        });
        
        setIsRedirecting(true);
        setUser(null);
        setProfile(null);
        clearAllAuthCookies(); // Xoá tất cả cookie liên quan đến auth
        
        setTimeout(() => {
          window.location.href = '/';
        }, 3500);
      }
      
      return null;
    }
  };

  useEffect(() => {
    // Reset redirect flag khi component mount
    setIsRedirecting(false);
    
    // Kiểm tra token trong cookies
    const token = getCookie('token');
    const userData = getCookie('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Fetch profile data for complete user information (chỉ khi không có ProfileSync)
        if (!autoFetchDisabled) {
          console.log('🚀 Calling fetchProfile from useEffect...');
          fetchProfile();
        } else {
          console.log('⚠️ Auto fetch disabled, skipping fetchProfile from useEffect');
        }
        
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
        clearAllAuthCookies(); // Xoá tất cả cookie khi parse thất bại
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
      setIsRedirecting(false); // Reset redirect flag khi login thành công
      
      // Lưu thông tin vào cookies
      setCookie('token', data.accessToken, 7); // Hết hạn sau 7 ngày
      setCookie('refreshToken', data.refreshToken, 7);
      setCookie('user', JSON.stringify(userData), 7);

      // Fetch profile data after login
      console.log('🚀 Calling fetchProfile after login...');
      await fetchProfile(true);

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
      // Hiển thị thông báo đăng xuất thành công
      toast.success('Đăng xuất thành công!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#4caf50',
          color: 'white',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Hiển thị thông báo lỗi khi logout
      toast.error('Có lỗi khi đăng xuất, nhưng bạn đã được đăng xuất khỏi hệ thống.', {
        duration: 2000,
        position: 'top-center',
      });
    } finally {
      setUser(null);
      setProfile(null);
      setProfileFetched(false); // Reset để có thể fetch lại cho user mới
      setIsRedirecting(false); // Reset redirect flag
      clearAllAuthCookies(); // Xoá tất cả cookie khi logout
      
      // Delay để user thấy thông báo
      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);
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

  const disableAutoFetch = () => {
    console.log('🔧 Auto fetch disabled');
    setAutoFetchDisabled(true);
  };

  const enableAutoFetch = () => {
    console.log('🔧 Auto fetch enabled');
    setAutoFetchDisabled(false);
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
      isManager,
      disableAutoFetch,
      enableAutoFetch
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