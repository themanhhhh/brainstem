import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';

const UpdateProfile = ({ profile, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);
    try {
      const { fullName, phoneNumber, email, address } = formData;
      await authService.updateProfile(fullName, phoneNumber, email, address);
      setMsg('Thông tin đã được cập nhật thành công!');
      if (onProfileUpdated) {
        onProfileUpdated(); // Để fetch lại profile mới từ server
      }
    } catch (err) {
      setError(err.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Update Your Profile</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />
        </div>
        {error && <div className={styles.formMsg} style={{color:'#e11d48'}}>{error}</div>}
        {msg && <div className={styles.formMsg}>{msg}</div>}
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={() => setFormData({
            fullName: profile.fullName || '',
            phoneNumber: profile.phoneNumber || '',
            email: profile.email || '',
            address: profile.address || ''
          })}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;