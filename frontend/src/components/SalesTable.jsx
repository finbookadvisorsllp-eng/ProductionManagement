import React, { useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './SalesTable.module.css';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);

const fmtCurr = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

export default function SalesTable({ data, loading, pagination, onPageChange, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading sales data…</span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={styles.empty}>
        <p>No sales records found.</p>
        <p>Try adjusting filters or import data to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Financial Year</th>
              <th>Month</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Qty (UOM)</th>
              <th>Sales Value</th>
              <th>Region</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.sales_id}>
                <td className={styles.muted}>
                  {(pagination.page - 1) * pagination.limit + idx + 1}
                </td>
                <td>
                  <span className={styles.tag}>{row.financial_year}</span>
                </td>
                <td>{row.month}</td>
                <td>
                  <div className={styles.product}>
                    <span className={styles.code}>{row.product_code}</span>
                    <span className={styles.name}>{row.product_name}</span>
                  </div>
                </td>
                <td>{row.customer_name}</td>
                <td className={styles.num}>
                  {fmt(row.sales_quantity)}
                  <span className={styles.uom}>{row.unit_of_measure}</span>
                </td>
                <td className={styles.num}>{fmtCurr(row.sales_value)}</td>
                <td>
                  {row.region && (
                    <span className={styles.region}>{row.region}</span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={`${styles.btn} ${styles.editBtn}`}
                      onClick={() => onEdit(row)}
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className={`${styles.btn} ${styles.delBtn}`}
                      onClick={() => onDelete(row)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.paginInfo}>
          Showing {(pagination.page - 1) * pagination.limit + 1}–
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
        </span>
        <div className={styles.paginControls}>
          <button
            className={styles.paginBtn}
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft size={15} />
          </button>
          <span className={styles.paginPage}>
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className={styles.paginBtn}
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
