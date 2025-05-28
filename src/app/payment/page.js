"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { discountService } from '../api/discount/discountService';
import { createOrder } from '../api/order/orderService';
import { addressService } from '../api/address/addressService';
import AddressAutocomplete from '../components/AddressAutocomplete/AddressAutocomplete';
import styles from '../styles/payment.module.css';
import { FaLock, FaCreditCard, FaUser, FaEnvelope, FaPhone, FaTag, FaPercent, FaTimes, FaMapMarkerAlt, FaClipboardList, FaHome, FaBriefcase, FaHeart, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useTranslation } from '../hooks/useTranslation';

const PaymentPage = () => {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const t = useTranslation();
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
  const [formData, setFormData] = useState({
    // Order information
    name: '',
    description: '',
    orderType: 'DELIVERY', // DELIVERY, PICKUP, DINE_IN
    
    // Customer information
    fullName: '',
    email: '',
    phone: '',
    
    // Payment information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    
    // Address information (will be populated by AddressAutocomplete)
    address: '',
    city: '',
    zipCode: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    fetchDiscounts();
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await addressService.getUserAddresses();
      
      if (response && Array.isArray(response)) {
        setSavedAddresses(response);
        // If no saved addresses and no address form shown, show the form
        if (response.length === 0) {
          setShowAddressForm(true);
        }
      } else if (response && response.data && Array.isArray(response.data)) {
        setSavedAddresses(response.data);
        if (response.data.length === 0) {
          setShowAddressForm(true);
        }
      } else {
        setSavedAddresses([]);
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setSavedAddresses([]);
      setShowAddressForm(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await discountService.getAllDiscounts('', 'AVAILABLE', 0, 100);
      if (response.data && Array.isArray(response.data)) {
        setDiscounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (addressData) => {
    setSelectedAddress(addressData);
    setFormData(prev => ({
      ...prev,
      address: addressData.formatted_address,
      city: addressData.address_components.locality || '',
      zipCode: addressData.address_components.postal_code || '',
      latitude: addressData.latitude,
      longitude: addressData.longitude
    }));
  };

  const handleSavedAddressSelect = (address) => {
    setSelectedSavedAddress(address);
    // Parse the address details from the addressDetail string
    const addressParts = address.addressDetail.split(' | ');
    let parsedAddress = {
      label: 'HOME',
      street: '',
      city: '',
      zipCode: '',
      country: '',
      formatted_address: '',
      latitude: null,
      longitude: null
    };

    addressParts.forEach(part => {
      if (part.startsWith('Full: ')) {
        parsedAddress.formatted_address = part.replace('Full: ', '');
      } else if (part.startsWith('Coords: ')) {
        const coords = part.replace('Coords: ', '').split(',');
        parsedAddress.latitude = parseFloat(coords[0]);
        parsedAddress.longitude = parseFloat(coords[1]);
      } else if (['HOME', 'WORK'].includes(part)) {
        parsedAddress.label = part;
      } else if (part.startsWith('Apt: ')) {
        // Skip apartment info
      } else if (part.startsWith('PlaceID: ')) {
        // Skip place ID
      } else {
        // Try to identify parts
        if (part.match(/^\d{5}$/)) {
          parsedAddress.zipCode = part;
        } else if (parsedAddress.street === '') {
          parsedAddress.street = part;
        } else if (parsedAddress.city === '') {
          parsedAddress.city = part;
        }
      }
    });

    setFormData(prev => ({
      ...prev,
      address: parsedAddress.formatted_address || parsedAddress.street,
      city: parsedAddress.city,
      zipCode: parsedAddress.zipCode,
      latitude: parsedAddress.latitude,
      longitude: parsedAddress.longitude
    }));
    setShowAddressForm(false);
  };

  const saveNewAddress = async (addressData) => {
    try {
      const newAddress = {
        label: 'HOME',
        street: addressData.address,
        city: addressData.city,
        zipCode: addressData.zipCode,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        formatted_address: addressData.address,
        isDefault: savedAddresses.length === 0 // Make first address default
      };

      const response = await addressService.createAddress(newAddress);
      if (response) {
        // Refresh address list
        await fetchSavedAddresses();
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleDiscountSelect = (discount) => {
    // Check if order meets minimum requirements
    const subtotal = getCartTotal();
    if (discount.minOrderValue && subtotal < discount.minOrderValue) {
      alert(`Minimum order value of $${discount.minOrderValue} required for this discount.`);
      return;
    }
    
    setSelectedDiscount(discount);
    setDiscountCode(discount.code || discount.name);
    setShowDiscountModal(false);
  };

  const removeDiscount = () => {
    setSelectedDiscount(null);
    setDiscountCode('');
  };

  const calculateDiscount = () => {
    if (!selectedDiscount) return 0;
    
    const subtotal = getCartTotal();
    
    // Check minimum order value
    if (selectedDiscount.minOrderValue && subtotal < selectedDiscount.minOrderValue) {
      return 0;
    }
    
    if (selectedDiscount.discountType === 'PERCENTAGE') {
      const discountAmount = (subtotal * selectedDiscount.discountValue) / 100;
      // Apply maximum discount limit if exists
      if (selectedDiscount.maxDiscountAmount) {
        return Math.min(discountAmount, selectedDiscount.maxDiscountAmount);
      }
      return discountAmount;
    } else if (selectedDiscount.discountType === 'FIXED') {
      return Math.min(selectedDiscount.discountValue, subtotal);
    }
    return 0;
  };

  const getFinalTotal = () => {
    return getCartTotal() - calculateDiscount();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Save address if it's a new one
      if (selectedAddress && savedAddresses.length === 0) {
        await saveNewAddress({
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          latitude: formData.latitude,
          longitude: formData.longitude
        });
      }

      // Prepare order data according to the new format
      const orderData = {
        name: formData.name || `Order for ${formData.fullName}`,
        description: formData.description || `Order containing ${cartItems.length} items`,
        discountId: selectedDiscount ? selectedDiscount.id : null,
        price: getFinalTotal(),
        addressId: selectedSavedAddress ? selectedSavedAddress.id : 1, // Use selected address ID or default
        orderType: formData.orderType,
        orderState: "PENDING", // Default state for new orders
        foodIds: cartItems.map(item => item.id) // Extract food IDs from cart items
      };

      console.log('Creating order with data:', orderData);
      console.log('Selected address:', selectedAddress);
      
      // Create the order
      const response = await createOrder(orderData);
      
      if (response) {
        alert('Order created successfully!');
        clearCart(); // Clear the cart after successful order
        // Redirect to home page or order confirmation page
        router.push('/');
      }
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'HOME': return <FaHome />;
      case 'WORK': return <FaBriefcase />;
      default: return <FaHeart />;
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>{t('payment.emptyCart.title')}</h2>
        <p>{t('payment.emptyCart.message')}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.paymentPage}
      >
        <div className={styles.paymentContainer}>
          <div className={styles.paymentForm}>
            <div className={styles.formHeader}>
              <FaLock className={styles.lockIcon} />
              <h1>{t('payment.title')}</h1>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Order Information */}
              <div className={styles.formSection}>
                <h2><FaClipboardList className={styles.sectionIcon} /> {t('payment.orderInfo')}</h2>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="name"
                    placeholder={t('payment.orderName')}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <textarea
                    name="description"
                    placeholder={t('payment.orderDescription')}
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={styles.textArea}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <select
                    name="orderType"
                    value={formData.orderType}
                    onChange={handleInputChange}
                    required
                    className={styles.selectInput}
                  >
                    <option value="DELIVERY">{t('payment.orderType.delivery')}</option>
                    <option value="PICKUP">{t('payment.orderType.pickup')}</option>
                    <option value="DINE_IN">{t('payment.orderType.dineIn')}</option>
                  </select>
                </div>
              </div>

              {/* Personal Information */}
              <div className={styles.formSection}>
                <h2><FaUser className={styles.sectionIcon} /> {t('payment.personalInfo')}</h2>
                <div className={styles.inputGroup}>
                  <FaUser className={styles.inputIcon} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder={t('payment.fullName')}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <FaEnvelope className={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    placeholder={t('payment.email')}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <FaPhone className={styles.inputIcon} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder={t('payment.phone')}
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className={styles.formSection}>
                <h2><FaCreditCard className={styles.sectionIcon} /> {t('payment.paymentDetails')}</h2>
                <div className={styles.inputGroup}>
                  <FaCreditCard className={styles.inputIcon} />
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder={t('payment.cardNumber')}
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    maxLength={16}
                  />
                </div>
                <div className={styles.cardDetails}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder={t('payment.expiryDate')}
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                      maxLength={5}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="cvv"
                      placeholder={t('payment.cvv')}
                      value={formData.cvv}
                      onChange={handleInputChange}
                      required
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address with AddressAutocomplete */}
              {formData.orderType === 'DELIVERY' && (
                <div className={styles.formSection}>
                  <h2><FaMapMarkerAlt className={styles.sectionIcon} /> Delivery Address</h2>
                  
                  {/* Saved Addresses List */}
                  {loadingAddresses ? (
                    <div className={styles.loadingAddresses}>Loading saved addresses...</div>
                  ) : savedAddresses.length > 0 ? (
                    <div className={styles.savedAddresses}>
                      <h3>Select from saved addresses:</h3>
                      <div className={styles.addressList}>
                        {savedAddresses.map((address) => {
                          const addressParts = address.addressDetail.split(' | ');
                          const label = addressParts[0] || 'HOME';
                          const displayAddress = addressParts.find(part => part.startsWith('Full: '))?.replace('Full: ', '') || 
                                               addressParts.slice(1).filter(part => !part.startsWith('Coords:') && !part.startsWith('PlaceID:')).join(', ');
                          
                          return (
                            <div 
                              key={address.id} 
                              className={`${styles.addressCard} ${selectedSavedAddress?.id === address.id ? styles.selectedCard : ''}`}
                              onClick={() => handleSavedAddressSelect(address)}
                            >
                              <div className={styles.addressLabel}>
                                {getLabelIcon(label)}
                                <span>{label}</span>
                                {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
                              </div>
                              <p className={styles.addressText}>{displayAddress}</p>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        className={styles.addNewAddressBtn}
                        onClick={() => setShowAddressForm(!showAddressForm)}
                      >
                        <FaPlus /> {showAddressForm ? 'Hide Form' : 'Add New Address'}
                      </button>
                    </div>
                  ) : null}

                  {/* Address Form - Show when no saved addresses or user wants to add new */}
                  {(showAddressForm || savedAddresses.length === 0) && (
                    <div className={styles.addressForm}>
                      {savedAddresses.length > 0 && <h3>Add new address:</h3>}
                      <div className={styles.inputGroup}>
                        <AddressAutocomplete
                          placeholder="Search for your delivery address..."
                          onAddressSelect={handleAddressSelect}
                          value={formData.address}
                          onChange={(e) => handleInputChange(e)}
                          required={formData.orderType === 'DELIVERY' && !selectedSavedAddress}
                        />
                      </div>
                      
                      {/* Show selected address details */}
                      {selectedAddress && (
                        <div className={styles.selectedAddressInfo}>
                          <h4>Selected Address:</h4>
                          <p><strong>Address:</strong> {selectedAddress.formatted_address}</p>
                          <p><strong>Coordinates:</strong> {selectedAddress.latitude.toFixed(6)}, {selectedAddress.longitude.toFixed(6)}</p>
                        </div>
                      )}
                      
                      {/* Fallback manual inputs if needed */}
                      <details className={styles.manualAddressToggle}>
                        <summary>Enter address manually</summary>
                        <div className={styles.manualAddressInputs}>
                          <div className={styles.inputGroup}>
                            <input
                              type="text"
                              name="address"
                              placeholder="Street Address"
                              value={formData.address}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className={styles.addressDetails}>
                            <div className={styles.inputGroup}>
                              <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className={styles.inputGroup}>
                              <input
                                type="text"
                                name="zipCode"
                                placeholder="ZIP Code"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className={styles.payButton} disabled={submitting}>
                {submitting ? 'Processing...' : `Pay $${getFinalTotal().toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className={styles.orderSummary}>
            <h2>Order Summary</h2>
            <div className={styles.orderItems}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.orderItem}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Discount Section in Order Summary */}
            <div className={styles.discountSection}>
              {selectedDiscount ? (
                <div className={styles.appliedDiscount}>
                  <div className={styles.discountRow}>
                    <div className={styles.discountInfo}>
                      <FaTag className={styles.discountIcon} />
                      <span>{selectedDiscount.name}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={removeDiscount}
                      className={styles.removeDiscountBtn}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className={styles.discountValue}>
                    {selectedDiscount.discountType === 'PERCENTAGE' 
                      ? `${selectedDiscount.discountValue}% OFF`
                      : `$${selectedDiscount.discountValue} OFF`
                    }
                  </div>
                </div>
              ) : (
                <button 
                  type="button"
                  className={styles.addDiscountBtn}
                  onClick={() => setShowDiscountModal(true)}
                >
                  <FaTag className={styles.discountIcon} />
                  <span>Add Discount Code</span>
                </button>
              )}
            </div>

            <div className={styles.orderTotal}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              {selectedDiscount && (
                <div className={styles.totalRow} style={{ color: '#28a745' }}>
                  <span>Discount ({selectedDiscount.name})</span>
                  <span>-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>${getFinalTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discount Modal */}
        {showDiscountModal && (
          <div className={styles.modalOverlay} onClick={() => setShowDiscountModal(false)}>
            <div className={styles.discountModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3><FaTag className={styles.sectionIcon} /> Select Discount Code</h3>
                <button 
                  className={styles.closeModal}
                  onClick={() => setShowDiscountModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className={styles.modalContent}>
                {loading ? (
                  <div className={styles.loadingDiscounts}>Loading discounts...</div>
                ) : discounts.length > 0 ? (
                  <div className={styles.discountList}>
                    {discounts.map((discount) => {
                      const subtotal = getCartTotal();
                      const isEligible = !discount.minOrderValue || subtotal >= discount.minOrderValue;
                      
                      return (
                        <div 
                          key={discount.id} 
                          className={`${styles.discountCard} ${!isEligible ? styles.discountCardDisabled : ''}`}
                          onClick={() => isEligible && handleDiscountSelect(discount)}
                        >
                          <div className={styles.discountHeader}>
                            <FaPercent className={styles.discountIcon} />
                            <span className={styles.discountName}>{discount.name}</span>
                            {!isEligible && (
                              <span className={styles.ineligibleBadge}>Not Eligible</span>
                            )}
                          </div>
                          <div className={styles.discountDetails}>
                            <span className={styles.discountValue}>
                              {discount.discountType === 'PERCENTAGE' 
                                ? `${discount.discountValue}% OFF`
                                : `$${discount.discountValue} OFF`
                              }
                            </span>
                            {discount.minOrderValue && (
                              <span className={`${styles.minOrder} ${!isEligible ? styles.minOrderNotMet : ''}`}>
                                Min order: ${discount.minOrderValue}
                              </span>
                            )}
                          </div>
                          {discount.description && (
                            <p className={styles.discountDescription}>{discount.description}</p>
                          )}
                          {discount.maxDiscountAmount && discount.discountType === 'PERCENTAGE' && (
                            <p className={styles.maxDiscount}>
                              Max discount: ${discount.maxDiscountAmount}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.noDiscounts}>No discount codes available</div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
      <Footer />
    </>
  );
};

export default PaymentPage;