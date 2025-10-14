"use client";
import React, { useState, useEffect } from "react";
import Style from "./forms.module.css";
import { mockData } from "../../../data/mockData";
import { Pagination, Search } from "../../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LogoutButton from "../../../components/LogoutButton/LogoutButton";
import toast from "react-hot-toast";

const FormsPage = () => {
  const [forms, setForms] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    tenForm: '',
    moTa: '',
    maChienDich: '',
    trangThai: 'ACTIVE',
    cacTruong: [
      { tenTruong: 'Họ tên', loaiTruong: 'text', batBuoc: true, placeholder: 'Nhập họ tên' },
      { tenTruong: 'Email', loaiTruong: 'email', batBuoc: true, placeholder: 'Nhập email' },
      { tenTruong: 'Số điện thoại', loaiTruong: 'tel', batBuoc: true, placeholder: 'Nhập số điện thoại' }
    ],
    cauHinh: {
      mauSac: '#5d57c9',
      kichThuoc: 'medium',
      hienThiTieuDe: true,
      hienThiMoTa: true,
      nutSubmit: 'Gửi',
      nutReset: 'Làm lại'
    }
  });
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [formErrors, setFormErrors] = useState({
    tenForm: '',
    moTa: '',
    maChienDich: ''
  });
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");

  // Effect khi trang thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchForms(currentPage, itemsPerPage, debouncedSearchTerm);
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) {
        // Khi tìm kiếm, quay về trang đầu tiên
        const params = new URLSearchParams(searchParams);
        params.set("page", "0");
        replace(`${pathname}?${params}`);
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, pathname, replace, searchParams]);

  const fetchForms = async (page, pageSize, search = "") => {
    try {
      setLoading(true);
      
      // Sử dụng dữ liệu forms từ mockData
      let filteredForms = [...mockData.forms];
      
      // Lọc theo tên form hoặc mô tả
      if (search) {
        filteredForms = filteredForms.filter(form => 
          form.TenForm.toLowerCase().includes(search.toLowerCase()) ||
          form.MoTa.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Phân trang
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedForms = filteredForms.slice(startIndex, endIndex);
      
      setForms(paginatedForms);
      setMetadata({
        page: page,
        totalPages: Math.ceil(filteredForms.length / pageSize),
        count: paginatedForms.length,
        totalElements: filteredForms.length
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setForms([]);
      const errorMessage = "Không thể tải danh sách form. Vui lòng thử lại!";
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

  const handleAdd = () => {
    setFormData({
      tenForm: '',
      moTa: '',
      maChienDich: '',
      trangThai: 'ACTIVE',
      cacTruong: [
        { tenTruong: 'Họ tên', loaiTruong: 'text', batBuoc: true, placeholder: 'Nhập họ tên' },
        { tenTruong: 'Email', loaiTruong: 'email', batBuoc: true, placeholder: 'Nhập email' },
        { tenTruong: 'Số điện thoại', loaiTruong: 'tel', batBuoc: true, placeholder: 'Nhập số điện thoại' }
      ],
      cauHinh: {
        mauSac: '#5d57c9',
        kichThuoc: 'medium',
        hienThiTieuDe: true,
        hienThiMoTa: true,
        nutSubmit: 'Gửi',
        nutReset: 'Làm lại'
      }
    });
    setShowAddModal(true);
  };

  const handleEdit = (form) => {
    setSelectedForm(form);
    setFormData({
      tenForm: form.TenForm,
      moTa: form.MoTa,
      maChienDich: form.MaChienDich.toString(),
      trangThai: form.TrangThai,
      cacTruong: form.CacTruong,
      cauHinh: form.CauHinh
    });
    setShowEditModal(true);
  };

  const handleDelete = (form) => {
    setSelectedForm(form);
    setShowDeleteModal(true);
  };

  const handleEmbed = (form) => {
    setSelectedForm(form);
    setShowEmbedModal(true);
  };

  const handleView = (form) => {
    setSelectedForm(form);
    setShowViewModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.tenForm.trim()) {
      toast.error("Tên form không được để trống!");
      return;
    }
    if (!formData.moTa.trim()) {
      toast.error("Mô tả không được để trống!");
      return;
    }
    if (!formData.maChienDich) {
      toast.error("Vui lòng chọn chiến dịch!");
      return;
    }
    
    try {
      toast.loading("Đang tạo form...", { id: "add-form" });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new form
      const newForm = {
        MaForm: mockData.forms.length + 1,
        TenForm: formData.tenForm,
        MoTa: formData.moTa,
        MaChienDich: parseInt(formData.maChienDich),
        TrangThai: formData.trangThai,
        CacTruong: formData.cacTruong,
        CauHinh: formData.cauHinh,
        EmbedCode: `<iframe src="https://brainstem.edu.vn/forms/${mockData.forms.length + 1}" width="100%" height="500" frameborder="0"></iframe>`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      toast.success("Đã tạo form thành công!", {
        id: "add-form",
        duration: 3000,
        position: "top-center"
      });
      
      setShowAddModal(false);
      fetchForms(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error adding form:", err);
      toast.error("Không thể tạo form. Vui lòng thử lại!", {
        id: "add-form",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      toast.loading("Đang cập nhật form...", { id: "edit-form" });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Đã cập nhật form thành công!", {
        id: "edit-form",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchForms(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating form:", err);
      toast.error("Không thể cập nhật form. Vui lòng thử lại!", {
        id: "edit-form",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa form...", { id: "delete-form" });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Đã xóa form thành công!", {
        id: "delete-form",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchForms(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error deleting form:", err);
      toast.error("Không thể xóa form. Vui lòng thử lại!", {
        id: "delete-form",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      cacTruong: [...prev.cacTruong, { tenTruong: '', loaiTruong: 'text', batBuoc: false, placeholder: '' }]
    }));
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      cacTruong: prev.cacTruong.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cacTruong: prev.cacTruong.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
        <h1>Quản lý Form</h1>
        <div className={Style.topRight}>
          <Search 
            placeholder="Tìm kiếm theo tên hoặc mô tả form..." 
            onChange={handleSearch}
            onSearch={handleSearch}
          />
          <button className={Style.addButton} onClick={handleAdd}>
            Tạo Form mới
          </button>
        </div>
      </div>

      {/* Hiển thị kết quả tìm kiếm */}
      {debouncedSearchTerm && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{debouncedSearchTerm}</strong> | 
          Tìm thấy: <strong>{forms.length}</strong> form
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Tên Form</td>
            <td>Mô tả</td>
            <td>Chiến dịch</td>
            <td>Trạng thái</td>
            <td>Số trường</td>
            <td>Ngày tạo</td>
            <td>Thao tác</td>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => {
            const campaign = mockData.chienDich.find(c => c.MaCD === form.MaChienDich);
            return (
              <tr key={form.MaForm}>
                <td>{form.TenForm}</td>
                <td>{form.MoTa}</td>
                <td>{campaign?.TenCD || 'N/A'}</td>
                <td>
                  <span className={`${Style.status} ${form.TrangThai === 'ACTIVE' ? Style.available : Style.unavailable}`}>
                    {form.TrangThai === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </td>
                <td>{form.CacTruong.length} trường</td>
                <td>{new Date(form.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className={Style.buttons}>
                    <button 
                      className={`${Style.button} ${Style.view}`}
                      onClick={() => handleView(form)}
                    >
                      Xem
                    </button>
                    <button 
                      className={`${Style.button} ${Style.edit}`}
                      onClick={() => handleEdit(form)}
                    >
                      Sửa
                    </button>
                    <button 
                      className={`${Style.button} ${Style.embed}`}
                      onClick={() => handleEmbed(form)}
                    >
                      Embed
                    </button>
                    <button 
                      className={`${Style.button} ${Style.delete}`}
                      onClick={() => handleDelete(form)}
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
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: forms.length, totalElements: forms.length }} />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal} style={{ maxWidth: '800px' }}>
            <h2>Tạo Form mới</h2>
            <form onSubmit={handleAddSubmit}>
              <div className={Style.formGroup}>
                <label>Tên Form:</label>
                <input
                  type="text"
                  value={formData.tenForm}
                  onChange={(e) => setFormData({...formData, tenForm: e.target.value})}
                  required
                />
              </div>

              <div className={Style.formGroup}>
                <label>Mô tả:</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData({...formData, moTa: e.target.value})}
                  required
                />
              </div>

              <div className={Style.formGroup}>
                <label>Chiến dịch:</label>
                <select
                  value={formData.maChienDich}
                  onChange={(e) => setFormData({...formData, maChienDich: e.target.value})}
                  required
                >
                  <option value="">Chọn chiến dịch</option>
                  {mockData.chienDich.map(campaign => (
                    <option key={campaign.MaCD} value={campaign.MaCD}>
                      {campaign.TenCD}
                    </option>
                  ))}
                </select>
              </div>

              <div className={Style.formGroup}>
                <label>Trạng thái:</label>
                <select
                  value={formData.trangThai}
                  onChange={(e) => setFormData({...formData, trangThai: e.target.value})}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm dừng</option>
                </select>
              </div>

              <div className={Style.formGroup}>
                <label>Các trường form:</label>
                {formData.cacTruong.map((field, index) => (
                  <div key={index} className={Style.fieldRow}>
                    <input
                      type="text"
                      placeholder="Tên trường"
                      value={field.tenTruong}
                      onChange={(e) => updateField(index, 'tenTruong', e.target.value)}
                    />
                    <select
                      value={field.loaiTruong}
                      onChange={(e) => updateField(index, 'loaiTruong', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="tel">Số điện thoại</option>
                      <option value="date">Ngày</option>
                      <option value="number">Số</option>
                      <option value="select">Dropdown</option>
                      <option value="textarea">Textarea</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Placeholder"
                      value={field.placeholder}
                      onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={field.batBuoc}
                        onChange={(e) => updateField(index, 'batBuoc', e.target.checked)}
                      />
                      Bắt buộc
                    </label>
                    <button type="button" onClick={() => removeField(index)} className={Style.removeButton}>
                      Xóa
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addField} className={Style.addFieldButton}>
                  Thêm trường
                </button>
              </div>

              <div className={Style.modalButtons}>
                <button type="submit" className={Style.submitButton}>
                  Tạo Form
                </button>
                <button 
                  type="button" 
                  className={Style.cancelButton}
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal} style={{ maxWidth: '800px' }}>
            <h2>Embed Code - {selectedForm?.TenForm}</h2>
            <p>Copy đoạn code dưới đây để nhúng form vào website của bạn:</p>
            
            <div className={Style.embedCodeContainer}>
              <textarea
                value={selectedForm?.EmbedCode || ''}
                readOnly
                className={Style.embedCode}
                rows={8}
              />
              <button 
                className={Style.copyButton}
                onClick={() => {
                  navigator.clipboard.writeText(selectedForm?.EmbedCode || '');
                  toast.success('Đã copy embed code!');
                }}
              >
                Copy Code
              </button>
            </div>

            <div className={Style.previewContainer}>
              <h3>Preview:</h3>
              <div 
                className={Style.previewFrame}
                dangerouslySetInnerHTML={{ __html: selectedForm?.EmbedCode || '' }}
              />
            </div>

            <div className={Style.modalButtons}>
              <button 
                className={Style.cancelButton}
                onClick={() => setShowEmbedModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Chi tiết Form</h2>
            <div className={Style.viewContent}>
              <p><strong>Tên Form:</strong> {selectedForm?.TenForm}</p>
              <p><strong>Mô tả:</strong> {selectedForm?.MoTa}</p>
              <p><strong>Chiến dịch:</strong> {mockData.chienDich.find(c => c.MaCD === selectedForm?.MaChienDich)?.TenCD || 'N/A'}</p>
              <p><strong>Trạng thái:</strong> {selectedForm?.TrangThai === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}</p>
              <p><strong>Số trường:</strong> {selectedForm?.CacTruong.length}</p>
              <p><strong>Ngày tạo:</strong> {selectedForm?.createdAt ? new Date(selectedForm.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
              
              <h3>Các trường form:</h3>
              <ul>
                {selectedForm?.CacTruong.map((field, index) => (
                  <li key={index}>
                    {field.tenTruong} ({field.loaiTruong}) {field.batBuoc ? '(Bắt buộc)' : '(Tùy chọn)'}
                  </li>
                ))}
              </ul>
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Xóa Form</h2>
            <p>Bạn có chắc chắn muốn xóa form "{selectedForm?.TenForm}"?</p>
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
    </div>
  );
};

export default FormsPage;
