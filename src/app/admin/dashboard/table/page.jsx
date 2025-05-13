"use client";
import React, { useState, useEffect } from "react";
import Style from "./table.module.css";
import { Pagination, Search } from "../../ui/dashboard/dashboardindex";
import ordertableService from "../../../api/ordertable/ordertableService";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const Page = () => {
  const [tables, setTables] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    numberOfChair: 0,
    state: 'AVAILABLE',
  });

  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");

  // Effect khi trang thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchTables(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, activeTab]);

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

  const fetchTables = async (page, pageSize) => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'active') {
        response = await ordertableService.getActiveTable(page, pageSize);
      } else {
        response = await ordertableService.getOrderTables(page, pageSize);
      }
      
      console.log("API Response (Tables):", response); // Debug thông tin API trả về
      
      if (response.data && Array.isArray(response.data)) {
        setTables(response.data);
        
        if (response.metadata) {
          console.log("Pagination Metadata (Tables):", response.metadata);
          setMetadata(response.metadata);
        } else {
          console.warn("No metadata found in Tables API response");
        }
      } else {
        console.error("Unexpected API response format:", response);
        setTables([]);
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to fetch tables");
      console.error("Error fetching tables:", err);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Lọc dữ liệu phía client (chỉ áp dụng khi có search term)
  const filteredTables = tables.filter(table => {
    if (!debouncedSearchTerm) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return (
      (table?.name?.toLowerCase().includes(searchLower))
    );
  });

  const handleAdd = () => {
    setFormData({
      name: '',
      state: 'AVAILABLE',
      numberOfChair: 0,
    });
    setShowAddModal(true);
  };

  const handleEdit = (table) => {
    setSelectedTable(table);
    setFormData({
      name: table.name || '',
      numberOfChair: table.numberOfChair || 0,
      state: table.state || 'AVAILABLE',
    });
    setShowEditModal(true);
  };

  const handleDelete = (table) => {
    setSelectedTable(table);
    setShowDeleteModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await ordertableService.createOrderTable(formData.name, formData.state, formData.numberOfChair);
      setShowAddModal(false);
      fetchTables(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error adding table:", err);
      setError("Failed to add table");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await ordertableService.updateOrderTable(
        selectedTable.id,
        formData.name,
        formData.state,
        formData.numberOfChair
      );
      setShowEditModal(false);
      fetchTables(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating table:", err);
      setError("Failed to update table");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await ordertableService.deleteOrderTable(selectedTable.id);
      setShowDeleteModal(false);
      fetchTables(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error deleting table:", err);
      setError("Failed to delete table");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return Style.available;
      case 'OCCUPIED':
        return Style.occupied;
      case 'RESERVED':
        return Style.reserved;
      default:
        return '';
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;
  if (error) return <div className={Style.error}>{error}</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
        <h1>Table Management</h1>
        <div className={Style.topRight}>
          <Search 
            placeholder="Tìm kiếm theo tên bàn..." 
            onChange={handleSearch}
            onSearch={handleSearch}
          />
          <button className={Style.addButton} onClick={handleAdd}>
            Add New Table
          </button>
        </div>
      </div>


      {/* Hiển thị kết quả tìm kiếm */}
      {debouncedSearchTerm && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{debouncedSearchTerm}</strong> | 
          Tìm thấy: <strong>{filteredTables.length}</strong> bàn
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Name</td>
            <td>Capacity</td>
            <td>Status</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {filteredTables.map((table) => (
            <tr key={table.id}>
              <td>{table.name}</td>
              <td>{table.numberOfChair} persons</td>
              <td>
                <span className={`${Style.status} ${getStatusColor(table.state)}`}>
                  {table.state}
                </span>
              </td>
              <td>
                <div className={Style.buttons}>
                  <button 
                    className={`${Style.button} ${Style.edit}`}
                    onClick={() => handleEdit(table)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`${Style.button} ${Style.delete}`}
                    onClick={() => handleDelete(table)}
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
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: filteredTables.length, totalElements: filteredTables.length }} />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Add New Table</h2>
            <form onSubmit={handleAddSubmit}>
              <div className={Style.formGroup}>
                <label>Table Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Capacity:</label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfChair}
                  onChange={(e) => setFormData({...formData, numberOfChair: Number(e.target.value)})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>
              <div className={Style.modalButtons}>
                <button type="submit" className={Style.saveButton}>Add Table</button>
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
            <h2>Edit Table</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Table Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Capacity:</label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfChair}
                  onChange={(e) => setFormData({...formData, numberOfChair: Number(e.target.value)})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
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
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Delete Table</h2>
            <p>Are you sure you want to delete table {selectedTable?.name}?</p>
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
    </div>
  );
};

export default Page; 