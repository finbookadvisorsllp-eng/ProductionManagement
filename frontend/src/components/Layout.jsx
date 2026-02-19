import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart2, Upload, List, TrendingUp, Factory,
  ChevronDown, ChevronRight, Menu, X
} from 'lucide-react';
import styles from './Layout.module.css';

const navItems = [
  {
    label: 'Sales Data',
    icon: BarChart2,
    children: [
      { to: '/sales/dashboard', label: 'Dashboard',  icon: TrendingUp },
      { to: '/sales/records',   label: 'Records',    icon: List },
      { to: '/sales/import',    label: 'Bulk Import', icon: Upload },
      { to: '/sales/analytics', label: 'Analytics',  icon: BarChart2 },
    ],
  },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggle = (label) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className={styles.root}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.sidebarClosed}`}>
        <div className={styles.brand}>
          <Factory size={22} className={styles.brandIcon} />
          {sidebarOpen && <span className={styles.brandName}>ProdManage</span>}
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isOpen = !collapsed[item.label];
            return (
              <div key={item.label} className={styles.group}>
                <button
                  className={styles.groupToggle}
                  onClick={() => toggle(item.label)}
                  title={item.label}
                >
                  <Icon size={18} />
                  {sidebarOpen && (
                    <>
                      <span>{item.label}</span>
                      {isOpen
                        ? <ChevronDown size={14} className={styles.chevron} />
                        : <ChevronRight size={14} className={styles.chevron} />}
                    </>
                  )}
                </button>

                {isOpen && sidebarOpen && (
                  <div className={styles.children}>
                    {item.children.map((child) => {
                      const CIcon = child.icon;
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            `${styles.navLink} ${isActive ? styles.active : ''}`
                          }
                        >
                          <CIcon size={15} />
                          <span>{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className={styles.pageTitle}>Production Management System</h1>
          <div className={styles.headerRight}>
            <span className={styles.badge}>Sales Module</span>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
