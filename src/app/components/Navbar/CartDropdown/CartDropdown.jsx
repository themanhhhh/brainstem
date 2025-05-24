"use client"

import React from 'react';
import { useCart } from '../../../context/CartContext';
import styles from './CartDropdown.module.css';
import { FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const CartDropdown = () => {
  const { cartItems, removeFromCart, getCartTotal } = useCart();

  const handleRemoveClick = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromCart(itemId);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={styles.cartDropdown}
      onClick={handleDropdownClick}
    >
      <div className={styles.cartHeader}>
        <h3>Your Cart</h3>
        <span>{cartItems.length} items</span>
      </div>

      <div className={styles.cartItems}>
        <AnimatePresence>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={styles.cartItem}
              >
                <img src={item.image} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h4>{item.name}</h4>
                  <p>${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <button
                  onClick={(e) => handleRemoveClick(e, item.id)}
                  className={styles.removeButton}
                >
                  <FaTrash />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {cartItems.length > 0 && (
        <>
          <div className={styles.cartTotal}>
            <span>Total:</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
          <div className={styles.cartActions}>
            <Link href="/cart" className={styles.viewCartButton}>
              View Cart
            </Link>
            <Link href="/payment" className={styles.checkoutButton}>
              Checkout
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CartDropdown; 