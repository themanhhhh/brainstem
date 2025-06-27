"use client"
import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import { MdPersonOutline, MdLockOutline, MdInfoOutline, MdLocationOn, MdHistory } from 'react-icons/md';
import ChangePassword from './ChangePassword';
import LogoutButton from '@/app/components/LogoutButton/LogoutButton';
import UpdateProfile from './UpdateProfile';
import UserInfoCard from './UserInfoCard';
import AddressManager from './AddressManager';
import OrderHistory from './OrderHistory';
import Navbar from '@/app/components/Navbar/Navbar';
import Footer from '@/app/components/Footer/Footer';
import { usePageProfileFetch } from '@/app/hooks/usePageProfileFetch';
import toast from 'react-hot-toast';

const menu = [
  { label: 'My Info', desc: 'View your detailed profile information', icon: <MdInfoOutline className={styles.menuIcon} /> },
  { label: 'Account', desc: 'Manage your public profile and private information', icon: <MdPersonOutline className={styles.menuIcon} /> },
  { label: 'Security', desc: 'Manage your password and 2-step verification preferences', icon: <MdLockOutline className={styles.menuIcon} /> },
  { label: 'Addresses', desc: 'Save and manage your delivery addresses', icon: <MdLocationOn className={styles.menuIcon} /> },
  { label: 'Order History', desc: 'View all your past orders and order status', icon: <MdHistory className={styles.menuIcon} /> },
];

const Profile = () => {
  // Use hook to fetch profile
  const { profile: contextProfile } = usePageProfileFetch('Profile Page');
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Only sync profile from context, no fallback fetch
  useEffect(() => {
    if (contextProfile) {
      setProfile(contextProfile);
      setLoading(false);
    } else {
      // If no contextProfile yet, wait for hook to fetch
      setLoading(true);
    }
  }, [contextProfile]);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getProfile();
      setProfile(data);
      toast.success('Profile refreshed successfully!', {
        duration: 2000,
        position: "top-right"
      });
    } catch (err) {
      console.error('Error refreshing profile:', err);
      toast.error('Failed to load user information. Please try again.', {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    );
  }

  // Handle avatar: if imgUrl is 'admin' then use default icon
  const avatar = profile.imgUrl && profile.imgUrl !== 'admin'
    ? profile.imgUrl
    : null;

  // Format date
  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className={styles.settings}>
      <Navbar />
      <div className={styles.settingsLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.menuTitle}>Settings</div>
        <ul className={styles.menuList}>
          {menu.map((item, idx) => (
            <li
              key={item.label}
              className={activeTab === idx ? styles.active : ''}
              onClick={() => setActiveTab(idx)}
            >
              {item.icon}
              <div>
                <div className={styles.menuLabel}>{item.label}</div>
                <div className={styles.menuDesc}>{item.desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className={styles.content}>
        {activeTab === 0 && (
          <UserInfoCard profile={profile} />
        )}
        {activeTab === 1 && (
          <UpdateProfile profile={profile} onProfileUpdated={refreshProfile} />
        )}
        {activeTab === 2 && (
          <ChangePassword />
        )}
        {activeTab === 3 && (
          <AddressManager />
        )}
        {activeTab === 4 && (
          <OrderHistory />
        )}
      </main>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;