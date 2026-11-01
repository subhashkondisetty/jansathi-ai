/**
 * @fileoverview Metadata options context dynamically backed by GET /api/meta/options.
 * Single source of truth for Indian states, official document types, languages, and upload limits.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { normalizeApiError } from '../services/api.js';

const initialOptions = {
  languages: [],
  userCategories: [],
  educationLevels: [],
  incomeRanges: [],
  states: [],
  docTypes: [],
  docCategories: [],
  limits: {
    maxUploadMb: 10,
    maxPdfPages: 300,
  },
};

const OptionsContext = createContext(null);

export const OptionsProvider = ({ children }) => {
  const [options, setOptions] = useState(initialOptions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/meta/options');
      if (res.data?.success && res.data.data) {
        setOptions(res.data.data);
      } else {
        throw new Error('Malformed options response from server');
      }
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return (
    <OptionsContext.Provider value={{ options, loading, error, refreshOptions: fetchOptions }}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = () => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error('useOptions must be used within an OptionsProvider');
  }
  return context;
};

export default OptionsContext;
