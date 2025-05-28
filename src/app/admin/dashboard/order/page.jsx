"use client";
import React, { useState, useEffect, useRef } from "react";
import ordertableService from "../../../api/ordertable/ordertableService";
import styles from "./order.module.css";

const Page = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [successFadeOut, setSuccessFadeOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const successTimeoutRef = useRef(null);
  const fadeTimeoutRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    description: '',
    phoneNumber: '',
    periodType: 'LUNCH',
    tableId: '',
    orderTime: ''
  });

  // Fetch available tables for selection
  const fetchTables = async () => {
    try {
      setTablesLoading(true);
      console.log('Fetching active tables...');
      const response = await ordertableService.getActiveTable(0, 100);
      console.log('API Response:', response);
      
      // API returns array directly, not in response.data
      if (response && Array.isArray(response)) {
        setTables(response);
        console.log('Tables loaded:', response.length);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Fallback in case API structure changes
        setTables(response.data);
        console.log('Tables loaded from data field:', response.data.length);
      } else {
        console.log('Invalid response format:', response);
        setTables([]);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError('Failed to load available tables');
      setTables([]);
    } finally {
      setTablesLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  // Auto-hide success message after 3 seconds with fade animation
  const setSuccessWithAutoHide = (message) => {
    setSuccess(message);
    setSuccessFadeOut(false);
    
    // Clear any existing timeouts
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    
    // Start fade out after 2.5 seconds
    successTimeoutRef.current = setTimeout(() => {
      setSuccessFadeOut(true);
      
      // Completely hide after fade animation (0.5s)
      fadeTimeoutRef.current = setTimeout(() => {
        setSuccess(null);
        setSuccessFadeOut(false);
      }, 500);
    }, 2500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user types
    if (error) setError(null);
    if (success) {
      setSuccess(null);
      setSuccessFadeOut(false);
      // Clear timeout if user starts typing
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.fullName.trim()) {
      setError('Please enter full name');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Please enter phone number');
      return false;
    }
    if (!formData.tableId) {
      setError('Please select a table');
      return false;
    }
    if (!formData.orderTime) {
      setError('Please select order time');
      return false;
    }
    if (formData.description.trim().length < 5) {
      setError('Description must be at least 5 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Show confirmation modal instead of directly creating order
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async (confirmed) => {
    setShowConfirmModal(false);
    
    if (!confirmed) {
      // User cancelled - create order with CANCELLED status
      await createOrder('CANCELLED');
      return;
    }

    // User confirmed - create order with SUCCESS status
    await createOrder('SUCCESS');
  };

  const createOrder = async (orderTableState) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formattedDateTime = formatDateTimeForAPI(formData.orderTime);
      console.log('Original orderTime:', formData.orderTime);
      console.log('Formatted orderTime:', formattedDateTime);
      
      const response = await ordertableService.createOrder(
        formData.email,
        formData.fullName,
        formData.description,
        formData.phoneNumber,
        formData.periodType,
        parseInt(formData.tableId),
        formattedDateTime,
        orderTableState
      );

      if (response) {
        const statusMessage = orderTableState === 'SUCCESS' 
          ? 'Order created successfully!' 
          : 'Order cancelled successfully!';
        setSuccessWithAutoHide(statusMessage);
        
        // Reset form
        setFormData({
          email: '',
          fullName: '',
          description: '',
          phoneNumber: '',
          periodType: 'LUNCH',
          tableId: '',
          orderTime: ''
        });
        // Refresh tables
        fetchTables();
      }
    } catch (err) {
      setError(err.message || 'Failed to create order');
      console.error("Error creating order:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get current datetime for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  
  const formatDateTimeForAPI = (dateTimeLocal) => {
    if (!dateTimeLocal) return '';
    
   
    const date = new Date(dateTimeLocal);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Order Table</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div className={`${styles.success} ${successFadeOut ? styles.fadeOut : ''}`}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.orderForm}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter customer email"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="fullName" className={styles.label}>Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter customer full name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>Phone Number *</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter phone number"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tableId" className={styles.label}>Select Table *</label>
          <select
            id="tableId"
            name="tableId"
            value={formData.tableId}
            onChange={handleInputChange}
            className={styles.select}
            required
            disabled={tablesLoading}
          >
            <option value="">
              {tablesLoading ? 'Loading tables...' : 'Choose a table'}
            </option>
            {!tablesLoading && tables.length > 0 ? (
              tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} - {table.numberOfChair} chairs ({table.state})
                </option>
              ))
            ) : !tablesLoading && tables.length === 0 ? (
              <option value="" disabled>No available tables</option>
            ) : null}
          </select>
          {tablesLoading && (
            <small className={styles.loadingText}>Loading available tables...</small>
          )}
          {!tablesLoading && tables.length === 0 && (
            <small className={styles.warningText}>No available tables found</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="orderTime" className={styles.label}>Order Time *</label>
          <input
            type="datetime-local"
            id="orderTime"
            name="orderTime"
            value={formData.orderTime}
            onChange={handleInputChange}
            className={styles.input}
            min={getCurrentDateTime()}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="periodType" className={styles.label}>Period Type</label>
          <select
            id="periodType"
            name="periodType"
            value={formData.periodType}
            onChange={handleInputChange}
            className={styles.select}
          >
            <option value="MORNING">Morning</option>
            <option value="LUNCH">Lunch</option>
            <option value="AFTERNOON">Afternoon</option>
            <option value="EVENING">Evening</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>Description (minimum 5 characters) *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Enter any special requirements or notes (minimum 5 characters)"
            rows={4}
            required
          />
          <small className={`${styles.helperText} ${formData.description.trim().length >= 5 ? styles.valid : ''}`}>
            {formData.description.length}/5 characters minimum
          </small>
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Create Order'}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirm Order Creation</h3>
            <p className={styles.modalMessage}>
              Are you sure you want to create this order for <strong>{formData.fullName}</strong>?
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => handleConfirmOrder(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={() => handleConfirmOrder(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
