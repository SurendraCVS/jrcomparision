import React from 'react';
import styled from 'styled-components';
import { FaSpinner, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const StatusBar = ({ status, error, processedFiles = 0 }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
      case 'generating':
        return <FaSpinner className="spinner" />;
      case 'success':
        return <FaCheckCircle />;
      default:
        return <FaInfoCircle />;
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Processing files...';
      case 'generating':
        return 'Generating report...';
      case 'success':
        return 'Operation completed successfully';
      default:
        return 'Ready';
    }
  };
  
  return (
    <StatusBarContainer>
      <StatusInfo>
        <StatusIndicator status={status}>
          {getStatusIcon()}
          <StatusText>{getStatusText()}</StatusText>
        </StatusIndicator>
      </StatusInfo>
      
      <SystemInfo>
        <SystemInfoItem>
          Files: <strong>{processedFiles} processed</strong>
        </SystemInfoItem>
        <SystemInfoItem>
          Memory usage: <strong>125 MB</strong>
        </SystemInfoItem>
        <SystemInfoItem>
          Version: <strong>1.0.0</strong>
        </SystemInfoItem>
      </SystemInfo>
    </StatusBarContainer>
  );
};

const StatusBarContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: white;
  border-top: 1px solid var(--border-color);
  color: var(--text-color);
  font-size: 0.75rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  color: ${props => {
    switch (props.status) {
      case 'processing':
      case 'generating':
        return 'var(--info-color)';
      case 'success':
        return 'var(--success-color)';
      case 'error':
        return 'var(--error-color)';
      default:
        return 'var(--text-light)';
    }
  }};
`;

const StatusText = styled.span`
  margin-left: 0.5rem;
`;

const SystemInfo = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 576px) {
    gap: 0.5rem;
    flex-wrap: wrap;
  }
`;

const SystemInfoItem = styled.div`
  color: var(--text-light);
  white-space: nowrap;
  
  strong {
    color: var(--text-color);
  }
`;

export default StatusBar; 