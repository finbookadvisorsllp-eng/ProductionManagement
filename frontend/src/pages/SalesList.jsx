import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import FilterBar from '../components/FilterBar';
import SalesTable from '../components/SalesTable';
import SalesModal from '../components/SalesModal';
import { useSales, useFilterOptions } from '../hooks/useSales';
import { salesApi } from '../services/api';
import styles from './SalesList.module.css';

export default function SalesList() {
  const { options } = useFilterOptions();
  const { data, loading, pagination, filters, setFilters, refresh } = useSales();
  const [editRecord, setEditRecord] = useState(null);
  const [showModal, setShowModal]   = useState(false);

  const handleEdit = (row) => {
    setEditRecord(row);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditRecord(null);
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete sales record #${row.sales_id}?`)) return;
    try {
      await salesApi.remove(row.sales_id);
      toast.success('Record deleted.');
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    refresh();
  };

  const handlePageChange = (page) => {
    setFilters((f) => ({ ...f, page }));
  };

  const clearFilters = () => setFilters({});

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>Sales Records</h2>
          <p className={styles.sub}>Browse, filter, and manage all sales transactions</p>
        </div>
        <button className={styles.addBtn} onClick={handleNew}>
          <Plus size={16} /> New Record
        </button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        options={options}
        onClear={clearFilters}
      />

      <SalesTable
        data={data}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <SalesModal
          record={editRecord}
          products={options.products || []}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
