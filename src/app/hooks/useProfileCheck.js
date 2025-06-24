'use client';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useProfileCheck = (pageName = 'Unknown Page') => {
  const { fetchProfile, user } = useAuth();

  useEffect(() => {
    console.log('🔍 useProfileCheck called on:', pageName);
    
    // Chỉ gọi fetchProfile nếu user đã đăng nhập
    if (user || (typeof window !== 'undefined' && document.cookie.includes('token='))) {
      console.log('🚀 Fetching profile for:', pageName);
      fetchProfile(true);
    } else {
      console.log('⚠️ No user/token, skipping profile check for:', pageName);
    }
  }, []); // Chỉ chạy 1 lần khi component mount

  return null;
}; 