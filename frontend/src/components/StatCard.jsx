import React from 'react';
import styles from './StatCard.module.css';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.header}>
        <div className={styles.info}>
          <p className={styles.title}>{title}</p>
          <p className={styles.value}>{value}</p>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {Icon && (
          <div className={styles.iconWrap}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`${styles.trend} ${trend >= 0 ? styles.up : styles.down}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs prev year
        </div>
      )}
    </div>
  );
}
