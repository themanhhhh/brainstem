"use client";

import React, { useEffect, useState } from "react";
import styles from "./order.module.css";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Pagination, FilterableSearch } from "../../ui/dashboard/dashboardindex";
import { useLanguageService } from "../../../hooks/useLanguageService";

const OrderPage = () => {
    const { orderService } = useLanguageService();
    const [orders, setOrders] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentPage = parseInt(searchParams.get("page") || "0");
    const statusFilter = searchParams.get("status") || "";

    useEffect(() => {
        fetchOrders(currentPage, statusFilter);
    }, [currentPage, statusFilter]);

    const updateFilters = (newFilters) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        params.set("page", "0");
        replace(`${pathname}?${params}`);
    };

    const fetchOrders = async (page, status) => {
        try {
            setLoading(true);
            const response = await orderService.getOrders(page, 10, status);
            if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
                setMetadata(response.metadata || null);
            } else {
                console.warn("Unexpected orders response format", response);
                setOrders([]);
                setMetadata(null);
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setOrders([]);
            setMetadata(null);
            setError("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => setSearchTerm(value);
    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        updateFilters({ status });
    };

    const handleView = async (orderId) => {
        try {
            const detail = await orderService.getOrderById(orderId);
            setSelectedOrder(detail);
            setShowDetailModal(true);
        } catch (err) {
            console.error("Error fetching order detail:", err);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1>Orders Management</h1>
                <FilterableSearch
                    placeholder="Search by table or customer..."
                    onChange={handleSearch}
                    onSearch={handleSearch}
                    value={searchTerm}
                    statusFilter={selectedStatus}
                    onStatusChange={handleStatusChange}
                    statusOptions={[
                        { value: "", label: "All Statuses" },
                        { value: "PENDING", label: "Pending" },
                        { value: "COMPLETED", label: "Completed" },
                    ]}
                />
            </div>

            <table className={styles.table}>
                <thead>
                <tr>
                    <td>ID</td>
                    <td>Table</td>
                    <td>Customer</td>
                    <td>Status</td>
                    <td>Action</td>
                </tr>
                </thead>
                <tbody>
                {orders.length === 0 ? (
                    <tr>
                        <td colSpan="5" className={styles.noData}>
                            Hiển thị 0 / 0 bản ghi
                        </td>
                    </tr>
                ) : (
                    orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.tableId}</td>
                            <td>{order.customerName || "N/A"}</td>
                            <td>
                  <span
                      className={`${styles.status} ${
                          order.status === "COMPLETED" ? styles.active : styles.inactive
                      }`}
                  >
                    {order.status}
                  </span>
                            </td>
                            <td>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => handleView(order.id)}
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            <Pagination
                metadata={metadata || { page: 0, totalPages: 1, count: 0, totalElements: 0 }}
            />

            {showDetailModal && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Order Details</h2>
                        <div>
                            <p>
                                <strong>ID:</strong> {selectedOrder.id}
                            </p>
                            <p>
                                <strong>Table:</strong> {selectedOrder.tableId}
                            </p>
                            <p>
                                <strong>Customer:</strong> {selectedOrder.customerName || "N/A"}
                            </p>
                            <p>
                                <strong>Status:</strong> {selectedOrder.status}
                            </p>
                            <p>
                                <strong>Total:</strong> {selectedOrder.totalPriceAfterDiscount}
                            </p>
                        </div>
                        <div className={styles.modalButtons}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowDetailModal(false)}
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

export default OrderPage;
