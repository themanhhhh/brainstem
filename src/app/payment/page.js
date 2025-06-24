"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { discountService } from '../api/discount/discountService';
import { createOrder, getOrderId, clearOrderId, getOrderById, createPayment, checkPaymentStatus, updateOrderInfo } from '../api/order/orderService';
import { addressService } from '../api/address/addressService';
import AddressAutocomplete from '../components/AddressAutocomplete/AddressAutocomplete';
import styles from '../styles/payment.module.css';
import { FaLock, FaCreditCard, FaUser, FaEnvelope, FaPhone, FaTag, FaPercent, FaTimes, FaMapMarkerAlt, FaClipboardList, FaHome, FaBriefcase, FaHeart, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';

const PaymentPage = () => {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const t = useTranslation();
  const { user, profile: userProfile } = useAuth();
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
  const [showAddressListModal, setShowAddressListModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [formData, setFormData] = useState({
    // Order information
    name: '',
    description: '',
    orderType: 'DELIVERY', // DELIVERY, PICKUP, DINE_IN
    notes: '', // Thêm trường ghi chú
    
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
    fetchSavedAddresses();
    
    // Log current orderId if exists
    const currentOrderId = getOrderId();
    if (currentOrderId) {
      console.log('Current order ID from cookie:', currentOrderId);
      fetchOrderData(currentOrderId);
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: userProfile.fullName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || ''
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchDiscounts();
    }
  }, [cartItems]);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await addressService.getUserAddresses();
      let addresses = [];
      if (response && Array.isArray(response)) {
        addresses = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        addresses = response.data;
      }
      setSavedAddresses(addresses);
      // If no saved addresses and no address form shown, show the form
      if (addresses.length === 0) {
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
      const total = getOrderTotal();
      const response = await discountService.getDiscountByPrice(total);
      console.log('Order total for discount calculation:', total);
      if (response.data && Array.isArray(response.data)) {
        setDiscounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderData = async (orderId) => {
    try {
      setLoadingOrder(true);
      const response = await getOrderById(orderId);
      console.log('Order data fetched:', response);
      setOrderData(response);
    } catch (error) {
      console.error('Error fetching order data:', error);
      // Nếu không lấy được order data, có thể chuyển về cart hoặc hiển thị lỗi
    } finally {
      setLoadingOrder(false);
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
    // Check if discount is applicable
    if (discount.applyState === 'INAPPLICABLE') {
      alert(`Discount not applicable. Minimum order value of ${discount.discountRequirement.valueRequirement.toLocaleString()} VNĐ required.`);
      return;
    }
    
    setSelectedDiscount(discount);
    setDiscountCode(discount.name);
    setShowDiscountModal(false);
  };

  const removeDiscount = () => {
    setSelectedDiscount(null);
    setDiscountCode('');
  };

  const calculateDiscount = () => {
    if (!selectedDiscount || selectedDiscount.applyState === 'INAPPLICABLE') return 0;
    
    const subtotal = getOrderTotal();
    
    // Sử dụng totalPriceAfterDiscount để tính discount
    const discountAmount = subtotal - selectedDiscount.totalPriceAfterDiscount;
    return Math.max(0, discountAmount);
  };

  const getOrderTotal = () => {
    // Nếu có orderData, sử dụng totalPrice từ orderData
    if (orderData && orderData.totalPrice) {
      return orderData.totalPrice;
    }
    // Fallback về cartTotal nếu không có orderData
    return getCartTotal();
  };

  const getFinalTotal = () => {
    return getOrderTotal() - calculateDiscount();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Lấy orderId từ cookie
      const currentOrderId = getOrderId();
      if (!currentOrderId) {
        alert('Không tìm thấy thông tin đơn hàng. Vui lòng thử lại!');
        router.push('/cart');
        return;
      }

      console.log('Updating order info before payment for order ID:', currentOrderId);
      
      // Cập nhật thông tin đơn hàng trước khi thanh toán
      const orderUpdateData = {
        name: formData.name || 'Đơn hàng mới',
        description: formData.description || 'Đơn hàng từ website',
        orderType: formData.orderType,
        notes: formData.notes || '', // Thêm ghi chú
        // Thêm thông tin khách hàng và địa chỉ nếu cần
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        }
      };

      // Cập nhật thông tin đơn hàng
      await updateOrderInfo(currentOrderId, orderUpdateData);
      console.log('Order info updated successfully');
      
      // Gọi API tạo thanh toán VNPay
      const paymentResponse = await createPayment(currentOrderId);
      
      console.log('Payment response:', paymentResponse);
      
      // Kiểm tra response
      if (paymentResponse.code === '00' && paymentResponse.paymentUrl) {
        // Chuyển hướng trực tiếp đến VNPay (không mở cửa sổ mới)
        window.location.href = paymentResponse.paymentUrl;
        
      } else {
        // Xử lý lỗi
        alert(paymentResponse.message || 'Có lỗi xảy ra khi tạo thanh toán!');
      }
      
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!');
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

  // Lấy địa chỉ mặc định
  const defaultAddress = savedAddresses.find(addr => addr.isDefault);

  // Hàm chọn địa chỉ khác làm mặc định
  const handleSetDefaultAddress = async (addressId) => {
    try {
      await addressService.updateAddressDefault(addressId);
      await fetchSavedAddresses();
      setShowAddressListModal(false);
    } catch (error) {
      alert('Failed to set default address');
    }
  };

  const handleDiscountModalOpen = async () => {
    setShowDiscountModal(true);
    await fetchDiscounts();
  };



  if (!orderData && cartItems.length === 0) {
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
              {/* Địa chỉ lên đầu form */}
              {formData.orderType === 'DELIVERY' && (
                <div className={styles.formSection}>
                  <h2><FaMapMarkerAlt className={styles.sectionIcon} /> Delivery Address</h2>
                  {/* Hiển thị địa chỉ mặc định */}
                  {loadingAddresses ? (
                    <div className={styles.loadingAddresses}>Loading saved addresses...</div>
                  ) : defaultAddress ? (
                    <div className={styles.savedAddresses}>
                      <h3>Default Address:</h3>
                      <div className={styles.addressCard}>
                        <div className={styles.addressLabel}>
                          {getLabelIcon('HOME')}
                          <span>HOME</span>
                          <span className={styles.defaultBadge}>Default</span>
                        </div>
                        <p className={styles.addressText}>{defaultAddress.addressDetail}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.addNewAddressBtn}
                        onClick={() => setShowAddressListModal(true)}
                      >
                        Chọn địa chỉ khác
                      </button>
                    </div>
                  ) : (
                    <div className={styles.savedAddresses}>
                      <p>No default address found. Please add a new address.</p>
                      <button
                        type="button"
                        className={styles.addNewAddressBtn}
                        onClick={() => setShowAddressForm(true)}
                      >
                        Add New Address
                      </button>
                    </div>
                  )}
                  {/* Modal chọn địa chỉ khác */}
                  {showAddressListModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowAddressListModal(false)}>
                      <div className={styles.discountModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                          <h3>Chọn địa chỉ làm mặc định</h3>
                          <button className={styles.closeModal} onClick={() => setShowAddressListModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalContent}>
                          {savedAddresses.length > 0 ? (
                            <div className={styles.addressList}>
                              {savedAddresses.map(address => (
                                <div
                                  key={address.id}
                                  className={styles.addressCard}
                                  style={{ cursor: 'pointer', border: address.isDefault ? '2px solid #10b981' : '1px solid #eee' }}
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                >
                                  <div className={styles.addressLabel}>
                                    {getLabelIcon('HOME')}
                                    <span>HOME</span>
                                    {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
                                  </div>
                                  <p className={styles.addressText}>{address.addressDetail}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No addresses found.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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

              {/* Order Information */}
              <div className={styles.formSection}>
                <h2><FaClipboardList className={styles.sectionIcon} /> {t('payment.orderInfo')}</h2>
                {loadingOrder ? (
                  <div className={styles.loadingOrder}>Đang tải thông tin đơn hàng...</div>
                ) : orderData ? (
                  <div className={styles.orderInfo}>
                    <div className={styles.orderInfoItem}>
                      <label>Tên đơn hàng:</label>
                      <span>{orderData.name || 'Chưa có tên'}</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.orderInfoFallback}>
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
                      <label className={styles.fieldLabel}>Phương thức nhận hàng:</label>
                      <div className={styles.takingMethodOptions}>
                        <div className={styles.radioOption}>
                          <input
                            type="radio"
                            id="delivery"
                            name="orderType"
                            value="DELIVERY"
                            checked={formData.orderType === 'DELIVERY'}
                            onChange={handleInputChange}
                            className={styles.radioInput}
                          />
                          <label htmlFor="delivery" className={styles.radioLabel}>
                            <div className={styles.radioContent}>
                              <FaHome className={styles.radioIcon} />
                              <div className={styles.radioText}>
                                <span className={styles.radioTitle}>Giao hàng tận nơi</span>
                                <span className={styles.radioDescription}>Chúng tôi sẽ giao hàng đến địa chỉ của bạn</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        
                        <div className={styles.radioOption}>
                          <input
                            type="radio"
                            id="pickup"
                            name="orderType"
                            value="PICKUP"
                            checked={formData.orderType === 'PICKUP'}
                            onChange={handleInputChange}
                            className={styles.radioInput}
                          />
                          <label htmlFor="pickup" className={styles.radioLabel}>
                            <div className={styles.radioContent}>
                              <FaBriefcase className={styles.radioIcon} />
                              <div className={styles.radioText}>
                                <span className={styles.radioTitle}>Đến lấy tại cửa hàng</span>
                                <span className={styles.radioDescription}>Bạn sẽ đến lấy hàng tại cửa hàng</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        
                        <div className={styles.radioOption}>
                          <input
                            type="radio"
                            id="dinein"
                            name="orderType"
                            value="DINE_IN"
                            checked={formData.orderType === 'DINE_IN'}
                            onChange={handleInputChange}
                            className={styles.radioInput}
                          />
                          <label htmlFor="dinein" className={styles.radioLabel}>
                            <div className={styles.radioContent}>
                              <FaClipboardList className={styles.radioIcon} />
                              <div className={styles.radioText}>
                                <span className={styles.radioTitle}>Dùng tại chỗ</span>
                                <span className={styles.radioDescription}>Thưởng thức tại nhà hàng</span>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label className={styles.fieldLabel}>Ghi chú đặc biệt:</label>
                      <textarea
                        name="notes"
                        placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)..."
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={4}
                        className={styles.textArea}
                      />
                    </div>
                  </div>
                )}
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
              

              <button type="submit" className={styles.payButton} disabled={submitting}>
                {submitting ? 'Đang xử lý...' : `Thanh toán ${getFinalTotal().toLocaleString()} VNĐ`}
              </button>
            </form>
          </div>

          <div className={styles.orderSummary}>
            <h2>Order Summary</h2>
            <div className={styles.orderItems}>
              {orderData?.foodInfos?.length > 0 ? (
                orderData.foodInfos.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <span>{item.foodName || 'Unknown Food'} x {item.quantity}</span>
                    <span>Số lượng: {item.quantity}</span>
                  </div>
                ))
              ) : cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} VNĐ</span>
                  </div>
                ))
              ) : (
                <div className={styles.emptyOrder}>
                  <p>Không có sản phẩm trong đơn hàng</p>
                </div>
              )}
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
                    {selectedDiscount.valueType === 'PERCENT' 
                      ? `${selectedDiscount.value}% OFF`
                      : `${selectedDiscount.value.toLocaleString()} VNĐ OFF`
                    }
                  </div>
                </div>
              ) : (
                <button 
                  type="button"
                  className={styles.addDiscountBtn}
                  onClick={handleDiscountModalOpen}
                >
                  <FaTag className={styles.discountIcon} />
                  <span>Add Discount Code</span>
                </button>
              )}
            </div>

            <div className={styles.orderTotal}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{getOrderTotal().toLocaleString()} VNĐ</span>
              </div>
              {selectedDiscount && (
                <div className={styles.totalRow} style={{ color: '#28a745' }}>
                  <span>Discount ({selectedDiscount.name})</span>
                  <span>-{calculateDiscount().toLocaleString()} VNĐ</span>
                </div>
              )}
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>{getFinalTotal().toLocaleString()} VNĐ</span>
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
                      const isApplicable = discount.applyState === 'APPLICABLE';
                      
                      return (
                        <div 
                          key={discount.id} 
                          className={`${styles.discountCard} ${!isApplicable ? styles.discountCardDisabled : ''}`}
                          onClick={() => isApplicable && handleDiscountSelect(discount)}
                          style={{ 
                            opacity: isApplicable ? 1 : 0.5,
                            cursor: isApplicable ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <div className={styles.discountHeader}>
                            <FaPercent className={styles.discountIcon} />
                            <span className={styles.discountName}>{discount.name}</span>
                            {!isApplicable && (
                              <span className={styles.ineligibleBadge}>Không áp dụng được</span>
                            )}
                          </div>
                          <div className={styles.discountDetails}>
                            <span className={styles.discountValue}>
                              {discount.valueType === 'PERCENT' 
                                ? `${discount.value}% OFF`
                                : `${discount.value.toLocaleString()} VNĐ OFF`
                              }
                            </span>
                            {discount.discountRequirement && discount.discountType !== 'FIRST_ORDER' && (
                              <span className={`${styles.minOrder} ${!isApplicable ? styles.minOrderNotMet : ''}`}>
                                Đơn tối thiểu: {discount.discountRequirement.valueRequirement.toLocaleString()} VNĐ
                              </span>
                            )}
                          </div>
                          {discount.description && (
                            <p className={styles.discountDescription}>{discount.description}</p>
                          )}
                          {isApplicable && discount.totalPriceAfterDiscount && (
                            <p className={styles.finalPrice}>
                              Thành tiền sau giảm: {discount.totalPriceAfterDiscount.toLocaleString()} VNĐ
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