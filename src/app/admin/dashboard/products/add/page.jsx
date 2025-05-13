"use client";
import React, { useState, useEffect } from "react";
import styles from "./add.module.css";
import { foodService } from "../../../../api/food/foodService";
import { useRouter } from "next/navigation";
import { useCart } from "../../../../context/CartContext";

const AddFoodPage = () => {
  const router = useRouter();
  const { uploadToPinata, error, openError } = useCart();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    imgUrl: '',
    categoryId: '',
    foodState: 'AVAILABLE',
    quantity: 1
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await foodService.getCategories(0, itemsPerPage);
      const categoryData = Array.isArray(response) ? response : response.data || [];
      setCategories(categoryData);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

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
      const price = parseFloat(formData.price);
      if (isNaN(price)) {
        throw new Error('Price must be a valid number');
      }

      if (!formData.name || !formData.description || !formData.categoryId) {
        throw new Error('Please fill in all required fields');
      }

      let imgUrl = formData.imgUrl;
      if (formData.image) {
        imgUrl = await uploadToPinata(formData.image);
      }

      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity < 0) {
        throw new Error('Quantity must be a valid positive number');
      }

      await foodService.addFood(
        formData.name,
        formData.description,
        price,
        imgUrl,
        formData.categoryId,
        formData.foodState,
        quantity
      );

      alert('Food item added successfully!');
      router.push('/admin/dashboard/products');
    } catch (error) {
      console.error('Error adding food:', error);
      alert(error.message || 'Failed to add food. Please try again.');
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
            placeholder="Enter food name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter food description"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
            step="0.1"
            min="0"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            min="0"
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
          <label>Category:</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Status:</label>
          <select
            name="foodState"
            value={formData.foodState}
            onChange={handleChange}
            required
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="INAVAILABLE">INAVAILABLE</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Adding...' : 'Add Food'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/admin/dashboard/products')}
          >
            Cancel
          </button>
        </div>

        {openError && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default AddFoodPage;