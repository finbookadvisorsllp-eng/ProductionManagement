import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesApi } from '../services/api';
import styles from './SalesImport.module.css';

const FIELD_DOCS = [
  { field: 'financial_year', type: 'Text',   example: '2024-25',            required: true },
  { field: 'month',          type: 'Text',   example: 'April',              required: true },
  { field: 'product_id',     type: 'Number', example: '1',                  required: true },
  { field: 'customer_name',  type: 'Text',   example: 'Apex Constructions', required: true },
  { field: 'sales_quantity', type: 'Number', example: '250.50',             required: true },
  { field: 'sales_value',    type: 'Number', example: '15000000',           required: true },
  { field: 'unit_of_measure',type: 'Text',   example: 'MT',                 required: false },
  { field: 'region',         type: 'Text',   example: 'North',              required: false },
];

export default function SalesImport() {
  const [file, setFile]               = useState(null);
  const [importing, setImporting]     = useState(false);
  const [result, setResult]           = useState(null);
  const [errors, setErrors]           = useState([]);
  const [downloading, setDownloading] = useState(false);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setResult(null);
      setErrors([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);
    setErrors([]);
    try {
      const res = await salesApi.bulkImport(file);
      setResult({ inserted: res.inserted, message: res.message });
      toast.success(res.message);
      setFile(null);
    } catch (err) {
      const msg = err.message;
      if (msg.includes('Validation errors')) {
        setErrors(['Validation errors — check column names and data types.']);
      } else {
        setErrors([msg]);
      }
      toast.error('Import failed. See details below.');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const res = await salesApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href = url;
      a.download = 'sales_import_template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download template.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.heading}>Bulk Import</h2>
          <p className={styles.sub}>Upload CSV or Excel file to import historical sales data</p>
        </div>
        <button
          className={styles.templateBtn}
          onClick={handleDownloadTemplate}
          disabled={downloading}
        >
          <Download size={15} />
          {downloading ? 'Downloading…' : 'Download Template'}
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.uploadSection}>
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''} ${file ? styles.hasFile : ''}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className={styles.fileInfo}>
                <FileSpreadsheet size={40} className={styles.fileIcon} />
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  className={styles.removeFile}
                  onClick={(e) => { e.stopPropagation(); setFile(null); setErrors([]); setResult(null); }}
                >
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <div className={styles.dropPrompt}>
                <Upload size={36} className={styles.uploadIcon} />
                <p className={styles.dropTitle}>
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </p>
                <p className={styles.dropSub}>or click to browse — CSV, XLS, XLSX (max 10 MB)</p>
              </div>
            )}
          </div>

          {file && (
            <button
              className={styles.importBtn}
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? (
                <><span className={styles.btnSpinner} /> Importing…</>
              ) : (
                <><Upload size={15} /> Import {file.name}</>
              )}
            </button>
          )}

          {result && (
            <div className={styles.successBox}>
              <CheckCircle size={20} />
              <div>
                <p className={styles.successTitle}>Import Successful</p>
                <p>{result.inserted} record(s) imported.</p>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className={styles.errorBox}>
              <AlertTriangle size={20} />
              <div>
                <p className={styles.errorTitle}>Import Failed</p>
                {errors.map((e, i) => <p key={i} className={styles.errorLine}>{e}</p>)}
              </div>
            </div>
          )}
        </div>

        <div className={styles.docsSection}>
          <div className={styles.docsCard}>
            <h3 className={styles.docsTitle}>Required File Format</h3>
            <p className={styles.docsSub}>
              First row must be column headers. Supported: <strong>CSV</strong>, <strong>XLSX</strong>, <strong>XLS</strong>.
            </p>

            <div className={styles.fieldsTable}>
              <div className={styles.fieldsHeader}>
                <span>Column Name</span>
                <span>Type</span>
                <span>Example</span>
                <span>Required</span>
              </div>
              {FIELD_DOCS.map((f) => (
                <div key={f.field} className={styles.fieldsRow}>
                  <code className={styles.fieldCode}>{f.field}</code>
                  <span className={styles.fieldType}>{f.type}</span>
                  <span className={styles.fieldExample}>{f.example}</span>
                  <span className={f.required ? styles.required : styles.optional}>
                    {f.required ? 'Yes' : 'No'}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.notes}>
              <p><strong>Notes:</strong></p>
              <ul>
                <li>The <code>product_id</code> must exist in the Products master table.</li>
                <li>For <code>month</code>, use full names: April, May, June…</li>
                <li>Financial year format: <code>YYYY-YY</code> (e.g., 2024-25)</li>
                <li>Numbers should not contain currency symbols or commas.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
