'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import CompanyOverview from './CompanyOverview';

const Overview = () => {
  const selectedTicker = useSelector((state: RootState) => state.config.selectedTicker);
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!selectedTicker) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/quote-summary?symbol=${selectedTicker}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch company data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching company overview:', err);
        setError('Failed to load company data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTicker]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-400">Loading company overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedTicker) {
    return (
      <div className="p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">No Company Selected</h2>
          <p className="text-gray-400">Please search for and select a company to view its overview.</p>
        </div>
      </div>
    );
  }

  return <CompanyOverview data={data} />;
};

export default Overview;