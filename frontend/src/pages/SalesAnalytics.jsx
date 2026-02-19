import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell,
} from 'recharts';
import { useAggregations, useFilterOptions } from '../hooks/useSales';
import styles from './SalesAnalytics.module.css';

const COLORS = ['#1e40af','#0f766e','#d97706','#dc2626','#7c3aed','#db2777','#0891b2','#65a30d'];

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);

const fmtCurr = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    notation: 'compact', maximumFractionDigits: 1,
  }).format(n);

export default function SalesAnalytics() {
  const { options } = useFilterOptions();
  const [fyFilter, setFyFilter]      = useState('');
  const [prodFilter, setProdFilter]  = useState('');

  const { data, loading } = useAggregations(
    Object.fromEntries(
      Object.entries({ financial_year: fyFilter, product_id: prodFilter }).filter(([, v]) => v)
    )
  );

  const yearly  = data?.yearly_totals   || [];
  const monthly = data?.monthly_averages || [];
  const regions = data?.region_breakdown || [];

  const monthOrder = [
    'April','May','June','July','August','September',
    'October','November','December','January','February','March',
  ];

  const monthlyChartData = monthOrder.map((m) => {
    const rows = monthly.filter((r) => r.month === m);
    return {
      month: m,
      avg_qty:   rows.reduce((s, r) => s + r.avg_monthly_quantity, 0) / (rows.length || 1),
      avg_value: rows.reduce((s, r) => s + r.avg_monthly_value,    0) / (rows.length || 1),
      total_value: rows.reduce((s, r) => s + r.total_value, 0),
    };
  });

  const productSummary = yearly.reduce((acc, row) => {
    const ex = acc.find((r) => r.product_id === row.product_id);
    if (ex) {
      ex.total_value    += row.total_value;
      ex.total_quantity += row.total_quantity;
      ex.transaction_count += row.transaction_count;
    } else {
      acc.push({ ...row });
    }
    return acc;
  }, []).sort((a, b) => b.total_value - a.total_value);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.heading}>Sales Analytics</h2>
          <p className={styles.sub}>Aggregated insights — yearly totals, monthly averages &amp; region breakdown</p>
        </div>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={fyFilter}
            onChange={(e) => setFyFilter(e.target.value)}
          >
            <option value="">All Financial Years</option>
            {options.financial_years?.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            className={styles.select}
            value={prodFilter}
            onChange={(e) => setProdFilter(e.target.value)}
          >
            <option value="">All Products</option>
            {options.products?.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_code} – {p.product_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loader}><div className={styles.spinner} /></div>
      ) : (
        <>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Total Sales per Product (Yearly)</h3>
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Financial Year</th>
                    <th className={styles.right}>Total Qty ({yearly[0]?.unit_of_measure || 'MT'})</th>
                    <th className={styles.right}>Total Value (₹)</th>
                    <th className={styles.right}>Transactions</th>
                    <th className={styles.right}>Unique Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {yearly.map((row) => (
                    <tr key={`${row.product_id}-${row.financial_year}`}>
                      <td>
                        <div className={styles.product}>
                          <span className={styles.code}>{row.product_code}</span>
                          <span>{row.product_name}</span>
                        </div>
                      </td>
                      <td><span className={styles.yearTag}>{row.financial_year}</span></td>
                      <td className={styles.right}>{fmt(row.total_quantity)}</td>
                      <td className={styles.right}>{fmtCurr(row.total_value)}</td>
                      <td className={styles.right}>{row.transaction_count}</td>
                      <td className={styles.right}>{row.unique_customers}</td>
                    </tr>
                  ))}
                  {yearly.length === 0 && (
                    <tr><td colSpan={6} className={styles.empty}>No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className={styles.chartsGrid}>
            <section className={styles.chartCard}>
              <h3 className={styles.sectionTitle}>Monthly Average Sales</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
                  <YAxis yAxisId="val" tickFormatter={fmtCurr} tick={{ fontSize: 10 }} width={70} />
                  <YAxis yAxisId="qty" orientation="right" tick={{ fontSize: 10 }} width={50} />
                  <Tooltip formatter={(v, name) => name === 'Avg Value' ? fmtCurr(v) : fmt(v)} />
                  <Legend />
                  <Line yAxisId="val" type="monotone" dataKey="avg_value" name="Avg Value" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="qty" type="monotone" dataKey="avg_qty"   name="Avg Qty"   stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </section>

            <section className={styles.chartCard}>
              <h3 className={styles.sectionTitle}>Top Products — Total Value</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={productSummary.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="product_code" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtCurr} tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v) => fmtCurr(v)} />
                  <Bar dataKey="total_value" name="Total Value" radius={[4,4,0,0]}>
                    {productSummary.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Region-wise Breakdown</h3>
            <div className={styles.regionCards}>
              {regions.map((r) => (
                <div key={r.region} className={styles.regionCard}>
                  <p className={styles.regionName}>{r.region || 'Unspecified'}</p>
                  <p className={styles.regionValue}>{fmtCurr(r.total_value)}</p>
                  <p className={styles.regionQty}>{fmt(r.total_quantity)} MT</p>
                  <p className={styles.regionTxn}>{r.transaction_count} transactions</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
