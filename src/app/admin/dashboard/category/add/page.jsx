"use client";
import React, { useState } from 'react';
import styles from './add.module.css';
import { useLanguageService } from "../../../../hooks/useLanguageService";
import { useRouter } from 'next/navigation';
import { mockData } from '../../../../data/mockData';
import toast from "react-hot-toast";

const AddLeadPage = () => {
  const { language } = useLanguageService();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SDT: '',
    NgaySinh: '',
    GioiTinh: 'Nam',
    TrangThai: 'INTERESTED',
    MaCD: ''
  });

  // Validation functions
  const validateHoTen = (value) => {
    if (!value.trim()) return 'Họ tên là bắt buộc';
    if (value.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    return '';
  };

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email là bắt buộc';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Email không hợp lệ';
    return '';
  };

  const validateSDT = (value) => {
    if (!value.trim()) return 'Số điện thoại là bắt buộc';
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Số điện thoại không hợp lệ';
    return '';
  };

  const validateNgaySinh = (value) => {
    if (!value) return 'Ngày sinh là bắt buộc';
    const birthDate = new Date(value);
    const today = new Date();
    if (birthDate > today) return 'Ngày sinh không thể là ngày tương lai';
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 5 || age > 100) return 'Tuổi phải từ 5 đến 100';
    return '';
  };

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'HoTen':
        return validateHoTen(value);
      case 'Email':
        return validateEmail(value);
      case 'SDT':
        return validateSDT(value);
      case 'NgaySinh':
        return validateNgaySinh(value);
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'TrangThai' && key !== 'GioiTinh' && key !== 'MaCD') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Vui lòng sửa các lỗi validation trước khi gửi');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new lead data
      const newLead = {
        MaHVTN: mockData.hocVienTiemNang.length + 1,
        HoTen: formData.HoTen,
        Email: formData.Email,
        SDT: formData.SDT,
        NgaySinh: formData.NgaySinh,
        GioiTinh: formData.GioiTinh,
        TrangThai: formData.TrangThai,
        MaCD: formData.MaCD ? parseInt(formData.MaCD) : null,
        NgayDangKy: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Success case
      toast.success('Đã thêm học viên tiềm năng thành công!');
      router.push('/admin/dashboard/category');
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Không thể thêm học viên tiềm năng. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Thêm Học viên Tiềm năng mới</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Họ tên:</label>
          <input
            type="text"
            name="HoTen"
            value={formData.HoTen}
            onChange={handleChange}
            placeholder="Nhập họ tên đầy đủ"
            className={errors['HoTen'] ? styles.errorInput : ''}
          />
          {errors['HoTen'] && <span className={styles.errorText}>{errors['HoTen']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            placeholder="Nhập địa chỉ email"
            className={errors['Email'] ? styles.errorInput : ''}
          />
          {errors['Email'] && <span className={styles.errorText}>{errors['Email']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Số điện thoại:</label>
          <input
            type="tel"
            name="SDT"
            value={formData.SDT}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            className={errors['SDT'] ? styles.errorInput : ''}
          />
          {errors['SDT'] && <span className={styles.errorText}>{errors['SDT']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Ngày sinh:</label>
          <input
            type="date"
            name="NgaySinh"
            value={formData.NgaySinh}
            onChange={handleChange}
            className={errors['NgaySinh'] ? styles.errorInput : ''}
          />
          {errors['NgaySinh'] && <span className={styles.errorText}>{errors['NgaySinh']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Giới tính:</label>
          <select
            name="GioiTinh"
            value={formData.GioiTinh}
            onChange={handleChange}
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Trạng thái:</label>
          <select
            name="TrangThai"
            value={formData.TrangThai}
            onChange={handleChange}
          >
            <option value="INTERESTED">Quan tâm</option>
            <option value="CONTACTED">Đã liên hệ</option>
            <option value="QUALIFIED">Đủ điều kiện</option>
            <option value="CONVERTED">Đã chuyển đổi</option>
            <option value="LOST">Mất liên lạc</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Chiến dịch:</label>
          <select
            name="MaCD"
            value={formData.MaCD}
            onChange={handleChange}
          >
            <option value="">Chọn chiến dịch</option>
            {mockData.chienDich.map(campaign => (
              <option key={campaign.MaCD} value={campaign.MaCD}>
                {campaign.TenCD}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Đang thêm...' : 'Thêm Học viên Tiềm năng'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/admin/dashboard/category')}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLeadPage;