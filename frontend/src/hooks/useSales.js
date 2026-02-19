import { useState, useEffect, useCallback } from 'react';
import { salesApi } from '../services/api';
import toast from 'react-hot-toast';

export const useSales = (initialFilters = {}) => {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [filters, setFilters]     = useState(initialFilters);

  const fetchSales = useCallback(async (overrideFilters) => {
    setLoading(true);
    try {
      const res = await salesApi.getAll({ ...filters, ...overrideFilters });
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  return { data, loading, pagination, filters, setFilters, refresh: fetchSales };
};

export const useFilterOptions = () => {
  const [options, setOptions] = useState({ financial_years: [], months: [], products: [], regions: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    salesApi.getFilterOptions()
      .then((res) => setOptions(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { options, loading };
};

export const useAggregations = (params = {}) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async (overrideParams) => {
    setLoading(true);
    try {
      const res = await salesApi.getAggregations({ ...params, ...overrideParams });
      setData(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refresh: fetch };
};
