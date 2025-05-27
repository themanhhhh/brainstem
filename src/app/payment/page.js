"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { discountService } from '../api/discount/discountService';
import { createOrder } from '../api/order/orderService';
import AddressAutocomplete from '../components/AddressAutocomplete/AddressAutocomplete';
import styles from '../styles/payment.module.css';
import { FaLock, FaCreditCard, FaUser, FaEnvelope, FaPhone, FaTag, FaPercent, FaTimes, FaMapMarkerAlt, FaClipboardList } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';

const PaymentPage = () => {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
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
  }, []);

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
      // Prepare order data according to the new format
      const orderData = {
        name: formData.name || `Order for ${formData.fullName}`,
        description: formData.description || `Order containing ${cartItems.length} items`,
        discountId: selectedDiscount ? selectedDiscount.id : null,
        price: getFinalTotal(),
        addressId: 1, // Default address ID as specified
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

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Your cart is empty</h2>
        <p>Please add items to your cart before proceeding to payment.</p>
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
              <h1>Secure Payment</h1>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Order Information */}
              <div className={styles.formSection}>
                <h2><FaClipboardList className={styles.sectionIcon} /> Order Information</h2>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Order Name (Optional)"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <textarea
                    name="description"
                    placeholder="Order Description (Optional)"
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
                    <option value="DELIVERY">Delivery</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="DINE_IN">Dine In</option>
                  </select>
                </div>
              </div>

              {/* Personal Information */}
              <div className={styles.formSection}>
                <h2><FaUser className={styles.sectionIcon} /> Personal Information</h2>
                <div className={styles.inputGroup}>
                  <FaUser className={styles.inputIcon} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
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
                    placeholder="Email Address"
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
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className={styles.formSection}>
                <h2><FaCreditCard className={styles.sectionIcon} /> Payment Details</h2>
                <div className={styles.inputGroup}>
                  <FaCreditCard className={styles.inputIcon} />
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
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
                      placeholder="MM/YY"
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
                      placeholder="CVV"
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
                  <div className={styles.inputGroup}>
                    <AddressAutocomplete
                      placeholder="Search for your delivery address..."
                      onAddressSelect={handleAddressSelect}
                      value={formData.address}
                      onChange={(e) => handleInputChange(e)}
                      required={formData.orderType === 'DELIVERY'}
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