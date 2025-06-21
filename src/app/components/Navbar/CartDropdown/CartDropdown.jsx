"use client"

import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { createOrder, setOrderId } from '../../../api/order/orderService';
import { useRouter } from 'next/navigation';
import styles from './CartDropdown.module.css';
import { FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const CartDropdown = () => {
  const { cartItems, removeFromCart, getCartTotal } = useCart();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const router = useRouter();

  const handleRemoveClick = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromCart(itemId);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    try {
      setIsCreatingOrder(true);
      
      // Chuyển đổi cartItems thành foodInfo format
      const foodInfo = cartItems.map(item => ({
        foodId: item.id,
        quantity: item.quantity
      }));

      console.log('Creating order with foodInfo:', foodInfo);
      
      // Gọi API tạo order
      const response = await createOrder(foodInfo);
      
      // Lấy orderId từ response (có thể là response.id hoặc chỉ là response nếu response là số)
      const orderId = typeof response === 'number' ? response : response.id || response.data?.id;
      
      console.log('Order created with ID:', orderId);
      
      if (!orderId) {
        throw new Error('Không thể lấy ID đơn hàng từ response');
      }
      
      // Lưu orderId vào cookie
      setOrderId(orderId);
      
      // Chuyển hướng đến trang payment
      router.push('/payment');
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsCreatingOrder(false);
    }
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
                  <p>{item.price} VNĐ x {item.quantity}</p>
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
            <span>{getCartTotal()} VNĐ</span>
          </div>
          <div className={styles.cartActions}>
            <Link href="/cart" className={styles.viewCartButton}>
              View Cart
            </Link>
            <button 
              onClick={handleCheckout}
              className={styles.checkoutButton}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? 'Đang xử lý...' : 'Checkout'}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CartDropdown; 