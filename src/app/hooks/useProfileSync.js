'use client';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export const useProfileSync = () => {
  const { fetchProfile, user } = useAuth();
  const pathname = usePathname();
  const timeoutRef = useRef(null);

  useEffect(() => {
    console.log('🔄 useProfileSync triggered on page:', pathname);
    
    // Clear timeout cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce để tránh gọi quá nhiều lần
    timeoutRef.current = setTimeout(() => {
      // Chỉ gọi fetchProfile nếu user đã đăng nhập (có token)
      if (user || (typeof window !== 'undefined' && document.cookie.includes('token='))) {
        console.log('🚀 Calling fetchProfile from useProfileSync for page:', pathname);
        fetchProfile(true); // Force refetch để đảm bảo luôn check
      } else {
        console.log('⚠️ No user/token found, skipping fetchProfile on page:', pathname);
      }
    }, 300); // Delay 300ms

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, fetchProfile, user]);

  return null; // Hook này không return UI
}; 