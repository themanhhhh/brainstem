import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ count, pageSize, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(count / pageSize);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={styles.pagination}>
      <button
        className={styles.button}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        Previous
      </button>
      <span className={styles.pageInfo}>
        Page {currentPage + 1} of {totalPages}
      </span>
      <button
        className={styles.button}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination; 