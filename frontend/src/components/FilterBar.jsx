import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './FilterBar.module.css';

export default function FilterBar({ filters, onChange, options, onClear }) {
  const handle = (field) => (e) => onChange({ ...filters, [field]: e.target.value, page: 1 });

  return (
    <div className={styles.bar}>
      <div className={styles.selectGroup}>
        <select
          className={styles.select}
          value={filters.financial_year || ''}
          onChange={handle('financial_year')}
        >
          <option value="">All Years</option>
          {options.financial_years?.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filters.month || ''}
          onChange={handle('month')}
        >
          <option value="">All Months</option>
          {options.months?.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filters.product_id || ''}
          onChange={handle('product_id')}
        >
          <option value="">All Products</option>
          {options.products?.map((p) => (
            <option key={p.product_id} value={p.product_id}>
              {p.product_code} – {p.product_name}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filters.region || ''}
          onChange={handle('region')}
        >
          <option value="">All Regions</option>
          {options.regions?.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className={styles.searchGroup}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search customer…"
            value={filters.customer_name || ''}
            onChange={handle('customer_name')}
          />
        </div>
        {Object.values(filters).some(Boolean) && (
          <button className={styles.clearBtn} onClick={onClear}>
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
