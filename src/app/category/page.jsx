"use client";
import React, { useState, useEffect } from "react";
import Style from "./category.module.css";
import { useLanguageService } from "../../../hooks/useLanguageService";
import { Pagination, FilterableSearch } from "../../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import { mockData } from "../../../data/mockData";
import Image from "next/image";
import LogoutButton from "@/app/components/LogoutButton/LogoutButton";
import Link from "next/link";
import LanguageSelector from "@/app/components/LanguageSelector/LanguageSelector";
import toast from "react-hot-toast";

const Page = () => {
  const { categoryService, language } = useLanguageService();
  
  // Utility function to extract error message from API response
  const getErrorMessage = (error, defaultMessage) => {
    // Check if error has response data with message
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Check if error object has message property directly (API response)
    if (error?.message) {
      return error.message;
    }
    
    // Check if error is response object with code/status
    if (error?.code >= 400 || error?.status >= 400) {
      return error.message || `Lỗi ${error.code || error.status}`;
    }
    
    // Check if error is string
    if (typeof error === 'string') {
      return error;
    }
    
    // Debug log for unhandled error formats
    console.log("Unhandled error format:", error);
    
    // Fallback to default message
    return defaultMessage;
  };
  const [leads, setLeads] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SDT: '',
    NgaySinh: '',
    GioiTinh: '',
    TrangThai: '',
    MaCD: ''
  });
  const { uploadToPinata, error: uploadError, openError } = useCart();
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");
  
  // Lấy các tham số lọc từ URL
  const nameFilter = searchParams.get("name") || "";
  const statusFilter = searchParams.get("status") || "";

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchLeads(currentPage, itemsPerPage, nameFilter, statusFilter);
  }, [currentPage, itemsPerPage, nameFilter, statusFilter]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== nameFilter) {
        // Cập nhật URL với từ khóa tìm kiếm
        updateFilters({ name: searchTerm });
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, nameFilter]);

  // Cập nhật bộ lọc vào URL và quay về trang đầu tiên
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Cập nhật các tham số
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Khi thay đổi bộ lọc, quay về trang đầu tiên
    params.set("page", "0");
    
    // Cập nhật URL
    replace(`${pathname}?${params}`);
  };

  const fetchLeads = async (page, pageSize, name = "", state = "") => {
    try {
      setLoading(true);
      
      // Sử dụng dữ liệu học viên tiềm năng từ mockData
      let filteredLeads = [...mockData.hocVienTiemNang];
      
      // Lọc theo tên
      if (name) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.HoTen.toLowerCase().includes(name.toLowerCase()) ||
          lead.Email.toLowerCase().includes(name.toLowerCase())
        );
      }
      
      // Lọc theo trạng thái
      if (state) {
        filteredLeads = filteredLeads.filter(lead => lead.TrangThai === state);
      }
      
      // Phân trang
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
      
      setLeads(paginatedLeads);
      setMetadata({
        page: page,
        totalPages: Math.ceil(filteredLeads.length / pageSize),
        count: paginatedLeads.length,
        totalElements: filteredLeads.length
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setLeads([]);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách học viên tiềm năng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };


  const handleEdit = async (lead) => {
    try {
      setSelectedLead(lead);
      setFormData({
        HoTen: lead.HoTen || '',
        Email: lead.Email || '',
        SDT: lead.SDT || '',
        NgaySinh: lead.NgaySinh || '',
        GioiTinh: lead.GioiTinh || '',
        TrangThai: lead.TrangThai || 'INTERESTED',
        MaCD: lead.MaCD || ''
      });
      setShowEditModal(true);
      
      toast.success(`Đang chỉnh sửa học viên tiềm năng: ${lead.HoTen}`, {
        duration: 2000,
        position: "top-right"
      });
    } catch (err) {
      console.error("Error preparing edit form:", err);
      const errorMessage = getErrorMessage(err, "Không thể mở form chỉnh sửa. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (lead) => {
    setSelectedLead(lead);
    setShowDeleteModal(true);
  };

  const handleView = async (lead) => {
    try {
      setSelectedLead(lead);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching lead details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết học viên tiềm năng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleConvert = (lead) => {
    setSelectedLead(lead);
    setShowConvertModal(true);
  };

  // Function để lấy class CSS cho trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case 'INTERESTED':
        return Style.interested;
      case 'CONTACTED':
        return Style.contacted;
      case 'QUALIFIED':
        return Style.qualified;
      case 'CONVERTED':
        return Style.converted;
      case 'LOST':
        return Style.lost;
      default:
        return Style.default;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.HoTen.trim()) {
      toast.error("Họ tên không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (!formData.Email.trim()) {
      toast.error("Email không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật học viên tiềm năng...", { id: "edit-lead" });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Đã cập nhật học viên tiềm năng "${formData.HoTen}" thành công!`, {
        id: "edit-lead",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchLeads(currentPage, itemsPerPage, nameFilter, statusFilter);
    } catch (err) {
      console.error("Error updating lead:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật học viên tiềm năng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-lead",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa học viên tiềm năng...", { id: "delete-lead" });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Đã xóa học viên tiềm năng "${selectedLead?.HoTen}" thành công!`, {
        id: "delete-lead",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchLeads(currentPage, itemsPerPage, nameFilter, statusFilter);
    } catch (err) {
      console.error("Error deleting lead:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa học viên tiềm năng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-lead",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.categoryy}>
      
      <div className={Style.container}>
      <div className={Style.top}>
        <h1>Quản lý Học viên Tiềm năng (Leads)</h1>
        <div className={Style.topRight}>
          <FilterableSearch 
            placeholder="Tìm kiếm theo tên hoặc email..." 
            onChange={handleSearch}
            onSearch={handleSearch}
            value={searchTerm}
            statusFilter={selectedStatus}
            onStatusChange={handleStatusChange}
            statusOptions={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'INTERESTED', label: 'Quan tâm' },
              { value: 'CONTACTED', label: 'Đã liên hệ' },
              { value: 'QUALIFIED', label: 'Đủ điều kiện' },
              { value: 'CONVERTED', label: 'Đã chuyển đổi' },
              { value: 'LOST', label: 'Mất liên lạc' }
            ]}
          />
          <Link href="/admin/dashboard/category/add" className={Style.addButton}>
            Thêm Lead mới
          </Link>
        </div>
      </div>

      {/* Hiển thị kết quả tìm kiếm */}
      {searchTerm && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{searchTerm}</strong> | 
          Tìm thấy: <strong>{leads.length}</strong> học viên tiềm năng
          {selectedStatus && (
            <span> | Trạng thái: <strong>{selectedStatus}</strong></span>
          )}
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Họ tên</td>
            <td>Email</td>
            <td>Số điện thoại</td>
            <td>Ngày sinh</td>
            <td>Giới tính</td>
            <td>Trạng thái</td>
            <td>Chiến dịch</td>
            <td>Thao tác</td>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const campaign = mockData.chienDich.find(c => c.MaCD === lead.MaCD);
            return (
              <tr key={lead.MaHVTN}>
                <td>{lead.HoTen}</td>
                <td>{lead.Email}</td>
                <td>{lead.SDT}</td>
                <td>{new Date(lead.NgaySinh).toLocaleDateString('vi-VN')}</td>
                <td>{lead.GioiTinh}</td>
                <td>
                  <span className={`${Style.status} ${getStatusClass(lead.TrangThai)}`}>
                    {lead.TrangThai}
                  </span>
                </td>
                <td>{campaign?.TenCD || 'N/A'}</td>
                <td>
                  <div className={Style.buttons}>
                    <button 
                      className={`${Style.button} ${Style.view}`}
                      onClick={() => handleView(lead)}
                    >
                      Xem
                    </button>
                    <button 
                      className={`${Style.button} ${Style.edit}`}
                      onClick={() => handleEdit(lead)}
                    >
                      Sửa
                    </button>
                    <button 
                      className={`${Style.button} ${Style.convert}`}
                      onClick={() => handleConvert(lead)}
                    >
                      Chuyển đổi
                    </button>
                    <button 
                      className={`${Style.button} ${Style.delete}`}
                      onClick={() => handleDelete(lead)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={Style.darkBg}>
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: leads.length, totalElements: leads.length }} />
      </div>

      {/* Add Modal */}
      

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Chỉnh sửa Học viên Tiềm năng</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Họ tên:</label>
                <input
                  type="text"
                  value={formData.HoTen}
                  onChange={(e) => setFormData({...formData, HoTen: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({...formData, Email: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Số điện thoại:</label>
                <input
                  type="tel"
                  value={formData.SDT}
                  onChange={(e) => setFormData({...formData, SDT: e.target.value})}
                />
              </div>
              <div className={Style.formGroup}>
                <label>Ngày sinh:</label>
                <input
                  type="date"
                  value={formData.NgaySinh}
                  onChange={(e) => setFormData({...formData, NgaySinh: e.target.value})}
                />
              </div>
              <div className={Style.formGroup}>
                <label>Giới tính:</label>
                <select 
                  value={formData.GioiTinh}
                  onChange={(e) => setFormData({...formData, GioiTinh: e.target.value})}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Trạng thái:</label>
                <select 
                  value={formData.TrangThai}
                  onChange={(e) => setFormData({...formData, TrangThai: e.target.value})}
                >
                  <option value="INTERESTED">Quan tâm</option>
                  <option value="CONTACTED">Đã liên hệ</option>
                  <option value="QUALIFIED">Đủ điều kiện</option>
                  <option value="CONVERTED">Đã chuyển đổi</option>
                  <option value="LOST">Mất liên lạc</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Chiến dịch:</label>
                <select 
                  value={formData.MaCD}
                  onChange={(e) => setFormData({...formData, MaCD: e.target.value})}
                >
                  <option value="">Chọn chiến dịch</option>
                  {mockData.chienDich.map(campaign => (
                    <option key={campaign.MaCD} value={campaign.MaCD}>
                      {campaign.TenCD}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={Style.modalButtons}>
                <button type="submit" className={Style.saveButton}>Lưu thay đổi</button>
                <button 
                  type="button" 
                  className={Style.cancelButton}
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Xóa Học viên Tiềm năng</h2>
            <p>Bạn có chắc chắn muốn xóa {selectedLead?.HoTen}?</p>
            <div className={Style.modalButtons}>
              <button 
                className={Style.deleteButton}
                onClick={handleDeleteConfirm}
              >
                Xóa
              </button>
              <button 
                className={Style.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Chi tiết Học viên Tiềm năng</h2>
            <div className={Style.detailContent}>
              <div className={Style.detailItem}>
                <label>Họ tên:</label>
                <span>{selectedLead?.HoTen}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Email:</label>
                <span>{selectedLead?.Email}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Số điện thoại:</label>
                <span>{selectedLead?.SDT}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Ngày sinh:</label>
                <span>{new Date(selectedLead?.NgaySinh).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Giới tính:</label>
                <span>{selectedLead?.GioiTinh}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Trạng thái:</label>
                <span className={`${Style.status} ${getStatusClass(selectedLead?.TrangThai)}`}>
                  {selectedLead?.TrangThai}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Chiến dịch:</label>
                <span>{mockData.chienDich.find(c => c.MaCD === selectedLead?.MaCD)?.TenCD || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Ngày đăng ký:</label>
                <span>{new Date(selectedLead?.NgayDangKy).toLocaleString('vi-VN')}</span>
              </div>
            </div>
            <div className={Style.modalButtons}>
              <button 
                className={Style.cancelButton}
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Chuyển đổi thành Học viên</h2>
            <p>Bạn có chắc chắn muốn chuyển đổi {selectedLead?.HoTen} thành học viên chính thức?</p>
            <div className={Style.modalButtons}>
              <button 
                className={Style.convertButton}
                onClick={() => {
                  // Logic chuyển đổi lead thành học viên
                  toast.success(`Đã chuyển đổi ${selectedLead?.HoTen} thành học viên chính thức!`);
                  setShowConvertModal(false);
                  fetchLeads(currentPage, itemsPerPage, nameFilter, statusFilter);
                }}
              >
                Chuyển đổi
              </button>
              <button 
                className={Style.cancelButton}
                onClick={() => setShowConvertModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Page; 