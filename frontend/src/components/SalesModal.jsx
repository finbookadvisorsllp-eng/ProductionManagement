import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { salesApi } from '../services/api';
import toast from 'react-hot-toast';
import styles from './SalesModal.module.css';

const MONTHS = [
  'April','May','June','July','August','September',
  'October','November','December','January','February','March',
];

const REGIONS = ['North','South','East','West','Central'];

const empty = {
  financial_year: '', month: '', product_id: '', customer_name: '',
  sales_quantity: '', sales_value: '', unit_of_measure: '', region: '',
};

export default function SalesModal({ record, products, onClose, onSaved }) {
  const [form, setForm]       = useState(record || empty);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    setForm(record || empty);
  }, [record]);

  const handle = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (record?.sales_id) {
        await salesApi.update(record.sales_id, form);
        toast.success('Record updated.');
      } else {
        await salesApi.create(form);
        toast.success('Record created.');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {record?.sales_id ? 'Edit Sales Record' : 'New Sales Record'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <form className={styles.body} onSubmit={submit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Financial Year *</label>
              <input
                required
                placeholder="e.g. 2024-25"
                value={form.financial_year}
                onChange={handle('financial_year')}
              />
            </div>

            <div className={styles.field}>
              <label>Month *</label>
              <select required value={form.month} onChange={handle('month')}>
                <option value="">Select month</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label>Product *</label>
              <select required value={form.product_id} onChange={handle('product_id')}>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.product_code} – {p.product_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Customer Name *</label>
              <input
                required
                placeholder="Customer name"
                value={form.customer_name}
                onChange={handle('customer_name')}
              />
            </div>

            <div className={styles.field}>
              <label>Sales Quantity *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.sales_quantity}
                onChange={handle('sales_quantity')}
              />
            </div>

            <div className={styles.field}>
              <label>Sales Value (₹) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.sales_value}
                onChange={handle('sales_value')}
              />
            </div>

            <div className={styles.field}>
              <label>Unit of Measure</label>
              <input
                placeholder="e.g. MT, KG, Units"
                value={form.unit_of_measure}
                onChange={handle('unit_of_measure')}
              />
            </div>

            <div className={styles.field}>
              <label>Region</label>
              <select value={form.region} onChange={handle('region')}>
                <option value="">Select region</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : record?.sales_id ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
