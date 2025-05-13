"use client"

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from '../styles/cart.module.css';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaTag } from 'react-icons/fa';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Nếu người dùng chưa đăng nhập, không hiển thị nội dung trang
  if (!user) {
    return <div className={styles.loading}>Redirecting to login...</div>;
  }

  const handleApplyDiscount = () => {
    // Mock discount codes - in real app, these would be validated against a backend
    const validCodes = {
      'WELCOME10': 0.1,
      'SUMMER20': 0.2,
      'SPECIAL15': 0.15
    };

    if (validCodes[discountCode]) {
      setDiscountApplied(true);
      setDiscountError('');
    } else {
      setDiscountError('Invalid discount code');
      setDiscountApplied(false);
    }
  };

  const calculateDiscount = () => {
    if (!discountApplied) return 0;
    const validCodes = {
      'WELCOME10': 0.1,
      'SUMMER20': 0.2,
      'SPECIAL15': 0.15
    };
    return getCartTotal() * validCodes[discountCode];
  };

  const finalTotal = getCartTotal() - calculateDiscount();

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.cartEmpty}
        >
          <FaShoppingCart size={64} className={styles.emptyCartIcon} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link href="/menu" className={styles.continueShopping}>
            <FaArrowLeft /> Continue Shopping
          </Link>
        </motion.div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.cart}
      >
        <div className={styles.cartHeader}>
          <h1>Shopping Cart</h1>
          <span className={styles.itemCount}>{cartItems.length} items</span>
        </div>

        <div className={styles.cartContainer}>
          <div className={styles.cartItems}>
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={styles.cartItem}
                >
                  <div className={styles.itemImageContainer}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                    <div className={styles.quantityControls}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={styles.quantityButton}
                      >
                        -
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={styles.quantityButton}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={styles.itemTotal}>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    <FaTrash />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.cartSummary}
          >
            <h3>Order Summary</h3>
            <div className={styles.summaryContent}>
              <div className={styles.discountForm}>
                <div className={styles.discountInput}>
                  <FaTag className={styles.discountIcon} />
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className={styles.discountInputField}
                  />
                  <button 
                    onClick={handleApplyDiscount}
                    className={styles.applyButton}
                  >
                    Apply
                  </button>
                </div>
                {discountError && (
                  <p className={styles.discountError}>{discountError}</p>
                )}
                {discountApplied && (
                  <p className={styles.discountSuccess}>
                    Discount applied successfully!
                  </p>
                )}
              </div>

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              {discountApplied && (
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <span className={styles.discountAmount}>
                    -${calculateDiscount().toFixed(2)}
                  </span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.freeShipping}>Free</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              <Link href="/payment" className={styles.checkoutButton}>
                Proceed to Checkout
              </Link>
              <Link href="/menu" className={styles.continueShopping}>
                <FaArrowLeft /> Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default CartPage; 