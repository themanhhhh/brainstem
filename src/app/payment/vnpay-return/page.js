"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearOrderId } from '../../api/order/orderService';
import { useCart } from '../../context/CartContext';
import styles from '../../styles/payment-result.module.css';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

const VNPayReturnPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy các tham số từ URL
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');
    const vnp_Amount = searchParams.get('vnp_Amount');
    const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
    const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
    const vnp_BankCode = searchParams.get('vnp_BankCode');
    const vnp_PayDate = searchParams.get('vnp_PayDate');

    console.log('VNPay callback params:', {
      vnp_ResponseCode,
      vnp_TransactionStatus,
      vnp_TxnRef,
      vnp_Amount,
      vnp_OrderInfo
    });

    // Xử lý kết quả thanh toán
    let paymentResult;
    if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
      // Thanh toán thành công
      paymentResult = {
        success: true,
        message: 'Thanh toán thành công!',
        transactionRef: vnp_TxnRef,
        transactionNo: vnp_TransactionNo,
        amount: vnp_Amount ? (parseInt(vnp_Amount) / 100).toLocaleString() : '0',
        orderInfo: vnp_OrderInfo ? decodeURIComponent(vnp_OrderInfo) : '',
        bankCode: vnp_BankCode,
        payDate: vnp_PayDate,
        responseCode: vnp_ResponseCode,
        transactionStatus: vnp_TransactionStatus
      };
    } else {
      // Thanh toán thất bại
      paymentResult = {
        success: false,
        message: getErrorMessage(vnp_ResponseCode),
        transactionRef: vnp_TxnRef,
        errorCode: vnp_ResponseCode,
        responseCode: vnp_ResponseCode,
        transactionStatus: vnp_TransactionStatus
      };
    }

    setPaymentResult(paymentResult);

    // Gửi kết quả về parent window (trang payment chính)
    if (window.opener) {
      console.log('Sending payment result to parent:', paymentResult);
      window.opener.postMessage({
        type: 'VNPAY_PAYMENT_RESULT',
        data: paymentResult
      }, window.location.origin);
      
      // Tự động đóng tab sau 3 giây nếu thanh toán thành công
      if (paymentResult.success) {
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    } else {
      console.log('No parent window found, displaying result normally');
      // Clear cart và order ID nếu không có parent window
      if (paymentResult.success) {
        clearCart();
        clearOrderId();
      }
    }

    setLoading(false);
  }, [searchParams, clearCart]);

  const getErrorMessage = (code) => {
    const errorMessages = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.'
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
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
            </p>
            <div className={styles.transactionInfo}>
              <h3>Thông tin giao dịch:</h3>
              <div className={styles.infoRow}>
                <span>Mã giao dịch:</span>
                <span>{paymentResult.transactionRef}</span>
              </div>
              {paymentResult.transactionNo && (
                <div className={styles.infoRow}>
                  <span>Mã GD VNPay:</span>
                  <span>{paymentResult.transactionNo}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span>Số tiền:</span>
                <span>{paymentResult.amount} VNĐ</span>
              </div>
              <div className={styles.infoRow}>
                <span>Thông tin đơn hàng:</span>
                <span>{paymentResult.orderInfo}</span>
              </div>
              {paymentResult.bankCode && (
                <div className={styles.infoRow}>
                  <span>Ngân hàng:</span>
                  <span>{paymentResult.bankCode}</span>
                </div>
              )}
              {paymentResult.payDate && (
                <div className={styles.infoRow}>
                  <span>Thời gian:</span>
                  <span>{formatPayDate(paymentResult.payDate)}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <FaTimesCircle className={styles.errorIcon} />
            <h1 className={styles.errorTitle}>Thanh toán thất bại!</h1>
            <p className={styles.errorMessage}>
              {paymentResult.message}
            </p>
            {paymentResult.transactionRef && (
              <div className={styles.transactionInfo}>
                <div className={styles.infoRow}>
                  <span>Mã tham chiếu:</span>
                  <span>{paymentResult.transactionRef}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Mã lỗi:</span>
                  <span>{paymentResult.errorCode}</span>
                </div>
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

const formatPayDate = (payDate) => {
  if (!payDate || payDate.length !== 14) return payDate;
  
  const year = payDate.substring(0, 4);
  const month = payDate.substring(4, 6);
  const day = payDate.substring(6, 8);
  const hour = payDate.substring(8, 10);
  const minute = payDate.substring(10, 12);
  const second = payDate.substring(12, 14);
  
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

export default VNPayReturnPage; 