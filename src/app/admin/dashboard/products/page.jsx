"use client";
import React, { useState, Suspense, useEffect } from "react";
import Style from "./products.module.css";
import { Pagination, FilterableSearch } from "../../ui/dashboard/dashboardindex";
import Image from "next/image";
import Link from "next/link";
import { foodService } from "../../../api/food/foodService";
import { categoryService } from "../../../api/category/categoryService";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [foods, setFoods] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    imgUrl: '',
    categoryId: '',
    state: '',
    quantity: ''
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { uploadToPinata, error: uploadError, openError } = useCart();
  
  // Thêm debounce cho việc tìm kiếm
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Create a reference to store the current AbortController
  const abortControllerRef = React.useRef(null);
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang và các bộ lọc từ URL
  const currentPage = parseInt(searchParams.get("page") || "0");
  const nameFilter = searchParams.get("name") || "";
  const statusFilter = searchParams.get("state") || "";
  const categoryFilter = searchParams.get("categoryId") || "";

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchFoods(currentPage, itemsPerPage, nameFilter, categoryFilter, statusFilter);
    fetchActiveCategories();
  }, [currentPage, itemsPerPage, nameFilter, categoryFilter, statusFilter]);

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

  const fetchFoods = async (page, pageSize, name = '', categoryId = null, state = null) => {
    try {
      setLoading(true);
      
      // Abort previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new AbortController
      const controller = new AbortController();
      const signal = controller.signal;
      
      // Store controller in the ref
      abortControllerRef.current = controller;
      
      const response = await foodService.getAllFoods(name, categoryId, state, page, pageSize, signal);
      
      // Kiểm tra nếu request đã bị hủy
      if (signal.aborted) return;
      
      console.log("API Response (Foods):", response);
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.data && Array.isArray(response.data)) {
        setFoods(response.data);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.metadata) {
          console.log("Pagination Metadata (Foods):", response.metadata);
          setMetadata(response.metadata);
        } else {
          console.warn("No metadata found in Foods API response");
        }
      } else {
        console.error("Unexpected API response format:", response);
        setFoods([]);
      }
      
      setError(null);
    } catch (err) {
      // Kiểm tra nếu lỗi là do hủy request
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      
      setError("Failed to fetch foods");
      console.error("Error fetching foods:", err);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await foodService.getCategories();
      const categoryData = Array.isArray(response) ? response : response.data || [];
      setCategories(categoryData);
    } catch (err) {
      console.error("Error fetching categories:", err);
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
    updateFilters({ state: status });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    updateFilters({ categoryId });
  };

  // Lọc dữ liệu phía client (chỉ áp dụng khi có search term)
  const filteredFoods = foods.filter(food => {
    if (!debouncedSearchTerm) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return (
      (food?.name?.toLowerCase().includes(searchLower)) ||
      (food?.description?.toLowerCase().includes(searchLower)) ||
      (activeCategories.find(cat => cat.id === food.categoryId)?.name?.toLowerCase().includes(searchLower))
    );
  });

  const handleEdit = async (food) => {
    try {
      // Set loading state
      setLoading(true);
      
      // Fetch the active categories for the edit form
      await fetchActiveCategories();
      
      // Get detailed food info if needed
      const foodDetail = await foodService.getFoodById(food.id);
      
      // Set the selected food
      setSelectedFood(foodDetail || food);
      
      // Set the form data
      setEditForm({
        name: (foodDetail || food).name || '',
        description: (foodDetail || food).description || '',
        price: (foodDetail || food).price || '',
        image: null,
        imgUrl: (foodDetail || food).imgUrl || '',
        categoryId: (foodDetail || food).categoryId || '',
        state: (foodDetail || food).state || '',
        quantity: (foodDetail || food).quantity || 0
      });
      
      // Show the edit modal
      setShowEditModal(true);
    } catch (err) {
      console.error("Error preparing food edit form:", err);
      setError("Failed to prepare edit form");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditForm(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let imgUrl = editForm.imgUrl;
      
      // Upload new image if selected
      if (editForm.image) {
        imgUrl = await uploadToPinata(editForm.image);
      }
      
      await foodService.updateFood(
        selectedFood.id,
        editForm.name,
        editForm.description,
        editForm.price,
        imgUrl,
        editForm.categoryId,
        editForm.state,
        editForm.quantity
      );
      setShowEditModal(false);
      fetchFoods(currentPage, itemsPerPage, nameFilter, categoryFilter, statusFilter);
    } catch (err) {
      console.error("Error updating food:", err);
      setError("Failed to update food");
    }
  };

  const handleDelete = (food) => {
    setSelectedFood(food);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await foodService.deleteFood(selectedFood.id);
      setShowDeleteModal(false);
      fetchFoods(currentPage, itemsPerPage, nameFilter, categoryFilter, statusFilter);
    } catch (err) {
      console.error("Error deleting food:", err);
      setError("Failed to delete food");
    }
  };

  const handleView = async (food) => {
    try {
      const foodDetail = await foodService.getFoodById(food.id);
      setSelectedFood(foodDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching food details:", err);
      setError("Failed to fetch food details");
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;
  if (error) return <div className={Style.error}>{error}</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
        <h1>Products Management</h1>
        <div className={Style.topRight}>
          <FilterableSearch 
            placeholder="Tìm kiếm theo tên món ăn..." 
            onChange={handleSearch}
            onSearch={handleSearch}
            value={searchTerm}
            statusFilter={selectedStatus}
            onStatusChange={handleStatusChange}
            statusOptions={[
              { value: '', label: 'All Statuses' },
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'UNAVAILABLE', label: 'Unavailable' }
            ]}
          />
          {activeCategories.length > 0 && (
            <div className={Style.categoryFilter}>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={Style.categorySelect}
              >
                <option value="">All Categories</option>
                {activeCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Link href="/admin/dashboard/products/add" className={Style.addButton}>
            Add New Product
          </Link>
        </div>
      </div>

      {/* Hiển thị loading indicator */}
      {loading && (
        <div className={Style.loadingOverlay}>
          <div className={Style.loadingSpinner}></div>
        </div>
      )}

      {/* Hiển thị kết quả tìm kiếm */}
      {(nameFilter || statusFilter || categoryFilter) && (
        <div className={Style.searchInfo}>
          {nameFilter && (
            <>Kết quả tìm kiếm cho: <strong>{nameFilter}</strong> | </>
          )}
          Tìm thấy: <strong>{foods.length}</strong> món ăn
          {statusFilter && (
            <span> | Trạng thái: <strong>{statusFilter}</strong></span>
          )}
          {categoryFilter && (
            <span> | Danh mục: <strong>
              {activeCategories.find(c => c.id.toString() === categoryFilter)?.name || categoryFilter}
            </strong></span>
          )}
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Image</td>
            <td>Name</td>
            <td>Description</td>
            <td>Price</td>
            <td>Category</td>
            <td>Status</td>
            <td>Quantity</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food.id}>
              <td>
                <div className={Style.imgContainer}>
                  {food.imgUrl ? (
                    <Image src={food.imgUrl} alt={food.name} width={40} height={40} className={Style.foodImage} />
                  ) : (
                    <div className={Style.noImage}>No Image</div>
                  )}
                </div>
              </td>
              <td>{food.name}</td>
              <td className={Style.description}>{food.description}</td>
              <td>${food.price}</td>
              <td>
                {activeCategories.find(cat => cat.id === food.categoryId)?.name || "Unknown"}
              </td>
              <td>
                <span className={`${Style.status} ${food.state === 'AVAILABLE' ? Style.active : Style.inactive}`}>
                  {food.state || "N/A"}
                </span>
              </td>
              <td>{food.quantity || 0}</td>
              <td>
                <div className={Style.buttons}>
                  <button
                    className={`${Style.button} ${Style.view}`}
                    onClick={() => handleView(food)}
                  >
                    View
                  </button>
                  <button
                    className={`${Style.button} ${Style.edit}`}
                    onClick={() => handleEdit(food)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${Style.button} ${Style.delete}`}
                    onClick={() => handleDelete(food)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={Style.pagination}>
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: foods.length, totalElements: foods.length }} />
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Edit Food</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Description:</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Price:</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Quantity:</label>
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Current Image:</label>
                {editForm.imgUrl && (
                  <div className={Style.currentImage}>
                    <Image 
                      src={editForm.imgUrl}
                      alt={editForm.name}
                      width={100}
                      height={100}
                      className={Style.foodImagePreview}
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
                <label>Category:</label>
                <select
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm({...editForm, categoryId: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {activeCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select
                  value={editForm.state}
                  onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                  required
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="UNAVAILABLE">UNAVAILABLE</option>
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
            <h2>Delete Food</h2>
            <p>Are you sure you want to delete {selectedFood?.name}?</p>
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
            <h2>Food Details</h2>
            <div className={Style.detailContent}>
              <div className={Style.detailImage}>
                <Image 
                  src={selectedFood?.imgUrl || '/placeholder.png'}
                  alt={selectedFood?.name}
                  width={200}
                  height={200}
                  className={Style.foodImage}
                />
              </div>
              <div className={Style.detailItem}>
                <label>Name:</label>
                <span>{selectedFood?.name}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Description:</label>
                <span>{selectedFood?.description}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Price:</label>
                <span>${selectedFood?.price}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Quantity:</label>
                <span>{selectedFood?.quantity || 0}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Category:</label>
                <span>
                  {activeCategories.find(cat => cat.id === selectedFood?.categoryId)?.name || 'N/A'}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Status:</label>
                <span className={`${Style.status} ${selectedFood.state === "AVAILABLE" ? Style.active : Style.inactive}`}>
                  {selectedFood?.state}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Created At:</label>
                <span>{new Date(selectedFood?.createdAt).toLocaleString()}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Updated At:</label>
                <span>{new Date(selectedFood?.updatedAt).toLocaleString()}</span>
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