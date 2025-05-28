"use client";
import React, { useState, useEffect } from 'react';
import AddressAutocomplete from '../components/AddressAutocomplete/AddressAutocomplete';
import { addressService } from '../api/address/addressService';
import styles from './AddressManager.module.css';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaHome, FaBriefcase, FaHeart, FaSpinner } from 'react-icons/fa';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    label: 'HOME', // HOME, WORK, OTHER
    customLabel: '',
    street: '',
    apt: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    latitude: null,
    longitude: null,
    formatted_address: '',
    place_id: null,
    isDefault: false
  });

  // Load addresses when component mounts
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getUserAddresses();
      if (response.success) {
        setAddresses(response.data || []);
      } else {
        console.error('Failed to load addresses:', response.message);
        // Fallback to localStorage if API fails
        const savedAddresses = localStorage.getItem('userAddresses');
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      // Fallback to localStorage if API fails
      const savedAddresses = localStorage.getItem('userAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (addressData) => {
    setSelectedAddress(addressData);
    setFormData(prev => ({
      ...prev,
      street: `${addressData.address_components.street_number || ''} ${addressData.address_components.route || ''}`.trim(),
      city: addressData.address_components.locality || '',
      state: addressData.address_components.administrative_area_level_1 || '',
      zipCode: addressData.address_components.postal_code || '',
      country: addressData.address_components.country || '',
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      formatted_address: addressData.formatted_address,
      place_id: addressData.place_id
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      label: 'HOME',
      customLabel: '',
      street: '',
      apt: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      latitude: null,
      longitude: null,
      formatted_address: '',
      place_id: null,
      isDefault: false
    });
    setSelectedAddress(null);
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const handleSaveAddress = async () => {
    if (!selectedAddress && !formData.street) {
      alert('Please select or enter an address');
      return;
    }

    try {
      setSaving(true);
      
      const addressData = {
        label: formData.label === 'OTHER' ? formData.customLabel : formData.label,
        street: formData.street,
        apt: formData.apt,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        formatted_address: formData.formatted_address,
        place_id: formData.place_id,
        isDefault: formData.isDefault
      };

      let response;
      if (editingAddress) {
        // Update existing address
        response = await addressService.updateAddress(editingAddress.id, addressData);
      } else {
        // Add new address
        response = await addressService.createAddress(addressData);
      }

      if (response.success) {
        // Reload addresses from server
        await loadAddresses();
      resetForm();
      alert(editingAddress ? 'Address updated successfully!' : 'Address saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      label: ['HOME', 'WORK'].includes(address.label) ? address.label : 'OTHER',
      customLabel: !['HOME', 'WORK'].includes(address.label) ? address.label : '',
      street: address.street || '',
      apt: address.apt || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || '',
      latitude: address.latitude,
      longitude: address.longitude,
      formatted_address: address.formatted_address || '',
      place_id: address.place_id,
      isDefault: address.isDefault || false
    });
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await addressService.deleteAddress(addressId);
        if (response.success) {
          // Reload addresses from server
          await loadAddresses();
          alert('Address deleted successfully!');
        } else {
          throw new Error(response.message || 'Failed to delete address');
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await addressService.setDefaultAddress(addressId);
      if (response.success) {
        // Reload addresses from server
        await loadAddresses();
        alert('Default address updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'HOME': return <FaHome />;
      case 'WORK': return <FaBriefcase />;
      default: return <FaHeart />;
    }
  };

  const getLabelColor = (label) => {
    switch (label) {
      case 'HOME': return '#10b981';
      case 'WORK': return '#3b82f6';
      default: return '#f59e0b';
    }
  };

  return (
    <div className={styles.addressManager}>
      <div className={styles.header}>
        <h2>Address Management</h2>
        <p className={styles.subtitle}>Manage your delivery addresses for easier ordering</p>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          <FaPlus /> Add New Address
        </button>
      </div>

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h3>
              <FaMapMarkerAlt />
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button 
              className={styles.closeButton}
              onClick={resetForm}
            >
              <FaTimes />
            </button>
          </div>

          <div className={styles.formContent}>
            {/* Address Search */}
            <div className={styles.inputGroup}>
              <label>Search Address</label>
              <AddressAutocomplete
                placeholder="Search for your address..."
                onAddressSelect={handleAddressSelect}
                value={formData.formatted_address}
                onChange={(e) => setFormData(prev => ({ ...prev, formatted_address: e.target.value }))}
              />
            </div>

            {/* Address Label */}
            <div className={styles.inputGroup}>
              <label>Address Label</label>
              <div className={styles.labelSelector}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="label"
                    value="HOME"
                    checked={formData.label === 'HOME'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioCustom}>
                    <FaHome /> Home
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="label"
                    value="WORK"
                    checked={formData.label === 'WORK'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioCustom}>
                    <FaBriefcase /> Work
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="label"
                    value="OTHER"
                    checked={formData.label === 'OTHER'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioCustom}>
                    <FaHeart /> Other
                  </span>
                </label>
              </div>
              {formData.label === 'OTHER' && (
                <input
                  type="text"
                  name="customLabel"
                  placeholder="Enter custom label"
                  value={formData.customLabel}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              )}
            </div>

            {/* Address Details */}
            <div className={styles.addressDetails}>
              <div className={styles.inputGroup}>
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  placeholder="Street address"
                  value={formData.street}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Apartment, Suite, etc. (Optional)</label>
                <input
                  type="text"
                  name="apt"
                  placeholder="Apt, Suite, Floor, etc."
                  value={formData.apt}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>State/Province</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>ZIP/Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Default Address Checkbox */}
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                />
                <span className={styles.checkboxCustom}></span>
                Set as default address
              </label>
            </div>

            {/* Selected Address Info */}
            {selectedAddress && (
              <div className={styles.selectedAddressInfo}>
                <h4>Selected Address Details:</h4>
                <p><strong>Full Address:</strong> {selectedAddress.formatted_address}</p>
                <p><strong>Coordinates:</strong> {selectedAddress.latitude.toFixed(6)}, {selectedAddress.longitude.toFixed(6)}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button 
                type="button"
                className={styles.cancelButton}
                onClick={resetForm}
              >
                <FaTimes /> Cancel
              </button>
              <button 
                type="button"
                className={styles.saveButton}
                onClick={handleSaveAddress}
                disabled={saving || (!selectedAddress && !formData.street)}
              >
                {saving ? <FaSpinner className={styles.spinning} /> : <FaSave />}
                {saving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className={styles.addressList}>
        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinning} />
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className={styles.emptyState}>
            <FaMapMarkerAlt className={styles.emptyIcon} />
            <h3>No addresses saved</h3>
            <p>Add your first address to get started with faster checkout</p>
          </div>
        ) : (
          <div className={styles.addressGrid}>
            {addresses.map((address) => (
              <div 
                key={address.id} 
                className={`${styles.addressCard} ${address.isDefault ? styles.defaultAddress : ''}`}
              >
                <div className={styles.addressHeader}>
                  <div className={styles.addressLabel} style={{ color: getLabelColor(address.label) }}>
                    {getLabelIcon(address.label)}
                    <span>{address.label}</span>
                  </div>
                  {address.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                </div>

                <div className={styles.addressContent}>
                  <p className={styles.addressText}>
                    {address.street}
                    {address.apt && `, ${address.apt}`}
                  </p>
                  <p className={styles.addressSecondary}>
                    {[address.city, address.state, address.zipCode].filter(Boolean).join(', ')}
                  </p>
                  {address.country && (
                    <p className={styles.addressSecondary}>{address.country}</p>
                  )}
                  {address.formatted_address && (
                    <p className={styles.fullAddress}>{address.formatted_address}</p>
                  )}
                </div>

                <div className={styles.addressActions}>
                  {!address.isDefault && (
                    <button
                      className={styles.actionButton}
                      onClick={() => handleSetDefault(address.id)}
                      title="Set as default"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEditAddress(address)}
                    title="Edit address"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteAddress(address.id)}
                    title="Delete address"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressManager; 