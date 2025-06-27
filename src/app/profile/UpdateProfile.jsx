import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const UpdateProfile = ({ profile, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    imgUrl: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const { uploadToPinata } = useCart();

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        imgUrl: profile.imgUrl || ''
      });
      setImagePreview(profile.imgUrl || '');
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file', {
          duration: 3000,
          position: "top-center"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must not exceed 5MB', {
          duration: 3000,
          position: "top-center"
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setImagePreview(result);
        }
      };
      reader.readAsDataURL(file);
      
      toast.success('Image selected successfully!', {
        duration: 2000,
        position: "top-right"
      });
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return formData.imgUrl;

    setUploadingImage(true);
    try {
      toast.loading('Uploading image...', { id: 'upload-image' });
      
      const imageUrl = await uploadToPinata(selectedImage);
      setFormData(prev => ({ ...prev, imgUrl: imageUrl }));
      
      toast.success('Image uploaded successfully!', {
        id: 'upload-image',
        duration: 2000,
        position: "top-right"
      });
      
      return imageUrl;
    } catch (error) {
      toast.error('Failed to upload image. Please try again.', {
        id: 'upload-image',
        duration: 4000,
        position: "top-center"
      });
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      toast.loading('Updating profile...', { id: 'update-profile' });
      
      let imageUrl = formData.imgUrl;
      
      // Upload image if new image is selected
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const { fullName, phoneNumber, email } = formData;
      await authService.updateProfile(fullName, phoneNumber, email, imageUrl);
      
      toast.success('Profile updated successfully!', {
        id: 'update-profile',
        duration: 3000,
        position: "top-center"
      });
      
      setSelectedImage(null);
      
      if (onProfileUpdated) {
        onProfileUpdated(); // To fetch updated profile from server
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Failed to update profile. Please try again later.', {
        id: 'update-profile',
        duration: 4000,
        position: "top-center"
      });
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
      email: profile.email || '',
      imgUrl: profile.imgUrl || ''
    });
    setSelectedImage(null);
    setImagePreview(profile.imgUrl || '');
    toast.dismiss(); // Dismiss any active toasts
    
    toast.success('Form reset successfully', {
      duration: 2000,
      position: "top-right"
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Update Your Profile</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Avatar Upload Section */}
        <div className={styles.formGroup}>
          <label>Profile Avatar</label>
          <div className={styles.avatarUpload}>
            <div className={styles.avatarPreview}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile Preview" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <span>No Image</span>
                </div>
              )}
            </div>
            <div className={styles.avatarUploadControls}>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              <label htmlFor="avatar" className={styles.uploadBtn}>
                Choose Image
              </label>
              {selectedImage && (
                <span className={styles.fileName}>{selectedImage.name}</span>
              )}
            </div>
          </div>
        </div>

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
        
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={resetForm}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading || uploadingImage}>
            {loading ? 'Saving...' : uploadingImage ? 'Uploading...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;