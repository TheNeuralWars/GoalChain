import { useState, useEffect } from 'react';

export const useQueueStatus = () => {
  const [status, setStatus] = useState<string>('unknown');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const response = await fetch('/api/queue/status');
        const data = await response.json();
        setStatus(data.status);
      } catch (error) {
        console.error('Error fetching queue status:', error);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStatus();
  }, []);

  return { status, loading };
};
