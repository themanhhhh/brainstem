"use client";

import React, { useState, useEffect } from 'react';
import { statisticService } from '../../../api/statistic/statisticService';
import styles from './revenue.module.css';

const RevenuePage = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 ngày trước
    endDate: new Date().toISOString().split('T')[0] // Hôm nay
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticService.getRevenue(dateRange.startDate, dateRange.endDate);
      setStatistics(response);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Lỗi tải dữ liệu</h2>
          <p>{error}</p>
          <button onClick={fetchStatistics} className={styles.retryButton}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Tính toán dữ liệu cho biểu đồ đơn giản
  const maxRevenue = Math.max(...(statistics?.statisticDailies?.map(item => item.countRevenue) || [0]));
  const maxOrders = Math.max(
    statistics?.statisticTotal?.countOrderDineIn || 0,
    statistics?.statisticTotal?.countOrderShip || 0,
    statistics?.statisticTotal?.countOrderTakeAway || 0,
    statistics?.statisticTotal?.countOrderOnline || 0,
    statistics?.statisticTotal?.countOrderOffline || 0
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Báo cáo Doanh thu</h1>
        <div className={styles.dateFilter}>
          <div className={styles.dateGroup}>
            <label>Từ ngày:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateGroup}>
            <label>Đến ngày:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Dashboard Cards */}
        <div className={styles.dashboard}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardContent}>
            <h3>Người dùng hoạt động</h3>
            <p className={styles.cardNumber}>{statistics?.statisticTotal?.totalActiveUser || 0}</p>
            <span className={styles.cardSubtext}>Tổng số</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <h3>Người dùng tháng này</h3>
            <p className={styles.cardNumber}>{statistics?.statisticTotal?.monthlyActiveUser || 0}</p>
            <span className={styles.cardSubtext}>Hoạt động</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>🛍️</div>
          <div className={styles.cardContent}>
            <h3>Tổng đơn hàng</h3>
            <p className={styles.cardNumber}>{statistics?.statisticTotal?.countOrder || 0}</p>
            <span className={styles.cardSubtext}>Đơn hàng</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>💰</div>
          <div className={styles.cardContent}>
            <h3>Tổng doanh thu</h3>
            <p className={styles.cardNumber}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(statistics?.statisticTotal?.countRevenue || 0)}
            </p>
            <span className={styles.cardSubtext}>VNĐ</span>
          </div>
        </div>
      </div>

      {/* Simple Charts with CSS */}
      <div className={styles.chartsContainer}>
        <div className={styles.chartCard}>
          <h2>Biểu đồ Doanh thu theo Ngày</h2>
          <div className={styles.simpleChart}>
            {statistics?.statisticDailies?.map((item, index) => (
              <div key={index} className={styles.chartBar}>
                <div 
                  className={styles.chartBarFill}
                  style={{
                    height: `${maxRevenue > 0 ? (item.countRevenue / maxRevenue) * 100 : 0}%`
                  }}
                ></div>
                <span className={styles.chartLabel}>
                  {new Date(item.daily).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </span>
                <span className={styles.chartValue}>
                  {new Intl.NumberFormat('vi-VN').format(item.countRevenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2>Phân loại Đơn hàng</h2>
          <div className={`${styles.simpleChart} ${styles.orderTypeChart}`}>
            {[
              { label: 'Tại chỗ', value: statistics?.statisticTotal?.countOrderDineIn || 0, color: '#ff6384' },
              { label: 'Giao hàng', value: statistics?.statisticTotal?.countOrderShip || 0, color: '#36a2eb' },
              { label: 'Mang về', value: statistics?.statisticTotal?.countOrderTakeAway || 0, color: '#ffcd56' },
              { label: 'Online', value: statistics?.statisticTotal?.countOrderOnline || 0, color: '#4bc0c0' },
              { label: 'Offline', value: statistics?.statisticTotal?.countOrderOffline || 0, color: '#9966ff' },
            ].map((item, index) => (
              <div key={index} className={styles.chartBar}>
                <div 
                  className={styles.chartBarFill}
                  style={{
                    height: `${maxOrders > 0 ? (item.value / maxOrders) * 100 : 0}%`,
                    backgroundColor: item.color
                  }}
                ></div>
                <span className={styles.chartLabel}>{item.label}</span>
                <span className={styles.chartValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Trend Table */}
      <div className={styles.detailsSection}>
        <h2>Chi tiết Doanh thu theo Ngày</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Người dùng hoạt động</th>
                <th>Số đơn hàng</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {statistics?.statisticDailies?.map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.daily).toLocaleDateString('vi-VN')}</td>
                  <td>{item.dailyActiveUser}</td>
                  <td>{item.countOrder}</td>
                  <td className={styles.revenue}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(item.countRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Type Details */}
      <div className={styles.detailsSection}>
        <h2>Chi tiết theo Loại Đơn hàng</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <h4>Tại chỗ (Dine In)</h4>
            <p>{statistics?.statisticTotal?.countOrderDineIn || 0} đơn</p>
          </div>
          <div className={styles.detailCard}>
            <h4>Giao hàng (Ship)</h4>
            <p>{statistics?.statisticTotal?.countOrderShip || 0} đơn</p>
          </div>
          <div className={styles.detailCard}>
            <h4>Mang về (Take Away)</h4>
            <p>{statistics?.statisticTotal?.countOrderTakeAway || 0} đơn</p>
          </div>
          <div className={styles.detailCard}>
            <h4>Online</h4>
            <p>{statistics?.statisticTotal?.countOrderOnline || 0} đơn</p>
          </div>
          <div className={styles.detailCard}>
            <h4>Offline</h4>
            <p>{statistics?.statisticTotal?.countOrderOffline || 0} đơn</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RevenuePage;