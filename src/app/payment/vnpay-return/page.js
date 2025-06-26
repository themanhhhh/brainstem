"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearOrderId, getOrderId, updateOrderState } from '../../api/order/orderService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/payment-result.module.css';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

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
          message: 'Thanh toán thành công',
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

      // Xử lý kết quả thanh toán trực tiếp (không cần parent window)
      console.log('Processing payment result:', paymentResult);
      
      // Lấy orderId để cập nhật trạng thái
      const orderId = getOrderId();
      if (orderId) {
        try {
          // Gọi API updateOrderState
          const orderState = paymentResult.success ? "DONE" : "CANCEL";
          console.log(`Updating order ${orderId} state to:`, orderState);
          
          await updateOrderState(orderId, { orderState });
          console.log('Order state updated successfully');
          
          // Clear cart và order ID nếu thanh toán thành công
          if (paymentResult.success) {
            clearCart();
            clearOrderId();
            
            // Tự động chuyển về trang chủ sau 3 giây
            setTimeout(() => {
              router.push('/');
            }, 3000);
          } else {
            // Nếu thanh toán thất bại, vẫn clear orderId để tránh xung đột
            clearOrderId();
          }
        } catch (error) {
          console.error('Error updating order state:', error);
          // Vẫn clear orderId ngay cả khi update thất bại
          clearOrderId();
        }
      } else {
        console.warn('No orderId found for updating order state');
        // Clear cart nếu thanh toán thành công (dù không có orderId)
        if (paymentResult.success) {
          clearCart();
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      }

      setLoading(false);
    };

    processPaymentResult();
  }, []); // Empty dependency array - chỉ chạy một lần khi mount

  const getErrorMessage = (code) => {
    const errorMessages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi hệ thống). Vui lòng liên hệ hỗ trợ để được giải quyết.'
    };
    return errorMessages[code] || 'Giao dịch không thành công. Vui lòng thử lại sau.';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <FaSpinner className={styles.spinner} />
          <h2>Đang xử lý kết quả thanh toán...</h2>
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
            <h1 className={styles.successTitle}>Thanh toán thành công!</h1>
            <p className={styles.successMessage}>
              {paymentResult.message}
            </p>
            {profile && profile.fullName && (
              <div className={styles.userInfo}>
                <p className={styles.userName}>
                  Khách hàng: <strong>{profile.fullName}</strong>
                </p>
              </div>
            )}
            <p className={styles.redirectMessage}>
              Tự động chuyển về trang chủ sau 3 giây...
            </p>
          </>
        ) : (
          <>
            <FaTimesCircle className={styles.errorIcon} />
            <h1 className={styles.errorTitle}>Thanh toán thất bại!</h1>
            <p className={styles.errorMessage}>
              {paymentResult.message}
            </p>
            {profile && profile.fullName && (
              <div className={styles.userInfo}>
                <p className={styles.userName}>
                  Khách hàng: <strong>{profile.fullName}</strong>
                </p>
              </div>
            )}
          </>
        )}
        
        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            Về trang chủ
          </Link>
          {!paymentResult.success && (
            <Link href="/cart" className={styles.retryButton}>
              Thử lại
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage; 