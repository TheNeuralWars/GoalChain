import React from 'react';

export interface HealthCheck {
  key: string;
  value: number;
  min?: number;
  max?: number;
  pass: boolean;
}

export interface HealthCheckCardProps {
  checks: HealthCheck[];
  configDriftReasons: string[];
  className?: string;
}

export const HealthCheckCard: React.FC<HealthCheckCardProps> = ({
  checks,
  configDriftReasons,
  className = '',
}) => {
  return (
    <div className={`glass-card-premium ${className}`}>
      <h3 style={{ 
        margin: '0 0 1rem', 
        fontSize: '1.1rem', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem' 
      }}>
        <span role="img" aria-label="health">🏥</span> Protocol Health Checks
      </h3>
      
      <div className="health-checks-grid" role="list" aria-label="Health check results">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className={`health-check-card ${check.pass ? 'pass' : 'fail'}`}
            role="listitem"
            style={{ ['--dot-color']: check.pass ? 'var(--primary-neon)' : 'var(--accent-red)' } as any}
          >
            <div className="health-check-main">
              <span 
                className="health-check-dot"
                aria-hidden="true"
                style={{ ['--dot-color']: check.pass ? 'var(--primary-neon)' : 'var(--accent-red)' } as any}
              />
              <span className="health-check-name">
                {check.key.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="health-check-details">
              <span className="health-check-status">
                {check.pass ? '✓ PASS' : '✗ FAIL'}
              </span>
              <span className="health-check-values">
                Value: {check.value}{check.key.includes('coverage') ? '%' : ''}
                {check.min !== undefined && ` (min: ${check.min}${check.key.includes('coverage') ? '%' : ''})`}
                {check.max !== undefined && ` (max: ${check.max}${check.key.includes('coverage') ? '%' : ''})`}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {configDriftReasons.length > 0 && (
        <div className="config-drift-alert" role="alert">
          <div className="config-drift-title">Config Drift Detected</div>
          <ul className="config-drift-list">
            {configDriftReasons.map((reason, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HealthCheckCard;