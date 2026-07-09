import React from 'react';

interface QueueStatus {
  pending: number;
  inProgress: number;
  completed: number;
}

interface QueueStatusDisplayProps {
  status: QueueStatus;
}

const QueueStatusDisplay: React.FC<QueueStatusDisplayProps> = ({ status }) => {
  return (
    <div className="queue-status">
      <h3>Task Queue Status</h3>
      <div className="status-item">
        <span>Pending:</span>
        <span>{status.pending}</span>
      </div>
      <div className="status-item">
        <span>In Progress:</span>
        <span>{status.inProgress}</span>
      </div>
      <div className="status-item">
        <span>Completed:</span>
        <span>{status.completed}</span>
      </div>
    </div>
  );
};

export default QueueStatusDisplay;