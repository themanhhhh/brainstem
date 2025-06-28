import React, { useState } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import toast from "react-hot-toast";

const ChangePassword = () => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!current.trim()) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    if (next.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    if (next !== confirm) {
      toast.error('Mật khẩu mới và xác nhận không khớp!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    setLoading(true);
    try {
      toast.loading("Đang đổi mật khẩu...", { id: "change-password" });
      
      await authService.changePassword(current, next, confirm);
      
      toast.success('Đổi mật khẩu thành công!', {
        id: "change-password",
        duration: 3000,
        position: "top-center"
      });
      
      // Reset form
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại!', {
        id: "change-password",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Change your password</div>
      <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
        <div className={styles.formGroup}>
          <label>Current password</label>
          <input
            type="password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            required
            minLength={6}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </div>
        <div className={styles.formGroup}>
          <label>New password</label>
          <input
            type="password"
            value={next}
            onChange={e => setNext(e.target.value)}
            required
            minLength={8}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Confirm new password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={8}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          <span className={styles.inputHint}>
            Minimum 8 characters. Must include numbers, letters and special characters.
          </span>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword; 