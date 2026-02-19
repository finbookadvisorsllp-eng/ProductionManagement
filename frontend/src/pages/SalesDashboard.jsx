import React, { useState } from 'react';
import { BarChart2, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import { useAggregations, useFilterOptions } from '../hooks/useSales';
import styles from './SalesDashboard.module.css';

const fmtCurr = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    notation: 'compact', maximumFractionDigits: 1,
  }).format(n);

const fmtNum = (n) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export default function SalesDashboard() {
  const { options } = useFilterOptions();
  const [selectedYear, setSelectedYear] = useState('');
  const { data, loading } = useAggregations(selectedYear ? { financial_year: selectedYear } : {});

  const yearlyTotals = data?.yearly_totals || [];
  const monthlyAvgs  = data?.monthly_averages || [];
  const regions      = data?.region_breakdown || [];

  const totalValue    = yearlyTotals.reduce((s, r) => s + r.total_value, 0);
  const totalQty      = yearlyTotals.reduce((s, r) => s + r.total_quantity, 0);
  const totalTxns     = yearlyTotals.reduce((s, r) => s + r.transaction_count, 0);
  const uniqueProducts = new Set(yearlyTotals.map((r) => r.product_id)).size;

  const monthlyChartData = Object.values(
    monthlyAvgs.reduce((acc, row) => {
      if (!acc[row.month]) acc[row.month] = { month: row.month, total_value: 0, total_quantity: 0 };
      acc[row.month].total_value    += row.total_value;
      acc[row.month].total_quantity += row.total_quantity;
      return acc;
    }, {})
  );

  const productChartData = yearlyTotals
    .reduce((acc, row) => {
      const existing = acc.find((r) => r.product_id === row.product_id);
      if (existing) {
        existing.total_value    += row.total_value;
        existing.total_quantity += row.total_quantity;
      } else {
        acc.push({ ...row });
      }
      return acc;
    }, [])
    .sort((a, b) => b.total_value - a.total_value)
    .slice(0, 8);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.heading}>Sales Dashboard</h2>
          <p className={styles.sub}>Historical sales overview for production forecasting</p>
        </div>
        <select
          className={styles.yearSelect}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">All Financial Years</option>
          {options.financial_years?.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={styles.loader}><div className={styles.spinner} /></div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <StatCard
              title="Total Sales Value"
              value={fmtCurr(totalValue)}
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              title="Total Quantity Sold"
              value={fmtNum(totalQty)}
              subtitle="Metric Tonnes"
              icon={Package}
              color="green"
            />
            <StatCard
              title="Transactions"
              value={fmtNum(totalTxns)}
              icon={BarChart2}
              color="amber"
            />
            <StatCard
              title="Active Products"
              value={uniqueProducts}
              icon={TrendingUp}
              color="red"
            />
          </div>

          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Monthly Sales Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtCurr} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip formatter={(v) => fmtCurr(v)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_value"
                    name="Sales Value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Sales by Region</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={regions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={fmtCurr} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip formatter={(v) => fmtCurr(v)} />
                  <Bar dataKey="total_value" name="Sales Value" fill="#0f766e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Top Products by Sales Value</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={fmtCurr} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip formatter={(v) => fmtCurr(v)} />
                <Bar dataKey="total_value" name="Sales Value" fill="#1e40af" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
