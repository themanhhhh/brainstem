import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
<<<<<<< HEAD
import { useCart } from '../../../context/CartContext';
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
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01

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
<<<<<<< HEAD
=======
  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    imgUrl: ''
  });
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01

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
<<<<<<< HEAD
=======
    
    // Validate field immediately
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Họ tên là bắt buộc';
        } else if (value.trim().split(' ').length < 2) {
          error = 'Vui lòng nhập đầy đủ họ và tên';
        } else if (/[\d!@#$%^&*(),.?":{}|<>]/.test(value)) {
          error = 'Họ tên không được chứa số hoặc ký tự đặc biệt';
        }
        break;

      case 'email':
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!value.trim()) {
          error = 'Email là bắt buộc';
        } else if (!emailRegex.test(value)) {
          error = 'Email không hợp lệ';
        }
        break;

      case 'phoneNumber':
        if (value.trim()) {
          const phoneRegex = /^(0|\+84)([1-9][0-9]{8}|[1-9][0-9]{8})$/;
          if (!phoneRegex.test(value)) {
            error = 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)';
          }
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return !error;
  };

  const validateForm = () => {
    // Validate all fields
    const isFullNameValid = validateField('fullName', formData.fullName);
    const isEmailValid = validateField('email', formData.email);
    const isPhoneValid = validateField('phoneNumber', formData.phoneNumber);

    return isFullNameValid && isEmailValid && isPhoneValid;
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
<<<<<<< HEAD
        toast.error('Vui lòng chọn file ảnh hợp lệ', {
=======
        toast.error('Please select a valid image file', {
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
          duration: 3000,
          position: "top-center"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
<<<<<<< HEAD
        toast.error('Kích thước ảnh không được vượt quá 5MB', {
=======
        toast.error('Image size must not exceed 5MB', {
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
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
      
<<<<<<< HEAD
      toast.success('Ảnh đã được chọn thành công!', {
=======
      toast.success('Image selected successfully!', {
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
        duration: 2000,
        position: "top-right"
      });
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return formData.imgUrl;

    setUploadingImage(true);
    try {
<<<<<<< HEAD
      toast.loading("Đang upload ảnh...", { id: "upload-image" });
=======
      toast.loading('Uploading image...', { id: 'upload-image' });
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
      
      const imageUrl = await uploadToPinata(selectedImage);
      setFormData(prev => ({ ...prev, imgUrl: imageUrl }));
      
<<<<<<< HEAD
      toast.success("Upload ảnh thành công!", {
        id: "upload-image",
=======
      toast.success('Image uploaded successfully!', {
        id: 'upload-image',
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
        duration: 2000,
        position: "top-right"
      });
      
      return imageUrl;
    } catch (error) {
<<<<<<< HEAD
      console.error("Error uploading image:", error);
      const errorMessage = getErrorMessage(error, 'Không thể upload ảnh. Vui lòng thử lại!');
      toast.error(errorMessage, {
        id: "upload-image",
=======
      toast.error('Failed to upload image. Please try again.', {
        id: 'upload-image',
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
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
    
<<<<<<< HEAD
    // Validation
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ tên!', {
=======
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin!', {
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
        duration: 3000,
        position: "top-center"
      });
      return;
    }
<<<<<<< HEAD
    
    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email không đúng định dạng!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      toast.loading("Đang cập nhật thông tin...", { id: "update-profile" });
=======

    setLoading(true);
    
    try {
      toast.loading('Đang cập nhật thông tin...', { id: 'update-profile' });
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
      
      let imageUrl = formData.imgUrl;
      
      // Upload image if new image is selected
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const { fullName, phoneNumber, email } = formData;
<<<<<<< HEAD
      const response = await authService.updateProfile(fullName, phoneNumber, email, imageUrl);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật thông tin");
        toast.error(errorMessage, {
          id: "update-profile",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success('Thông tin đã được cập nhật thành công!', {
        id: "update-profile",
=======
      await authService.updateProfile(fullName, phoneNumber, email, imageUrl);
      
      toast.success('Cập nhật thông tin thành công!', {
        id: 'update-profile',
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
        duration: 3000,
        position: "top-center"
      });
      
      setSelectedImage(null);
      
      if (onProfileUpdated) {
<<<<<<< HEAD
        onProfileUpdated(); // Để fetch lại profile mới từ server
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMessage = getErrorMessage(err, 'Không thể cập nhật thông tin. Vui lòng thử lại!');
      toast.error(errorMessage, {
        id: "update-profile",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
=======
        onProfileUpdated();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại sau.', {
        id: 'update-profile',
        duration: 4000,
        position: "top-center"
      });
    }
    setLoading(false);
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
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
<<<<<<< HEAD
    
    toast.success('Form đã được reset!', {
=======
    toast.dismiss(); // Dismiss any active toasts
    
    toast.success('Form reset successfully', {
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
      duration: 2000,
      position: "top-right"
    });
  };

  return (
    <div className={styles.card}>
<<<<<<< HEAD
      <div className={styles.cardTitle}>Update Your Profile</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Avatar Upload Section */}
        <div className={styles.formGroup}>
          <label>Profile Avatar</label>
=======
      <div className={styles.cardTitle}>Cập nhật thông tin</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Avatar Upload Section */}
        <div className={styles.formGroup}>
          <label>Ảnh đại diện</label>
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
          <div className={styles.avatarUpload}>
            <div className={styles.avatarPreview}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile Preview" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
<<<<<<< HEAD
                  <span>No Image</span>
=======
                  <span>Chưa có ảnh</span>
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
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
<<<<<<< HEAD
                Choose Image
=======
                Chọn ảnh
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
              </label>
              {selectedImage && (
                <span className={styles.fileName}>{selectedImage.name}</span>
              )}
            </div>
          </div>
<<<<<<< HEAD
        </div>

        <div className={styles.formGroup}>
          <label>Full Name</label>
=======
          {errors.imgUrl && <span className={styles.errorMessage}>{errors.imgUrl}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Họ và tên *</label>
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
<<<<<<< HEAD
            required
            placeholder="Enter your full name"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
=======
            onBlur={(e) => validateField('fullName', e.target.value)}
            required
            placeholder="Nhập họ và tên"
            className={errors.fullName ? styles.errorInput : ''}
          />
          {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Email *</label>
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
<<<<<<< HEAD
            required
            placeholder="Enter your email"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Phone Number</label>
=======
            onBlur={(e) => validateField('email', e.target.value)}
            required
            placeholder="Nhập địa chỉ email"
            className={errors.email ? styles.errorInput : ''}
          />
          {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Số điện thoại</label>
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
<<<<<<< HEAD
            placeholder="Enter your phone number"
          />
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={resetForm}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading || uploadingImage}>
            {loading ? 'Saving...' : uploadingImage ? 'Uploading...' : 'Save'}
=======
            onBlur={(e) => validateField('phoneNumber', e.target.value)}
            placeholder="Nhập số điện thoại"
            className={errors.phoneNumber ? styles.errorInput : ''}
          />
          {errors.phoneNumber && <span className={styles.errorMessage}>{errors.phoneNumber}</span>}
          {!errors.phoneNumber && formData.phoneNumber && (
            <span className={styles.successMessage}>✓ Số điện thoại hợp lệ</span>
          )}
        </div>
        
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={resetForm}>
            Hủy
          </button>
          <button 
            type="submit" 
            className={styles.saveBtn} 
            disabled={loading || uploadingImage || Object.values(errors).some(error => error !== '')}
          >
            {loading ? 'Đang lưu...' : uploadingImage ? 'Đang tải ảnh...' : 'Lưu thay đổi'}
>>>>>>> 9d277b48c159f9883915c8f6dd946a0b464e3f01
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;