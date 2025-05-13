"use client"

import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import styles from './CartIcon.module.css';
import { FaShoppingCart } from 'react-icons/fa';
import CartDropdown from '../CartDropdown/CartDropdown';

const CartIcon = () => {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div 
      className={styles.cartIcon}
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
      style={{zIndex: 10000000}}
    >
      <FaShoppingCart className={styles.icon} />
      {user && cartItems.length > 0 && (
        <span className={styles.badge}>{cartItems.length}</span>
      )}
      {user && showDropdown && <CartDropdown />}
    </div>
  );
};

export default CartIcon; 