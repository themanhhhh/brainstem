"use client";
import React, { useState, useEffect } from "react";
import Style from "./category.module.css";
import { categoryService } from "../../../api/category/categoryService";
import { Pagination, FilterableSearch } from "../../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import Image from "next/image";
import LogoutButton from "@/app/components/LogoutButton/LogoutButton";

const Page = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imgUrl: '',
    state: 'ACTIVE'
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
    fetchCategories(currentPage, itemsPerPage, nameFilter, statusFilter);
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

  const fetchCategories = async (page, pageSize, name = "", state = "") => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories(name, state, page, pageSize);
      
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

  const fetchActiveCategories = async () => {
    try {
      const response = await categoryService.getActiveCategories();
      console.log("Active Categories:", response);
      
      // Check if response is an array or has data property
      if (Array.isArray(response)) {
        setActiveCategories(response);
      } else if (response.data && Array.isArray(response.data)) {
        setActiveCategories(response.data);
      } else {
        console.warn("Unexpected active categories response format");
        setActiveCategories([]);
      }
    } catch (err) {
      console.error("Error fetching active categories:", err);
      setActiveCategories([]);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };

  const handleAdd = () => {
    // Fetch active categories when opening the Add modal
    fetchActiveCategories();
    setFormData({ name: '', description: '', image: null, imgUrl: '', state: 'ACTIVE' });
    setShowAddModal(true);
  };

  const handleEdit = async (category) => {
    try {
      // Set loading state
      setLoading(true);
      
      // Fetch the active categories
      await fetchActiveCategories();
      
      // Get the detailed info of the selected category
      const categoryDetail = await categoryService.getCategoryById(category.id);
      
      // Set the selected category
      setSelectedCategory(categoryDetail);
      // Initialize the form data
      setFormData({
        name: categoryDetail.name || '',
        description: categoryDetail.description || '',
        image: null,
        imgUrl: categoryDetail.imgUrl || '',
        state: categoryDetail.state || 'ACTIVE'
      });
      
      // Show the edit modal
      setShowEditModal(true);
    } catch (err) {
      console.error("Error preparing edit form:", err);
      setError("Failed to prepare edit form");
    } finally {
      setLoading(false);
    }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      let categoryData = {
        name: formData.name,
        description: formData.description,
        state: formData.state
      };
      
      // Upload image if selected
      if (formData.image) {
        const imgUrl = await uploadToPinata(formData.image);
        categoryData.imgUrl = imgUrl;
      }
      
      await categoryService.addCategory(categoryData);
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
      let categoryData = {
        name: formData.name,
        description: formData.description,
        state: formData.state
      };
      
      // Upload new image if selected
      if (formData.image) {
        const imgUrl = await uploadToPinata(formData.image);
        categoryData.imgUrl = imgUrl;
      } else if (formData.imgUrl) {
        categoryData.imgUrl = formData.imgUrl;
      }
      
      await categoryService.updateCategory(selectedCategory.id, categoryData);
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
    <div className={Style.categoryy}>
      <div className={Style.header}>
        <h1></h1>
        <LogoutButton />
      </div>
      <div className={Style.container}>
      <div className={Style.top}>
        <h1>Categories Management</h1>
        <div className={Style.topRight}>
          <FilterableSearch 
            placeholder="Tìm kiếm theo tên danh mục..." 
            onChange={handleSearch}
            onSearch={handleSearch}
            value={searchTerm}
            statusFilter={selectedStatus}
            onStatusChange={handleStatusChange}
            statusOptions={[
              { value: '', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' }
            ]}
          />
          <button className={Style.addButton} onClick={handleAdd}>
            Add New Category
          </button>
        </div>
      </div>

      {/* Hiển thị kết quả tìm kiếm */}
      {searchTerm && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{searchTerm}</strong> | 
          Tìm thấy: <strong>{categories.length}</strong> danh mục
          {selectedStatus && (
            <span> | Trạng thái: <strong>{selectedStatus}</strong></span>
          )}
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Image</td>
            <td>Name</td>
            <td>Description</td>
            <td>Status</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>
                  <div className={Style.imageContainer}>
                    <Image 
                      src={category.imgUrl}
                      alt={category.name}
                      width={50}
                      height={50}
                      className={Style.categoryImage}
                    />
                  </div>
              </td>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>
                <span className={`${Style.status} ${category.state === 'ACTIVE' ? Style.active : Style.inactive}`}>
                  {category.state || 'ACTIVE'}
                </span>
              </td>
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
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: categories.length, totalElements: categories.length }} />
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
              <div className={Style.formGroup}>
                <label>Upload Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select 
                  className={`${Style.statusSelect}`}
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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
              {openError && <div className={Style.error}>{uploadError}</div>}
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
              <div className={Style.formGroup}>
                <label>Current Image:</label>
                {formData.imgUrl && (
                  <div className={Style.currentImage}>
                    <Image 
                      src={formData.imgUrl}
                      alt={formData.name}
                      width={100}
                      height={100}
                      className={Style.categoryImagePreview}
                    />
                  </div>
                )}
              </div>
              <div className={Style.formGroup}>
                <label>Upload New Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <small>Leave empty to keep current image</small>
              </div>
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select 
                  className={`${Style.statusSelect}`}
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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
              {openError && <div className={Style.error}>{uploadError}</div>}
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
              {selectedCategory?.imgUrl && (
                <div className={Style.detailImage}>
                  <Image 
                    src={selectedCategory.imgUrl}
                    alt={selectedCategory.name}
                    width={200}
                    height={200}
                    className={Style.categoryImage}
                  />
                </div>
              )}
              <div className={Style.detailItem}>
                <label>Name:</label>
                <span>{selectedCategory?.name}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Description:</label>
                <span>{selectedCategory?.description}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Status:</label>
                <span className={`${Style.status} ${selectedCategory?.state === 'ACTIVE' ? Style.active : Style.inactive}`}>
                  {selectedCategory?.state || 'ACTIVE'}
                </span>
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
    </div>
  );
};

export default Page; 