"use client";
import React, { useState, useEffect } from "react";
import ordertableService from "../../../api/ordertable/ordertableService";
import styles from "./order.module.css";

const Page = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [metadata, setMetadata] = useState(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await ordertableService.getActiveTable(currentPage);
      if (response.data) {
        setTables(response.data);
        setMetadata(response.metadata);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch tables");
      console.error("Error fetching tables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [currentPage]);

  const handleBookTable = async (tableId) => {
    try {
      await ordertableService.updateOrderTableState(tableId, "INAVAILABLE");
      // Refresh the table list after booking
      fetchTables();
    } catch (err) {
      setError("Failed to book table");
      console.error("Error booking table:", err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Available Tables</h1>
      
      <div className={styles.tableGrid}>
        {tables.map((table) => (
          <div key={table.id} className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2>{table.name}</h2>
              <span className={styles.chairCount}>
                {table.numberOfChair} Chairs
              </span>
            </div>
            
            <div className={styles.tableStatus}>
              <span className={`${styles.statusBadge} ${styles[table.state.toLowerCase()]}`}>
                {table.state}
              </span>
            </div>
            
            <button
              className={styles.bookButton}
              onClick={() => handleBookTable(table.id)}
              disabled={table.state !== "AVAILABLE"}
            >
              Book Table
            </button>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className={styles.noTables}>
          No available tables found
        </div>
      )}

      {metadata && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className={styles.pageButton}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage + 1} of {metadata.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= metadata.totalPages - 1}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
