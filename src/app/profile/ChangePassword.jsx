import React, { useState } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';

const ChangePassword = () => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (next !== confirm) {
      setError('Mật khẩu mới và xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(current, next, confirm);
      setMsg('Đổi mật khẩu thành công!');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại!');
    }
    setLoading(false);
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
        {error && <div className={styles.formMsg} style={{color:'#e11d48'}}>{error}</div>}
        {msg && <div className={styles.formMsg}>{msg}</div>}
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