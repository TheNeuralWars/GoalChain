import { getQueueStatus } from '../utils/queueUtils';

export const getQueueStatus = async () => {
  try {
    // In a real implementation, this would fetch from an API or database
    // For now, we'll return mock data
    return {
      pending: 5,
      inProgress: 2,
      completed: 10
    };
  } catch (error) {
    console.error('Error fetching queue status:', error);
    throw error;
  }
};