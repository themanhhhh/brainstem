'use client';
import React, { useState, Suspense, useEffect, useCallback } from "react";
import Style from "./users.module.css";
import { Pagination, Search } from "../../ui/dashboard/dashboardindex";
import Image from "next/image";
import Link from "next/link";
import { userService } from "../../../api/user/userService";
import images from "../../../img/index";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LogoutButton from "../../../components/LogoutButton/LogoutButton";
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    username: '',
    password: '',
    phoneNumber: '',
    email: '',
    role: '',
    state: ''
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Thêm debounce cho việc tìm kiếm
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");

  // Effect khi trang thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

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

  const fetchUsers = async (page, size) => {
    try {
      setLoading(true);
      const response = await userService.getUser(page, size);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách người dùng");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setUsers([]);
        return;
      }
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.metadata) {
          setMetadata(response.metadata);
        }
        
        // Hiển thị thông báo load thành công
        if (page === 0) {
          toast.success(`Đã tải ${response.data.length} người dùng`, {
            duration: 2000,
            position: "top-right"
          });
        }
      } else {
        console.error("Unexpected API response format:", response);
        setUsers([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách người dùng. Vui lòng thử lại!");
      setUsers([]);
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

  // Lọc dữ liệu phía client (chỉ áp dụng khi có search term)
  const filteredUsers = users.filter(user => {
    if (!debouncedSearchTerm) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return (
      (user?.fullName?.toLowerCase().includes(searchLower)) ||
      (user?.email?.toLowerCase().includes(searchLower)) ||
      (user?.username?.toLowerCase().includes(searchLower)) ||
      (user?.phoneNumber?.toLowerCase().includes(searchLower))
    );
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || '',
      username: user.username || '',
      password: '',
      phoneNumber: user.phoneNumber || '',
      email: user.email || '',
      role: user.role || '',
      state: user.state || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editForm.fullName.trim()) {
      toast.error("Họ tên không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    if (!editForm.username.trim()) {
      toast.error("Username không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    if (!editForm.email.trim()) {
      toast.error("Email không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error("Email không đúng định dạng!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật người dùng...", { id: "edit-user" });
      
      const response = await userService.updateUser(
        selectedUser.id,
        editForm.fullName,
        editForm.username,
        editForm.password,
        editForm.phoneNumber,
        editForm.email,
        editForm.role,
        editForm.state  
      );
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật người dùng");
        toast.error(errorMessage, {
          id: "edit-user",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật người dùng "${editForm.fullName}" thành công!`, {
        id: "edit-user",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchUsers(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating user:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật người dùng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-user",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa người dùng...", { id: "delete-user" });
      
      const response = await userService.deleteUser(selectedUser.id);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa người dùng");
        toast.error(errorMessage, {
          id: "delete-user",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa người dùng "${selectedUser.fullName}" thành công!`, {
        id: "delete-user",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchUsers(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error deleting user:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa người dùng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-user",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleView = async (user) => {
    try {
      const userDetail = await userService.getUserById(user.id);
      
      // Kiểm tra lỗi từ response
      if (userDetail && (userDetail.code >= 400 || userDetail.error || userDetail.status >= 400)) {
        const errorMessage = getErrorMessage(userDetail, "Không thể tải chi tiết người dùng");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      setSelectedUser(userDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết người dùng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.userr}>
      
      <div className={Style.container}>
        <div className={Style.top}>
            <Suspense fallback={<div>Loading...</div>}>
              <Search 
                onChange={handleSearch} 
                onSearch={handleSearch} 
                placeholder="Tìm kiếm theo tên, email, username, hoặc số điện thoại..."
              />
            </Suspense>
            <Link href="/admin/dashboard/users/add">
              <button className={Style.addButton}>Add New</button>
            </Link>
        </div>
      
        {/* Hiển thị kết quả tìm kiếm */}
        {debouncedSearchTerm && (
          <div className={Style.searchInfo}>
            Kết quả tìm kiếm cho: <strong>{debouncedSearchTerm}</strong> | 
            Tìm thấy: <strong>{filteredUsers.length}</strong> người dùng
          </div>
        )}

        <table className={Style.table}>
          <thead>
            <tr>
              <td>Name</td>
              <td>Email</td>
              <td>Username</td>
              <td>Phone</td>
              <td>Role</td>
              <td>Status</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={Style.user}>
                    {user.fullName}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`${Style.status} ${user.state === 'ACTIVE' ? Style.active : Style.inactive}`}>
                    {user.state}
                  </span>
                </td>
                <td>
                  <div className={Style.buttons}>
                    <button 
                      className={`${Style.button} ${Style.view}`}
                      onClick={() => handleView(user)}
                    >
                      View
                    </button>
                    <button 
                      className={`${Style.button} ${Style.edit}`}
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className={`${Style.button} ${Style.delete}`}
                      onClick={() => handleDelete(user)}
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
          <Suspense fallback={<div>Loading...</div>}>
            <Pagination metadata={metadata || { page: 0, totalPages: 1, count: filteredUsers.length, totalElements: filteredUsers.length }} />
          </Suspense>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Edit User</h2>
              <form onSubmit={handleEditSubmit}>
                <div className={Style.formGroup}>
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Username:</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Password:</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Phone Number:</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Role:</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    required
                  >
                    <option value={editForm.role}>{editForm.role}</option>
                    {editForm.role !== 'ADMIN' && <option value="ADMIN">ADMIN</option>}
                    {editForm.role !== 'STAFF' && <option value="STAFF">STAFF</option>}
                    {editForm.role !== 'CUSTOMER' && <option value="CUSTOMER">CUSTOMER</option>}
                    {editForm.role !== 'MANAGER' && <option value="MANAGER">MANAGER</option>}
                   
                  </select>
                </div>
                <div className={Style.formGroup}>
                  <label>Status:</label>
                  <select
                    value={editForm.state}
                    onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                    required
                  >
                    <option value={editForm.state}>{editForm.state}</option>
                    {editForm.state !== 'ACTIVE' && <option value="ACTIVE">ACTIVE</option>}
                    {editForm.state !== 'INACTIVE' && <option value="INACTIVE">INACTIVE</option>}
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
              <h2>Delete User</h2>
              <p>Are you sure you want to delete user {selectedUser?.fullName}?</p>
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
              <h2>User Details</h2>
              <div className={Style.detailContent}>
                <div className={Style.detailItem}>
                  <label>Full Name:</label>
                  <span>{selectedUser?.fullName}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Username:</label>
                  <span>{selectedUser?.username}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Email:</label>
                  <span>{selectedUser?.email}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Phone Number:</label>
                  <span>{selectedUser?.phoneNumber}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Role:</label>
                  <span>{selectedUser?.role}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Status:</label>
                  <span className={`${Style.status} ${selectedUser?.state === 'ACTIVE' ? Style.active : Style.inactive}`}>
                    {selectedUser?.state}
                  </span>
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