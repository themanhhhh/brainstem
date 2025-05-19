"use client";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import {
  MdNotifications,
  MdOutlineChat,
  MdPublic,
  MdSearch,
} from "react-icons/md";
import { useEffect, useState, useRef } from "react";
import { authService } from "@/app/api/auth/authService";
import ProfilePopup from "@/app/components/Navbar/Profile/ProfilePopup";

const Navbar = () => {
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (error) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{pathname.split("/").pop()}</div>
      <div className={styles.menu}>
        <div className={styles.icons}>
          <MdOutlineChat size={20} />
          <MdNotifications size={20} />
          <MdPublic size={20} />
        </div>
        {/* Avatar + Profile menu */}
        <div className={styles.avatarWrapper} ref={avatarRef}>
          <div
            className={styles.avatarWrapper}
            onClick={() => setShowProfileMenu((v) => !v)}
          >
            {profile && profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="avatar"
                className={styles.avatarImg}
              />
            ) : (
              <MdPublic size={36} className={styles.avatarImg} />
            )}
            {profile && (
              <span className={styles.userName}>{profile.fullName || profile.username}</span>
            )}
          </div>
          {showProfileMenu && (
            <div className={styles.profileMenu}>
              <ProfilePopup profile={profile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;