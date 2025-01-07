'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function MetricsDebugPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user-specific metrics
        if (user) {
          console.log('Fetching metrics for user:', user.uid);
          const token = await user.getIdToken();
          console.log('Got token:', token.substring(0, 10) + '...');
          
          const userMetrics = await fetch('/api/metrics', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const metricsData = await userMetrics.json();
          console.log('Received metrics:', metricsData);
          setMetrics(metricsData);
        }

        // Fetch summary
        const summaryResponse = await fetch('/api/metrics/summary');
        setSummary(await summaryResponse.json());
      } catch (error) {
        console.error('Detailed metrics fetch error:', error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Metrics Debug</h1>
      
      {user && (
        <>
          <div className="mb-4 text-gray-400">
            User ID: {user.uid}
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Your Metrics</h2>
            <pre className="bg-gray-100 p-4 rounded text-black">
              {JSON.stringify(metrics, null, 2)}
            </pre>
          </div>
        </>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Global Summary</h2>
        <pre className="bg-gray-100 p-4 rounded text-black">
          {JSON.stringify(summary, null, 2)}
        </pre>
      </div>
    </div>
  );
} 