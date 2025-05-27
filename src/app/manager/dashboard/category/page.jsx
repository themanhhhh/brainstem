"use client";
import React, { useState, useEffect } from "react";
import Style from "./category.module.css";
import { useLanguageService } from "../../../hooks/useLanguageService";
import { Pagination, Search } from "../../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const Page = () => {
  const { categoryService, language } = useLanguageService();
  const [categories, setCategories] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    state: 'ACTIVE'
  });
  const [itemsPerPage, setItemsPerPage] = useState(8);
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");

  // Effect khi trang thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchCategories(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Effect để gọi lại API khi ngôn ngữ thay đổi
  useEffect(() => {
    fetchCategories(currentPage, itemsPerPage);
  }, [language]); // Thêm language vào dependency

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

  const fetchCategories = async (page, pageSize) => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories(page, pageSize);
      
      console.log("API Response (Categories):", response); // Debug thông tin API trả về
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.metadata) {
          console.log("Pagination Metadata (Categories):", response.metadata); // Debug metadata
          setMetadata(response.metadata);
        } else {
          console.warn("No metadata found in Categories API response");
        }
      } else {
        console.error("Unexpected API response format:", response);
        setCategories([]);
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Lọc dữ liệu phía client (chỉ áp dụng khi có search term)
  const filteredCategories = categories.filter(category => {
    if (!debouncedSearchTerm) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return (
      (category?.name?.toLowerCase().includes(searchLower)) ||
      (category?.description?.toLowerCase().includes(searchLower))
    );
  });

  const handleAdd = () => {
    setFormData({ name: '', description: '', state: 'ACTIVE' });
    setShowAddModal(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      state: category.state || 'ACTIVE'
    });
    setShowEditModal(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleView = async (category) => {
    try {
      const categoryDetail = await categoryService.getCategoryById(category.id);
      setSelectedCategory(categoryDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching category details:", err);
      setError("Failed to fetch category details");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await categoryService.addCategory(formData);
      setShowAddModal(false);
      fetchCategories(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error adding category:", err);
      setError("Failed to add category");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await categoryService.updateCategory(selectedCategory.id, formData);
      setShowEditModal(false);
      fetchCategories(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Failed to update category");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await categoryService.deleteCategory(selectedCategory.id);
      setShowDeleteModal(false);
      fetchCategories(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category");
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;
  if (error) return <div className={Style.error}>{error}</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
        <h1>Categories Management</h1>
        <div className={Style.topRight}>
          <Search 
            placeholder="Tìm kiếm theo tên hoặc mô tả danh mục..." 
            onChange={handleSearch}
            onSearch={handleSearch}
          />
          <button className={Style.addButton} onClick={handleAdd}>
            Add New Category
          </button>
        </div>
      </div>

      {/* Hiển thị kết quả tìm kiếm */}
      {debouncedSearchTerm && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{debouncedSearchTerm}</strong> | 
          Tìm thấy: <strong>{filteredCategories.length}</strong> danh mục
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Name</td>
            <td>Description</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>
                <div className={Style.buttons}>
                  <button 
                    className={`${Style.button} ${Style.view}`}
                    onClick={() => handleView(category)}
                  >
                    View
                  </button>
                  <button 
                    className={`${Style.button} ${Style.edit}`}
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`${Style.button} ${Style.delete}`}
                    onClick={() => handleDelete(category)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={Style.darkBg}>
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: filteredCategories.length, totalElements: filteredCategories.length }} />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Add New Category</h2>
            <form onSubmit={handleAddSubmit}>
              <div className={Style.formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className={Style.modalButtons}>
                <button type="submit" className={Style.saveButton}>Add Category</button>
                <button 
                  type="button" 
                  className={Style.cancelButton}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Edit Category</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className={Style.modalButtons}>
                <button type="submit" className={Style.saveButton}>Save Changes</button>
                <button 
                  type="button" 
                  className={Style.cancelButton}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
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
            <h2>Delete Category</h2>
            <p>Are you sure you want to delete {selectedCategory?.name}?</p>
            <div className={Style.modalButtons}>
              <button 
                className={Style.deleteButton}
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
              <button 
                className={Style.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Category Details</h2>
            <div className={Style.detailContent}>
              <div className={Style.detailItem}>
                <label>Name:</label>
                <span>{selectedCategory?.name}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Description:</label>
                <span>{selectedCategory?.description}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Created At:</label>
                <span>{new Date(selectedCategory?.createdAt).toLocaleString()}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Updated At:</label>
                <span>{new Date(selectedCategory?.updatedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className={Style.modalButtons}>
              <button 
                className={Style.cancelButton}
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page; 