// src/hooks/useFeatureFlags.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { FeatureFlag } from '../types/featureFlags';

interface UseFeatureFlagsReturn {
  flags: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
  isFeatureEnabled: (flagId: string) => boolean;
  getFeature: (flagId: string) => FeatureFlag | undefined;
  refetchFlags: () => Promise<void>;
}

export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/feature-flags');

      if (response.data.success) {
        setFlags(response.data.data || []);
      } else {
        setError(response.data.error || 'Failed to fetch feature flags');
      }
    } catch (err: any) {
      // Don't set error for auth failures - just use empty flags
      if (err.response?.status === 401) {
        setFlags([]);
      } else {
        setError(err.response?.data?.error || 'Failed to fetch feature flags');
      }
      console.warn('Feature flags fetch failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const isFeatureEnabled = useCallback((flagId: string): boolean => {
    const flag = flags.find(f => f.id === flagId);
    return flag?.enabled || false;
  }, [flags]);

  const getFeature = useCallback((flagId: string): FeatureFlag | undefined => {
    return flags.find(f => f.id === flagId);
  }, [flags]);

  const refetchFlags = useCallback(async () => {
    await fetchFlags();
  }, [fetchFlags]);

  return {
    flags,
    isLoading,
    error,
    isFeatureEnabled,
    getFeature,
    refetchFlags
  };
};

// Convenience hook for checking a single feature
export const useFeatureFlag = (flagId: string): boolean => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(flagId);
};