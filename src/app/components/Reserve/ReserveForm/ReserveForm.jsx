"use client";
import React, { useState, useEffect } from "react";
import {HiOutlineMail} from "react-icons/hi";
import { MdOutlineHttp, MdOutlineContentCopy } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { CiTimer } from "react-icons/ci";
import { GoPersonAdd } from "react-icons/go";
import { 
  TiSocialFacebook,
  TiSocialTwitter,
  TiSocialInstagram
 } from "react-icons/ti";
 import { FaPhoneAlt } from "react-icons/fa";
 import { FaSpinner } from "react-icons/fa";
 import { MdTableRestaurant } from "react-icons/md";

import Style from "./ReserveForm.module.css";
import { Button } from "../../componentsindex";
import ordertableService from "../../../api/ordertable/ordertableService";

const Form = () => {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    description: '',
    phoneNumber: '',
    periodType: 'LUNCH',
    tableId: '',
    orderTime: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch available tables when component mounts
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setTablesLoading(true);
      const response = await ordertableService.getActiveTable(0, 100);
      
      if (response && Array.isArray(response)) {
        setTables(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setTables(response.data);
      } else {
        setTables([]);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
      setTables([]);
    } finally {
      setTablesLoading(false);
    }
  };

  const handleInputChange = (e) => {
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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (!formData.tableId) {
      newErrors.tableId = 'Please select a table';
    }
    
    if (!formData.orderTime) {
      newErrors.orderTime = 'Please select date and time';
    }
    
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format datetime for API
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
    try {
      setLoading(true);
      
      // Format datetime for API
      const formattedDateTime = formatDateTimeForAPI(formData.orderTime);
      
      // Call ordertableService.createOrder with individual parameters
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
          ? 'Reservation created successfully! We will contact you soon to confirm.' 
          : 'Reservation cancelled successfully!';
        alert(statusMessage);
        
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
      } else {
        throw new Error('Failed to create reservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert(error.message || 'Failed to create reservation. Please try again.');
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

  return (
    <div className={Style.Form}>
      <div className={Style.Form_box}>
        <form onSubmit={handleSubmit}>
          <div className={Style.Form_box_input}>
            <label htmlFor="fullName">Full Name *</label>
            <input 
              type="text"
              name="fullName"
              id="fullName"
              placeholder="Enter your full name"  
              className={Style.Form_box_input_userName}
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            {errors.fullName && <span className={Style.error}>{errors.fullName}</span>}
          </div>

          <div className={Style.Form_box_contact}>
            <div className={Style.Form_box_contact_input}>
                <label htmlFor="email">Email *</label>
                <div className={Style.Form_box_contact_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                    <HiOutlineMail/>
                </div>
                <input 
                  type="email"
                  name="email"
                  id="email"
                  placeholder="your@email.com" 
                  className={Style.Form_box_input_Email}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                </div>
                {errors.email && <span className={Style.error}>{errors.email}</span>}
            </div>
            <div className={Style.Form_box_contact_input}>
                <label htmlFor="phoneNumber">Phone Number *</label>
                <div className={Style.Form_box_contact_input_box}>
                    <div className={Style.Form_box_input_box_icon}>
                        <FaPhoneAlt/>
                    </div>
                    <input 
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      placeholder="Your phone number" 
                      className={Style.Form_box_input_Email}
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                </div>
                {errors.phoneNumber && <span className={Style.error}>{errors.phoneNumber}</span>}
            </div>
          </div>

          <div className={Style.Form_box_input_social}>
            <div className={Style.Form_box_input}> 
              <label htmlFor="orderTime">Date & Time *</label>
              <div className={Style.Form_box_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <CiCalendarDate/>
                </div>
                <input 
                  type="datetime-local"
                  name="orderTime"
                  id="orderTime"
                  min={getCurrentDateTime()}
                  value={formData.orderTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {errors.orderTime && <span className={Style.error}>{errors.orderTime}</span>}
            </div>

            <div className={Style.Form_box_input}> 
              <label htmlFor="periodType">Period Type *</label>
              <div className={Style.Form_box_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <CiTimer/>
                </div>
                <select
                  name="periodType"
                  id="periodType"
                  value={formData.periodType}
                  onChange={handleInputChange}
                  className={Style.select}
                  required
                >
                  <option value="MORNING">Morning</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                </select>
              </div>
            </div>

            <div className={Style.Form_box_input}> 
              <label htmlFor="tableId">Select Table *</label>
              <div className={Style.Form_box_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <MdTableRestaurant/>
                </div>
                <select
                  name="tableId"
                  id="tableId"
                  value={formData.tableId}
                  onChange={handleInputChange}
                  className={Style.select}
                  required
                  disabled={tablesLoading}
                >
                  <option value="">
                    {tablesLoading ? 'Loading...' : 'Choose table'}
                  </option>
                  {!tablesLoading && tables.length > 0 && 
                    tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} - {table.numberOfChair} seats
                      </option>
                    ))
                  }
                </select>
              </div>
              {errors.tableId && <span className={Style.error}>{errors.tableId}</span>}
            </div>
          </div>

          <div className={Style.Form_box_input}>
            <label htmlFor="description">Special Requests (min 5 characters) *</label>
            <textarea
              name="description"
              id="description"
              placeholder="Any special requests or dietary requirements... (minimum 5 characters)"
              className={Style.Form_box_input_textarea}
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            {errors.description && <span className={Style.error}>{errors.description}</span>}
            <small className={Style.charCount}>
              {formData.description.length}/5 characters minimum
            </small>
          </div>

          <div className={Style.Form_box_btn}>
            <button 
              type="submit"
              className={Style.button}
              disabled={loading || tablesLoading}
            >
                {loading ? (
                  <>
                    <FaSpinner className={Style.spinning} />
                    <span className={Style.btnText}>Processing...</span>
                  </>
                ) : (
                  <span className={Style.btnText}>Reserve Now</span>
                )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h3 className={Style.modalTitle}>Confirm Reservation</h3>
            <p className={Style.modalMessage}>
              Are you sure you want to create this reservation for <strong>{formData.fullName}</strong>?
            </p>
            <div className={Style.modalButtons}>
              <button
                className={Style.cancelButton}
                onClick={() => handleConfirmOrder(false)}
              >
                Cancel
              </button>
              <button
                className={Style.confirmButton}
                onClick={() => handleConfirmOrder(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default Form;