import React from 'react';
import styles from './ProfilePopup.module.css';
import { FaUserAlt } from "react-icons/fa";
import { TbInvoice, TbDownload } from "react-icons/tb";
import { MdPerson } from "react-icons/md";
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

const ProfilePopup = ({ profile: propProfile }) => {
  const { profile: authProfile, logout } = useAuth();
  const profile = propProfile || authProfile;
  if (!profile) return null;
  const avatar = profile.imgUrl && profile.imgUrl !== 'admin' ? profile.imgUrl : null;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.popup}>
      <div className={styles.avatarWrap}>
        {avatar ? (
          <img src={avatar} alt="avatar" className={styles.avatar} />
        ) : (
          <div className={styles.avatarDefault}>
            <MdPerson size={40} color="#bbb" />
          </div>
        )}
        <div className={styles.info}>
          <div className={styles.name}>{profile.fullName || profile.username || 'User'}</div>
          <div className={styles.email}>{profile.email}</div>
          <div className={styles.role}>{profile.role}</div>
        </div>
      </div>
      <div className={styles.menu}>
        <div className={styles.menuItem}>
          <FaUserAlt />
          <Link href="/profile">My Profile</Link>
        </div>
        <div className={styles.menuItem}>
          <TbInvoice />
          <Link href="/orders">My Orders</Link>
        </div>
        <div className={styles.menuItem} onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <TbDownload />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup; 