'use client';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfileSync } from '../../hooks/useProfileSync';

export const ProfileSync = () => {
  const { disableAutoFetch } = useAuth();
  
  useEffect(() => {
    // Disable auto fetch từ AuthContext để tránh duplicate calls
    disableAutoFetch();
    console.log('🔧 ProfileSync component mounted - auto fetch disabled');
  }, [disableAutoFetch]);

  useProfileSync();
  return null; // Không render gì, chỉ thực hiện logic
}; 