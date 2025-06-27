"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearOrderId, getOrderId, clearCartItemsFromCookie } from '../../api/order/orderService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/payment-result.module.css';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

const VNPayReturnPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { profile } = useAuth();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasProcessedPayment = useRef(false); // Ref để track việc đã xử lý payment

  useEffect(() => {
    // Nếu đã xử lý payment rồi thì không làm gì thêm
    if (hasProcessedPayment.current) {
      return;
    }

    const processPaymentResult = async () => {
      // Đánh dấu là đã bắt đầu xử lý
      hasProcessedPayment.current = true;

      // Lấy các tham số từ URL theo format mới
      const code = searchParams.get('code');
      const message = searchParams.get('message');

      console.log('Payment callback params:', {
        code,
        message
      });

      // Xử lý kết quả thanh toán
      let paymentResult;
      if (code === '00') {
        // Thanh toán thành công
        paymentResult = {
          success: true,
          message: 'Payment successful',
          responseCode: code
        };
      } else {
        // Thanh toán thất bại
        paymentResult = {
          success: false,
          message: getErrorMessage(code),
          errorCode: code,
          responseCode: code
        };
      }

      setPaymentResult(paymentResult);

      // Xử lý kết quả thanh toán
      console.log('Processing payment result:', paymentResult);
      
      // Lấy orderId để xử lý
      const orderId = getOrderId();
      console.log('Order ID from cookies:', orderId);
      
      if (paymentResult.success) {
        // Thanh toán thành công - chỉ cần clear cookies và cart
        console.log('Payment successful - cleaning up cookies and cart');
        
        // Clear cart, cookies và order ID sau khi thành công
        clearCart();
        clearCartItemsFromCookie();
        clearOrderId();
        
        toast.success('Payment successful! Order completed.');
        
        // Tự động chuyển về trang chủ sau 3 giây
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        // Thanh toán thất bại - xóa cookies để tránh xung đột
        console.log('Payment failed, clearing cookies');
        clearOrderId();
        clearCartItemsFromCookie();
        
        toast.error('Payment failed. Please try again.');
      }

      setLoading(false);
    };

    processPaymentResult();
  }, []); // Empty dependency array - chỉ chạy một lần khi mount

  const getErrorMessage = (code) => {
    const errorMessages = {
      '00': 'Transaction successful',
      '07': 'Money deducted successfully. Transaction suspected (related to fraud, unusual transaction).',
      '09': 'Transaction unsuccessful: Customer card/account has not registered for InternetBanking service at the bank.',
      '10': 'Transaction unsuccessful: Customer authenticated card/account information incorrectly more than 3 times',
      '11': 'Transaction unsuccessful: Payment timeout expired. Please try the transaction again.',
      '12': 'Transaction unsuccessful: Customer card/account is locked.',
      '13': 'Transaction unsuccessful: You entered the wrong transaction authentication password (OTP). Please try the transaction again.',
      '24': 'Transaction unsuccessful: Customer canceled the transaction',
      '51': 'Transaction unsuccessful: Your account does not have sufficient balance to make the transaction.',
      '65': 'Transaction unsuccessful: Your account has exceeded the daily transaction limit.',
      '75': 'Payment bank is under maintenance.',
      '79': 'Transaction unsuccessful: Customer entered payment password incorrectly more than the allowed number of times. Please try the transaction again',
      '99': 'Other errors (system error). Please contact support for assistance.'
    };
    return errorMessages[code] || 'Transaction unsuccessful. Please try again later.';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <FaSpinner className={styles.spinner} />
          <h2>Processing payment result...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.resultBox}>
        {paymentResult.success ? (
          <>
            <FaCheckCircle className={styles.successIcon} />
            <h1 className={styles.successTitle}>Payment Successful!</h1>
            <p className={styles.successMessage}>
              {paymentResult.message}
            </p>
            {profile && profile.fullName && (
              <div className={styles.userInfo}>
                <p className={styles.userName}>
                  Customer: <strong>{profile.fullName}</strong>
                </p>
              </div>
            )}
            <p className={styles.redirectMessage}>
              Redirecting to homepage in 3 seconds...
            </p>
          </>
        ) : (
          <>
            <FaTimesCircle className={styles.errorIcon} />
            <h1 className={styles.errorTitle}>Payment Failed!</h1>
            <p className={styles.errorMessage}>
              {paymentResult.message}
            </p>
            {profile && profile.fullName && (
              <div className={styles.userInfo}>
                <p className={styles.userName}>
                  Customer: <strong>{profile.fullName}</strong>
                </p>
              </div>
            )}
          </>
        )}
        
        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            Go to Homepage
          </Link>
          {!paymentResult.success && (
            <Link href="/cart" className={styles.retryButton}>
              Try Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage; 