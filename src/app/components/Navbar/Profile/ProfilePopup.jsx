import React from 'react';
import styles from './ProfilePopup.module.css';
import { MdPerson } from 'react-icons/md';
import Link from 'next/link';

const ProfilePopup = ({ profile }) => {
  if (!profile) return null;
  const avatar = profile.imgUrl && profile.imgUrl !== 'admin' ? profile.imgUrl : null;
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
          <div className={styles.name}>{profile.fullName || profile.username}</div>
          <div className={styles.email}>{profile.email}</div>
          <div className={styles.role}>{profile.role}</div>
        </div>
      </div>
      <Link href="/admin/dashboard/profile" passHref legacyBehavior>
       Xem chi tiết
      </Link>
    </div>
  );
};

export default ProfilePopup; 