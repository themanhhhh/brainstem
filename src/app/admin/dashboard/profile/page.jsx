"use client"
import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import { MdPersonOutline, MdLockOutline } from 'react-icons/md';
import ChangePassword from './ChangePassword';
import LogoutButton from '@/app/components/LogoutButton/LogoutButton';

const menu = [
  { label: 'Account', desc: 'Manage your public profile and private information', icon: <MdPersonOutline className={styles.menuIcon} /> },
  { label: 'Security', desc: 'Manage your password and 2-step verification preferences', icon: <MdLockOutline className={styles.menuIcon} /> },
];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (err) {
        setError('Không thể tải thông tin người dùng.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading || !profile) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.container}><h1>Profile</h1><p>{error}</p></div>;

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
          <div className={styles.card}>
            <div className={styles.cardTitle}>Account</div>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" value={profile.fullName || ''} readOnly />
              </div>
              <div className={styles.formGroup}>
                <label>Username</label>
                <input type="text" value={profile.username || ''} readOnly />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" value={profile.email || ''} readOnly />
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input type="text" value={profile.phoneNumber || ''} readOnly />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <input type="text" value={profile.role || ''} readOnly />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <input type="text" value={profile.state || ''} readOnly />
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save</button>
              </div>
            </form>
          </div>
        )}
        {activeTab === 1 && (
          <ChangePassword onSubmit={async (current, next) => {
            // TODO: Gọi API đổi mật khẩu ở đây
            // await authService.changePassword(current, next);
          }} />
        )}
      </main>
      </div>
    </div>
  );
};

export default Profile;