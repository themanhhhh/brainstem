"use client";

import React, { useState } from "react";
import styles from "./addOrder.module.css";
import { useRouter } from "next/navigation";
import { useLanguageService } from "../../../hooks/useLanguageService";

const AddOrderPage = () => {
    const { orderService } = useLanguageService();
    const router = useRouter();
    const [formData, setFormData] = useState({
        tableId: "",
        customerName: "",
        status: "PENDING",
        totalPriceAfterDiscount: ""
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await orderService.createOrder(formData);
            setSuccessMessage("Order created successfully");
            setError(null);
            setTimeout(() => router.push("/admin/dashboard/order"), 1000);
        } catch (err) {
            console.error("Error creating order:", err);
            setError("Failed to create order");
        }
    };

    return (
        <div className={styles.container}>
            <h1>Add New Order</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Table ID</label>
                    <input
                        type="text"
                        name="tableId"
                        value={formData.tableId}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Customer Name</label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Total Price After Discount</label>
                    <input
                        type="number"
                        name="totalPriceAfterDiscount"
                        value={formData.totalPriceAfterDiscount}
                        onChange={handleChange}
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {successMessage && <p className={styles.success}>{successMessage}</p>}

                <button type="submit" className={styles.submitButton}>
                    Create Order
                </button>
            </form>
        </div>
    );
};

export default AddOrderPage;
