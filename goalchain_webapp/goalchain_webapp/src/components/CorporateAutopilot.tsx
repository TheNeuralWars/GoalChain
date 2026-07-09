import React from 'react';
import QueueStatusDisplay from './QueueStatusDisplay';
import { getQueueStatus } from '../services/QueueService';

interface CorporateAutopilotProps {
  onCommand: (command: string) => void;
}

const CorporateAutopilot: React.FC<CorporateAutopilotProps> = ({ onCommand }) => {
  const [queueStatus, setQueueStatus] = useState(null);

  useEffect(() => {
    // Fetch queue status when component mounts
    const fetchQueueStatus = async () => {
      try {
        const data = await getQueueStatus();
        setQueueStatus(data);
      } catch (error) {
        console.error('Error fetching queue status:', error);
      }
    };

    fetchQueueStatus();
  }, []);

  const handleVoiceCommand = (command: string) => {
    if (command.toLowerCase() === 'how is the status of the queue of the tasks?') {
      onCommand(`The current status of the task queue is: ${queueStatus}`);
    }
  };

  return (
    <div>
      <h2>Corporate Autopilot</h2>
      <p>Voice command: "how is the status of the queue of the tasks?"</p>
      {queueStatus ? (
        <QueueStatusDisplay status={queueStatus} />
      ) : (
        <p>Loading queue status...</p>
      )}
    </div>
  );
};

export default CorporateAutopilot;