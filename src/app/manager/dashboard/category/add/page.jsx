"use client";
import React, { useState } from 'react';
import styles from './add.module.css';
import { useLanguageService } from "../../../../hooks/useLanguageService";
import { useRouter } from 'next/navigation';
import { useCart } from '../../../../context/CartContext';

const AddCategoryPage = () => {
  const { categoryService, language } = useLanguageService();
  const router = useRouter();
  const { uploadToPinata, error, openError } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imgUrl: '',
    state: 'ACTIVE'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.description) {
        throw new Error('Please fill in all required fields');
      }

      let imgUrl = formData.imgUrl;
      if (formData.image) {
        imgUrl = await uploadToPinata(formData.image);
      }

      await categoryService.addCategory({
        name: formData.name,
        description: formData.description,
        imgUrl,
        state: formData.state
      });

      alert('Category added successfully!');
      router.push('/admin/dashboard/category');
    } catch (error) {
      console.error('Error adding category:', error);
      alert(error.message || 'Failed to add category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter category name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter category description"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Status:</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Adding...' : 'Add Category'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/admin/dashboard/category')}
          >
            Cancel
          </button>
        </div>

        {openError && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default AddCategoryPage;