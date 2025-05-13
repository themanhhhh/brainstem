"use client";
import React, { useState, useEffect } from "react";
import styles from "./add.module.css";
import { foodService } from "../../../../api/food/foodService";
import { useRouter } from "next/navigation";

const AddFoodPage = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imgUrl: '',
    categoryId: '',
    foodState: 'ACTIVE'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await foodService.getCategories();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const price = parseFloat(formData.price);
      if (isNaN(price)) {
        throw new Error('Price must be a valid number');
      }

     
      if (!formData.name || !formData.description || !formData.imgUrl || !formData.categoryId) {
        throw new Error('Please fill in all required fields');
      }

      await foodService.addFood(
        formData.name,
        formData.description,
        price,
        formData.imgUrl,
        formData.categoryId,
        formData.foodState
      );

    
      alert('Food item added successfully!');
      
      // Redirect to products page
      router.push('/admin/dashboard/products');
    } catch (error) {
      console.error('Error adding food:', error);
      alert(error.message || 'Failed to add food. Please try again.');
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
          <label>Image URL:</label>
          <input
            type="text"
            name="imgUrl"
            value={formData.imgUrl}
            onChange={handleChange}
            placeholder="Enter image URL"
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
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>Add Food</button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/admin/dashboard/products')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFoodPage;