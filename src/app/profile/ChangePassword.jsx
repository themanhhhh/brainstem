import React, { useState } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (next !== confirm) {
      toast.error('New password and confirmation do not match!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    if (next.length < 8) {
      toast.error('New password must be at least 8 characters long!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    setLoading(true);
    try {
      toast.loading('Changing password...', { id: 'change-password' });
      
      await authService.changePassword(current, next, confirm);
      
      toast.success('Password changed successfully!', {
        id: 'change-password',
        duration: 3000,
        position: "top-center"
      });
      
      // Clear form
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error(err.message || 'Failed to change password. Please try again.', {
        id: 'change-password',
        duration: 4000,
        position: "top-center"
      });
    }
    setLoading(false);
  };

  const resetForm = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    toast.dismiss(); // Dismiss any active toasts
    
    toast.success('Form cleared', {
      duration: 1500,
      position: "top-right"
    });
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
          <button type="button" className={styles.cancelBtn} onClick={resetForm}>
            Clear
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword; 