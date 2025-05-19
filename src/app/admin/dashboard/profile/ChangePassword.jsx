import React, { useState } from 'react';
import styles from './profile.module.css';

const ChangePassword = ({ onSubmit }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      if (onSubmit) await onSubmit(current, next);
      setMsg('Đổi mật khẩu thành công!');
      setCurrent('');
      setNext('');
    } catch (err) {
      setMsg('Đổi mật khẩu thất bại!');
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
          <span className={styles.inputHint}>
            Minimum 8 characters. Must include numbers, letters and special characters.
          </span>
        </div>
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