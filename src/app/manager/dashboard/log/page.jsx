"use client";
import React, { useState, useEffect } from "react";
import Style from "./log.module.css";
import { getLogs, formatDate, getActionTypeColor } from "@/app/api/log/logService";
import { Pagination } from "../../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Page = () => {
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

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [itemsPerPage] = useState(10);
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");

  useEffect(() => {
    fetchLogs(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const fetchLogs = async (page, pageSize) => {
    try {
      setLoading(true);
      const data = await getLogs(page, pageSize);
      console.log("API Response (Logs):", data); // Debug thông tin API trả về
      
      if (data.content && Array.isArray(data.content)) {
        setLogs(data.content);
        
        // Chuẩn bị metadata cho component Pagination
        const metadataObj = {
          page: page,
          totalPages: data.totalPages || 1,
          count: data.content.length,
          totalElements: data.totalElements || data.content.length
        };
        
        console.log("Pagination Metadata (Logs):", metadataObj);
        setMetadata(metadataObj);
        
        // Hiển thị thông báo load thành công
        if (page === 0) {
          toast.success(`Đã tải ${data.content.length} bản ghi log`, {
            duration: 2000,
            position: "top-right"
          });
        }
      } else {
        console.error("Unexpected API response format:", data);
        setLogs([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
      

    } catch (err) {
      console.error("Error fetching logs:", err);
      setLogs([]);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách log. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
        <h1>Activity Logs</h1>
      </div>

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Username</td>
            <td>Role</td>
            <td>Action</td>
            <td>Module</td>
            <td>Description</td>
            <td>Date</td>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.username}</td>
              <td>{log.accountRole}</td>
              <td>
                <span 
                  className={Style.actionType}
                  style={{ backgroundColor: getActionTypeColor(log.actionType) }}
                >
                  {log.actionType}
                </span>
              </td>
              <td>
                <span className={Style.module}>
                  {log.module}
                </span>
              </td>
              <td className={Style.description}>
                {log.description}
              </td>
              <td>{formatDate(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={Style.darkBg}>
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: logs.length, totalElements: logs.length }} />
      </div>
    </div>
  );
};

export default Page;