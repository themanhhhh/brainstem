"use client"
import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import { MdPersonOutline, MdLockOutline, MdInfoOutline } from 'react-icons/md';
import ChangePassword from './ChangePassword';
import LogoutButton from '@/app/components/LogoutButton/LogoutButton';
import UpdateProfile from './UpdateProfile';
import UserInfoCard from './UserInfoCard';
import toast from "react-hot-toast";

const menu = [
  { label: 'My Info', desc: 'View your detailed profile information', icon: <MdInfoOutline className={styles.menuIcon} /> },
  { label: 'Account', desc: 'Manage your public profile and private information', icon: <MdPersonOutline className={styles.menuIcon} /> },
  { label: 'Security', desc: 'Manage your password and 2-step verification preferences', icon: <MdLockOutline className={styles.menuIcon} /> },
];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
        toast.success("Đã tải thông tin người dùng thành công!", {
          duration: 2000,
          position: "top-right"
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error('Không thể tải thông tin người dùng. Vui lòng thử lại!', {
          duration: 4000,
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getProfile();
      setProfile(data);
      toast.success("Đã cập nhật thông tin người dùng!", {
        duration: 2000,
        position: "top-right"
      });
    } catch (err) {
      console.error("Error refreshing profile:", err);
      toast.error('Không thể làm mới thông tin người dùng. Vui lòng thử lại!', {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) return <div className={styles.loading}>Đang tải...</div>;

  // Xử lý avatar: nếu imgUrl là 'admin' thì dùng icon mặc định
  const avatar = profile.imgUrl && profile.imgUrl !== 'admin'
    ? profile.imgUrl
    : null;

  // Định dạng ngày
  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className={styles.settings}>
      <div className={styles.settingsHeader}>
        <h1>Settings</h1>
        <LogoutButton />
      </div>
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
      </main>
      </div>
    </div>
  );
};

export default Profile;