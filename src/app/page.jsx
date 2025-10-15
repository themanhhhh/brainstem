"use client";

import React, { useState, useEffect } from 'react';
import { statisticService } from './api/statistic/statisticService';
import styles from './dashboard.module.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  // Mock data for home page
  const mockCampaigns = [
    {
      id: 'cmp-ielts-summer',
      name: 'IELTS Summer Intensive 2025',
      status: 'Đang chạy',
      progress: 78,
      startDate: '2025-06-01',
      endDate: '2025-08-15',
      enrolled: 156
    },
    {
      id: 'cmp-speaking-challenge',
      name: '30-Day Speaking Challenge',
      status: 'Sắp diễn ra',
      progress: 15,
      startDate: '2025-06-10',
      endDate: '2025-07-10',
      enrolled: 89
    },
    {
      id: 'cmp-toeic-bootcamp',
      name: 'TOEIC 750+ Bootcamp',
      status: 'Lên kế hoạch',
      progress: 42,
      startDate: '2025-07-01',
      endDate: '2025-09-30',
      enrolled: 67
    }
  ];

  const newStudentNotifications = [
    { id: '#ORD-2001', name: 'Nguyễn Minh Anh', avatar: '👩‍💼', course: 'IELTS Intensive 7.5+', date: '2025-05-01', amount: 4500000, status: 'Completed' },
    { id: '#ORD-2002', name: 'Trần Quốc Bảo', avatar: '👨‍💻', course: 'Business English Pro', date: '2025-04-30', amount: 3200000, status: 'Pending' },
    { id: '#ORD-2003', name: 'Lê Thanh Hà', avatar: '👩‍🎓', course: 'Speaking & Listening Plus', date: '2025-04-29', amount: 2800000, status: 'Completed' },
    { id: '#ORD-2004', name: 'Phạm Đức Huy', avatar: '👨‍🏫', course: 'Foundation Beginner A1', date: '2025-04-28', amount: 1900000, status: 'Cancelled' },
    { id: '#ORD-2005', name: 'Võ Thị Lan', avatar: '👩‍🔬', course: 'Intermediate B1-B2', date: '2025-04-27', amount: 2500000, status: 'Completed' },
    { id: '#ORD-2011', name: 'Hoàng Văn Nam', avatar: '👨‍⚕️', course: 'TOEIC 600+ Complete', date: '2025-05-02', amount: 3800000, status: 'Completed' },
    { id: '#ORD-2012', name: 'Đặng Thu Trang', avatar: '👩‍🎨', course: 'Pronunciation & Accent', date: '2025-05-01', amount: 1500000, status: 'Completed' }
  ];

  const instructors = [
    { id: 't1', name: 'Ms. Linh', focus: 'Pronunciation & Speaking', emoji: '🗣️', years: 8 },
    { id: 't2', name: 'Mr. David', focus: 'IELTS Academic', emoji: '📚', years: 10 },
    { id: 't3', name: 'Ms. Hạnh', focus: 'Business English', emoji: '🏢', years: 7 }
  ];

  const liveSessions = [
    { id: 'ls1', title: 'Speaking Club: Small Talk như người bản xứ', time: 'Tối Thứ 4 • 19:30', host: 'Ms. Linh' },
    { id: 'ls2', title: 'IELTS Writing Task 2: Idea → Outline → Essay', time: 'Chiều Thứ 7 • 15:00', host: 'Mr. David' },
    { id: 'ls3', title: 'Email công việc: Tone & Structure', time: 'Tối Thứ 5 • 20:00', host: 'Ms. Hạnh' }
  ];

  const testimonials = [
    { id: 'rv1', name: 'Mai Anh • IELTS 7.0', quote: 'Lộ trình rõ ràng, feedback chi tiết từng bài viết. Mình tăng 1.5 band sau 8 tuần!' },
    { id: 'rv2', name: 'Quốc Bảo • Fresher Dev', quote: 'Khóa Business English giúp mình tự tin meeting với khách hàng US.' },
    { id: 'rv3', name: 'Ngọc Trâm • Sinh viên', quote: 'Bài học ngắn gọn, nhiều thực hành. Speaking Club rất vui ❤️' }
  ];

  const tracks = [
    { key: 'beginner', title: 'Beginner', desc: 'Nền tảng phát âm, từ vựng cơ bản, mẫu câu thông dụng', emoji: '🌱', color: '#6c5ce7' },
    { key: 'intermediate', title: 'Intermediate', desc: 'Ngữ pháp trung cấp, nghe nói phản xạ, viết đoạn', emoji: '🚀', color: '#00d2d3' },
    { key: 'advanced', title: 'Advanced', desc: 'Học thuật, thuyết trình, viết essay nâng cao', emoji: '🎯', color: '#ff6b6b' },
    { key: 'ielts', title: 'IELTS', desc: 'Lộ trình 5.5 → 7.5+ với đề thật, chấm band chi tiết', emoji: '📝', color: '#f9ca24' },
    { key: 'business', title: 'Business', desc: 'Tiếng Anh công sở: email, meeting, negotiation', emoji: '💼', color: '#4ecdc4' }
  ];

  const faqs = [
    { q: 'Học online có tương tác với giáo viên không?', a: 'Có. Mỗi tuần có 1-2 buổi live, kèm chấm bài và Q&A riêng.' },
    { q: 'Mất gốc có phù hợp không?', a: 'Có lộ trình Beginner từ phát âm đến ngữ pháp nền, bài tập cực kì dễ theo.' },
    { q: 'Có kiểm tra xếp lớp không?', a: 'Có. Làm bài Placement Test ~10 phút để gợi ý lộ trình cá nhân hoá.' }
  ];

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
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

  const handleExport = async () => {
    try {
      setExporting(true);
      const result = await statisticService.downloadRevenueExport(dateRange.startDate, dateRange.endDate);
      
      // Thông báo thành công
      alert(`Xuất báo cáo thành công: ${result.filename}`);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Lỗi khi xuất báo cáo: ' + err.message);
    } finally {
      setExporting(false);
    }
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

  // Tính toán dữ liệu cho biểu đồ
  const maxRevenue = Math.max(...(statistics?.statisticDailies?.map(item => item.countRevenue) || [0]));
  
  // Tính max cho tất cả các loại đơn hàng từ dữ liệu hàng ngày
  const dailyMaxOrders = statistics?.statisticDailies ? Math.max(
    ...statistics.statisticDailies.flatMap(item => [
      item.countOrder || 0,
      item.countOrderDineIn || 0,
      item.countOrderShip || 0,
      item.countOrderTakeAway || 0,
      item.countOrderOnline || 0,
      item.countOrderOffline || 0
    ])
  ) : 0;
  
  const maxOrders = Math.max(
    dailyMaxOrders,
    statistics?.statisticTotal?.countOrderDineIn || 0,
    statistics?.statisticTotal?.countOrderShip || 0,
    statistics?.statisticTotal?.countOrderTakeAway || 0,
    statistics?.statisticTotal?.countOrderOnline || 0,
    statistics?.statisticTotal?.countOrderOffline || 0
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        
        {/* Summary Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32}}>
          <div style={{
            background: '#313a46',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #404954',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{fontSize: '0.8125rem', color: '#aab8c5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Tổng Doanh Thu</div>
            <div style={{fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: '#fff'}}>156 Tr</div>
            <div style={{fontSize: '0.8125rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4}}>
              <span>↗ 18.5%</span> <span style={{color: '#8391a2'}}>so với tháng trước</span>
            </div>
          </div>

          <div style={{
            background: '#313a46',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #404954',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{fontSize: '0.8125rem', color: '#aab8c5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Học Viên Đăng Ký</div>
            <div style={{fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: '#fff'}}>342</div>
            <div style={{fontSize: '0.8125rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4}}>
              <span>↗ 12.3%</span> <span style={{color: '#8391a2'}}>tuần này</span>
            </div>
          </div>

          <div style={{
            background: '#313a46',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #404954',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{fontSize: '0.8125rem', color: '#aab8c5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Học Viên Đang Học</div>
            <div style={{fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: '#fff'}}>1,247</div>
            <div style={{fontSize: '0.8125rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4}}>
              <span>↗ 24.8%</span> <span style={{color: '#8391a2'}}>quý này</span>
        </div>
      </div>

          <div style={{
            background: '#313a46',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #404954',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{fontSize: '0.8125rem', color: '#aab8c5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Tỷ Lệ Hoàn Thành</div>
            <div style={{fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: '#fff'}}>91.5%</div>
            <div style={{fontSize: '0.8125rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4}}>
              <span>↗ 5.2%</span> <span style={{color: '#8391a2'}}>so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Campaigns section */}
        <div style={{marginBottom: 32}}>
          <h2 style={{marginBottom: 20, fontSize: '1.5rem', fontWeight: 600, color: '#dee2e6'}}>🚀 Chiến dịch đang chạy</h2>
          <div className={styles.dashboard}>
          {mockCampaigns.map((cmp) => (
            <div key={cmp.id} className={styles.card}>
              <div className={styles.cardIcon}>🚀</div>
          <div className={styles.cardContent}>
                <h3 style={{color: '#dee2e6', marginBottom: 4}}>{cmp.name}</h3>
                <p className={styles.cardSubtext} style={{color: '#8391a2', marginBottom: 8}}>{cmp.status} • {cmp.enrolled} học viên</p>
                <div style={{marginTop:8}}>
                  <div style={{height:8, background:'#404954', borderRadius:4}}>
                    <div style={{width:`${cmp.progress}%`, height:8, background:'#0acf97', borderRadius:4}} />
                  </div>
                  <span className={styles.cardSubtext} style={{color: '#aab8c5', fontSize: '0.8125rem'}}>{cmp.progress}% hoàn thành • {cmp.startDate} → {cmp.endDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>


      {/* Instructors & Live Sessions */}
      <div className={styles.chartsContainer} style={{marginTop: '48px', gap: '24px'}}>
        {/* Featured instructors */}
        <div className={styles.chartCard} style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          border: '1px solid #4b5563',
          borderRadius: '16px'
        }}>
          <h2 style={{marginBottom: '24px', fontSize: '1.5rem', fontWeight: '600'}}>👨‍🏫 Giảng viên tiêu biểu</h2>
          <div style={{display:'grid', gap:16}}>
            {instructors.map(i => (
              <div 
                key={i.id} 
                style={{
                  display:'flex', 
                  alignItems:'center', 
                  gap:16,
                  padding: '16px',
                  background: '#1f2a44',
                  borderRadius: '12px',
                  border: '1px solid #2b3a5b',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.borderColor = '#4ecdc4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = '#2b3a5b';
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#26324a',
                  borderRadius: '12px'
                }}>
                  {i.emoji}
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px'}}>{i.name}</div>
                  <div className={styles.cardSubtext} style={{fontSize: '0.95rem'}}>{i.focus}</div>
                  <div className={styles.cardSubtext} style={{fontSize: '0.85rem', color: '#4ecdc4'}}>
                    ✨ {i.years}+ năm kinh nghiệm
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming live sessions */}
        <div className={styles.chartCard} style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          border: '1px solid #4b5563',
          borderRadius: '16px'
        }}>
          <h2 style={{marginBottom: '24px', fontSize: '1.5rem', fontWeight: '600'}}>📅 Sự kiện live sắp diễn ra</h2>
          <div style={{display:'grid', gap:12}}>
            {liveSessions.map(s => (
              <div 
                key={s.id} 
                style={{
                  display:'flex', 
                  flexDirection: 'column',
                  gap: 8,
                  border:'2px solid #2b3a5b', 
                  padding:'16px', 
                  borderRadius:'12px',
                  background: '#1f2a44',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f9ca24';
                  e.currentTarget.style.boxShadow = '0 4px 12px #f9ca2433';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2b3a5b';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{fontWeight: 700, fontSize: '1.05rem', color: '#f9ca24'}}>
                  {s.title}
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8}}>
                  <div className={styles.cardSubtext} style={{fontSize: '0.9rem'}}>
                    👤 Host: <span style={{color: '#4ecdc4'}}>{s.host}</span>
                  </div>
                  <div className={styles.cardSubtext} style={{fontSize: '0.9rem', color: '#ff6b6b'}}>
                    ⏰ {s.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders - New Students */}
      <div className={styles.detailsSection} style={{marginTop: 48}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 600, margin: 0, color: '#dee2e6'}}>Đơn Đăng Ký Gần Đây</h2>
          <div style={{display: 'flex', gap: 10}}>
            <button 
              onClick={() => alert('Thêm đơn đăng ký')}
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: 'transparent',
                border: '1px solid #404954',
                color: '#aab8c5',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#727cf5';
                e.currentTarget.style.color = '#727cf5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#404954';
                e.currentTarget.style.color = '#aab8c5';
              }}
            >
              <span>➕</span> Thêm Đơn
            </button>
            <button 
              onClick={() => alert('Xuất CSV')}
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: '#727cf5',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'white',
                fontWeight: 500,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5b64d4'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#727cf5'}
            >
              <span>📊</span> Xuất CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: '#313a46',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #404954',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#3a4452', borderBottom: '1px solid #404954'}}>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Học Viên</th>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Mã Đơn</th>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Khóa Học</th>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Ngày</th>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Học Phí</th>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Trạng Thái</th>
                <th style={{padding: '14px 16px', textAlign: 'center', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {newStudentNotifications.map((order, index) => (
                <tr 
                  key={order.id}
                  style={{
                    borderBottom: index < newStudentNotifications.length - 1 ? '1px solid #404954' : 'none',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#3a4452'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{padding: '14px 16px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${order.name}&background=727cf5&color=fff&size=40`}
                        alt={order.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                      <span style={{fontWeight: 600, fontSize: '0.875rem', color: '#dee2e6'}}>{order.name}</span>
                    </div>
                  </td>
                  <td style={{padding: '14px 16px', fontSize: '0.875rem', fontWeight: 500}}>
                    <a href="#" style={{textDecoration: 'none', color: '#727cf5'}}>{order.id}</a>
                  </td>
                  <td style={{padding: '14px 16px', color: '#aab8c5', fontSize: '0.875rem'}}>{order.course}</td>
                  <td style={{padding: '14px 16px', color: '#8391a2', fontSize: '0.875rem'}}>{order.date}</td>
                  <td style={{padding: '14px 16px', fontWeight: 600, fontSize: '0.875rem', color: '#dee2e6'}}>
                    {new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(order.amount)}
                  </td>
                  <td style={{padding: '14px 16px'}}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: order.status === 'Completed' ? 'rgba(10, 207, 151, 0.18)' : 
                                  order.status === 'Pending' ? 'rgba(255, 188, 66, 0.18)' : 'rgba(250, 92, 124, 0.18)',
                      color: order.status === 'Completed' ? '#0acf97' : 
                             order.status === 'Pending' ? '#ffbc42' : '#fa5c7c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: order.status === 'Completed' ? '#0acf97' : 
                                   order.status === 'Pending' ? '#ffbc42' : '#fa5c7c'
                      }}></span>
                      {order.status}
                    </span>
                  </td>
                  <td style={{padding: '14px 16px', textAlign: 'center'}}>
                    <button style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8391a2',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      padding: '4px 8px',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#727cf5'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#8391a2'}
                    >⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            borderTop: '1px solid #404954',
            background: '#3a4452'
          }}>
            <span style={{color: '#aab8c5', fontSize: '0.875rem'}}>
              Hiển thị <strong style={{color: '#dee2e6'}}>1</strong> đến <strong style={{color: '#dee2e6'}}>7</strong> trong tổng số <strong style={{color: '#dee2e6'}}>{newStudentNotifications.length}</strong> đơn
            </span>
            <div style={{display: 'flex', gap: 6}}>
              <button style={{
                padding: '6px 10px',
                background: 'transparent',
                border: '1px solid #404954',
                borderRadius: '4px',
                color: '#aab8c5',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#727cf5';
                e.currentTarget.style.color = '#727cf5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#404954';
                e.currentTarget.style.color = '#aab8c5';
              }}
              >‹</button>
              <button style={{
                padding: '6px 12px',
                background: '#727cf5',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>1</button>
              <button style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #404954',
                borderRadius: '4px',
                color: '#aab8c5',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#727cf5';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#727cf5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#aab8c5';
                e.currentTarget.style.borderColor = '#404954';
              }}
              >2</button>
              <button style={{
                padding: '6px 10px',
                background: 'transparent',
                border: '1px solid #404954',
                borderRadius: '4px',
                color: '#aab8c5',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#727cf5';
                e.currentTarget.style.color = '#727cf5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#404954';
                e.currentTarget.style.color = '#aab8c5';
              }}
              >›</button>
            </div>
          </div>
        </div>
      </div>  
    </div>
      </div>
    </div>
  );
};

export default Dashboard;