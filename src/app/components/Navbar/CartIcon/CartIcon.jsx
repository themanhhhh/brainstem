"use client"

import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import styles from './CartIcon.module.css';
import { FaShoppingCart } from 'react-icons/fa';
import CartDropdown from '../CartDropdown/CartDropdown';

const CartIcon = () => {
  const { cartItems } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div 
      className={styles.cartIcon}
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <FaShoppingCart className={styles.icon} />
      {cartItems.length > 0 && (
        <span className={styles.badge}>{cartItems.length}</span>
      )}
      {showDropdown && <CartDropdown />}
    </div>
  );
};

export default CartIcon; 