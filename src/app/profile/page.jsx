"use client"
import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
<<<<<<< HEAD
import { MdPersonOutline, MdLockOutline, MdInfoOutline } from 'react-icons/md';
=======
import { MdPersonOutline, MdLockOutline, MdInfoOutline, MdLocationOn, MdHistory, MdTableRestaurant } from 'react-icons/md';
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
import ChangePassword from './ChangePassword';
import LogoutButton from '@/app/components/LogoutButton/LogoutButton';
import UpdateProfile from './UpdateProfile';
import UserInfoCard from './UserInfoCard';
<<<<<<< HEAD
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};
=======
import AddressManager from './AddressManager';
import OrderHistory from './OrderHistory';
import TableReservationHistory from './TableReservationHistory';
import Navbar from '@/app/components/Navbar/Navbar';
import Footer from '@/app/components/Footer/Footer';
import { usePageProfileFetch } from '@/app/hooks/usePageProfileFetch';
import { Loader } from '@/app/components/componentsindex';
import toast from 'react-hot-toast';
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01

const menu = [
  { label: 'My Info', desc: 'View your detailed profile information', icon: <MdInfoOutline className={styles.menuIcon} /> },
  { label: 'Account', desc: 'Manage your public profile and private information', icon: <MdPersonOutline className={styles.menuIcon} /> },
  { label: 'Security', desc: 'Manage your password and 2-step verification preferences', icon: <MdLockOutline className={styles.menuIcon} /> },
<<<<<<< HEAD
];

const Profile = () => {
=======
  { label: 'Addresses', desc: 'Save and manage your delivery addresses', icon: <MdLocationOn className={styles.menuIcon} /> },
  { label: 'Order History', desc: 'View all your past orders and order status', icon: <MdHistory className={styles.menuIcon} /> },
  { label: 'Table Reservations', desc: 'View all your table reservations and booking history', icon: <MdTableRestaurant className={styles.menuIcon} /> },
];

const Profile = () => {
  // Use hook to fetch profile
  const { profile: contextProfile } = usePageProfileFetch('Profile Page');
  
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

<<<<<<< HEAD
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        
        // Kiểm tra lỗi từ response
        if (data && (data.code >= 400 || data.error || data.status >= 400)) {
          const errorMessage = getErrorMessage(data, "Không thể tải thông tin người dùng");
          toast.error(errorMessage, {
            duration: 4000,
            position: "top-center"
          });
          return;
        }
        
        setProfile(data);
        console.log("Profile loaded:", data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        const errorMessage = getErrorMessage(err, 'Không thể tải thông tin người dùng. Vui lòng thử lại!');
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
=======
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
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getProfile();
<<<<<<< HEAD
      
      // Kiểm tra lỗi từ response
      if (data && (data.code >= 400 || data.error || data.status >= 400)) {
        const errorMessage = getErrorMessage(data, "Không thể làm mới thông tin người dùng");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      setProfile(data);
      toast.success("Đã cập nhật thông tin người dùng!", {
=======
      setProfile(data);
      toast.success('Profile refreshed successfully!', {
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
        duration: 2000,
        position: "top-right"
      });
    } catch (err) {
<<<<<<< HEAD
      console.error("Error refreshing profile:", err);
      const errorMessage = getErrorMessage(err, 'Không thể làm mới thông tin người dùng. Vui lòng thử lại!');
      toast.error(errorMessage, {
=======
      console.error('Error refreshing profile:', err);
      toast.error('Failed to load user information. Please try again.', {
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  if (loading || !profile) return <div className={styles.loading}>Đang tải...</div>;

  // Xử lý avatar: nếu imgUrl là 'admin' thì dùng icon mặc định
=======
  if (loading || !profile) {
    return <Loader />;
  }

  // Handle avatar: if imgUrl is 'admin' then use default icon
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
  const avatar = profile.imgUrl && profile.imgUrl !== 'admin'
    ? profile.imgUrl
    : null;

<<<<<<< HEAD
  // Định dạng ngày
  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className={styles.settings}>
=======
  // Format date
  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  const isAdmin = profile.role === 'ADMIN';
  const isManager = profile.role === 'MANAGER';
  const isUser = profile.role === 'CUSTOMER';


  return (
    <div className={styles.settings}>
      <Navbar />
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
      <div className={styles.settingsLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.menuTitle}>Settings</div>
        <ul className={styles.menuList}>
<<<<<<< HEAD
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
=======
          {menu.map((item, idx) => {
            // Show all items except Order History and Table Reservations for admin/manager
            if ((isAdmin || isManager) && (item.label === 'Order History' || item.label === 'Table Reservations')) {
              return null;
            }
            // Show all items for regular users
            return (
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
            );
          })}
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
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
<<<<<<< HEAD
      </main>
      </div>
=======
        {activeTab === 3 && (
          <AddressManager />
        )}
        {activeTab === 4 && isUser && (
          <OrderHistory />
        )}
        {activeTab === 5 && isUser && (
          <TableReservationHistory />
        )}
      </main>
      </div>
      <Footer />
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
    </div>
  );
};

export default Profile;