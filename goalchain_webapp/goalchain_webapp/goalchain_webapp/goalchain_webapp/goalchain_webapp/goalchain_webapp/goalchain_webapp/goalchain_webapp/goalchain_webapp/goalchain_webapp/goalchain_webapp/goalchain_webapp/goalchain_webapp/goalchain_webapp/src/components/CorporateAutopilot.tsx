import React from 'react';
import useQueueStatus from '../hooks/useQueueStatus';

interface CorporateAutopilotProps {
  onCommand: (command: string) => void;
}

const CorporateAutopilot: React.FC<CorporateAutopilotProps> = ({ onCommand }) => {
  const { status, loading } = useQueueStatus();

  const handleVoiceCommand = (command: string) => {
    if (command.toLowerCase() === 'how is the status of the queue of the tasks?') {
      onCommand(`The current status of the task queue is: ${status}`);
    }
  };

  return (
    <div>
      <h2>Corporate Autopilot</h2>
      <p>Voice command: "how is the status of the queue of the tasks?"</p>
      {loading ? (
        <p>Loading queue status...</p>
      ) : (
        <p>Queue status: {status}</p>
      )}
    </div>
  );
};

export default CorporateAutopilot;
