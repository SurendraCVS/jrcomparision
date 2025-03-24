import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaUpload, FaFileAlt, FaTimesCircle, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { processJTLFile } from '../utils/JTLProcessor';

const FileUpload = ({ onFileUpload, isLoading, files = [] }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [processingFiles, setProcessingFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const validateFile = (file) => {
    // Check file extension
    const validExtensions = ['jtl', 'csv'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        message: 'File must be a JTL or CSV file'
      };
    }
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File size must be less than 50MB'
      };
    }
    
    return { valid: true };
  };
  
  const handleFiles = async (fileList) => {
    const newFiles = Array.from(fileList);
    
    // Validate files
    const errors = {};
    const validFiles = newFiles.filter(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        errors[file.name] = validation.message;
        return false;
      }
      return true;
    });
    
    if (Object.keys(errors).length > 0) {
      setFileErrors(prev => ({ ...prev, ...errors }));
    }
    
    if (validFiles.length === 0) return;
    
    // Set files as processing
    setProcessingFiles(prev => [...prev, ...validFiles.map(f => f.name)]);
    
    // Initialize progress for each file
    const newProgress = {};
    validFiles.forEach(file => {
      newProgress[file.name] = 0;
    });
    setUploadProgress(prev => ({ ...prev, ...newProgress }));
    
    // Process each file
    const processedFiles = await Promise.all(
      validFiles.map(async (file) => {
        try {
          // Process JTL file
          const processedData = await processJTLFile(file, (progress, message) => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          });
          
          return {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            uploadDate: new Date(),
            processedData
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          setFileErrors(prev => ({
            ...prev,
            [file.name]: 'Failed to process file: ' + (error.message || 'Unknown error')
          }));
          return null;
        } finally {
          setProcessingFiles(prev => prev.filter(name => name !== file.name));
        }
      })
    );
    
    // Filter out null results (failed processing)
    const successfulFiles = processedFiles.filter(file => file !== null);
    
    if (successfulFiles.length > 0) {
      onFileUpload(successfulFiles);
    }
  };
  
  const handleClearFile = (fileName) => {
    // This only clears errors, actual file removal would be handled by parent component
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };
  
  const openFileDialog = () => {
    fileInputRef.current.click();
  };
  
  const renderFileItem = (file) => {
    const isProcessing = processingFiles.includes(file.name);
    const progress = uploadProgress[file.name] || 0;
    const error = fileErrors[file.name];
    const jmeterVersion = file.processedData?.jmeterVersion || 'Unknown Version';
  
  const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    
    return (
      <FileItem key={file.id || file.name} error={!!error}>
        <FileIcon>
          <FaFileAlt />
        </FileIcon>
        <FileDetails>
          <FileName>{file.name}</FileName>
          <FileInfo>
            {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleString()}
          </FileInfo>
          <VersionInfo>JMeter: {jmeterVersion}</VersionInfo>
          {error && <FileError>{error}</FileError>}
          {isProcessing && (
            <ProgressBar>
              <ProgressFill style={{ width: `${progress}%` }} />
            </ProgressBar>
          )}
        </FileDetails>
        <FileActions>
          {isProcessing ? (
            <FileStatus>
              <FaSpinner className="spinner" />
            </FileStatus>
          ) : error ? (
            <RemoveButton onClick={() => handleClearFile(file.name)}>
              <FaTimesCircle />
            </RemoveButton>
          ) : (
            <FileStatus success>
              <FaCheck />
            </FileStatus>
          )}
        </FileActions>
      </FileItem>
    );
  };
  
  const renderErrorItems = () => {
    return Object.entries(fileErrors)
      .filter(([fileName]) => !files.some(f => f.name === fileName))
      .map(([fileName, message]) => (
        <FileItem key={fileName} error={true}>
          <FileIcon error>
            <FaExclamationTriangle />
          </FileIcon>
          <FileDetails>
            <FileName>{fileName}</FileName>
            <FileError>{message}</FileError>
          </FileDetails>
          <FileActions>
            <RemoveButton onClick={() => handleClearFile(fileName)}>
              <FaTimesCircle />
            </RemoveButton>
          </FileActions>
        </FileItem>
      ));
  };

  return (
    <UploadContainer>
      <UploadHeader>
        <Title>Upload JMeter Files</Title>
      </UploadHeader>
      
      <DropZone 
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave} 
        onDrop={handleDrop}
        active={dragActive}
      >
        <DropZoneInner>
        <UploadIcon>
          <FaUpload />
        </UploadIcon>
          <DropText>
            <strong>Click to upload</strong> or drag and drop
          </DropText>
          <DropSubtext>
            JTL or CSV files from your JMeter test
          </DropSubtext>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jtl,.csv"
            multiple
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <UploadButton onClick={openFileDialog} disabled={isLoading}>
            {isLoading ? <FaSpinner className="spinner" /> : <FaUpload />}
            {isLoading ? 'Processing...' : 'Choose Files'}
          </UploadButton>
        </DropZoneInner>
      </DropZone>
      
        <FileListContainer>
          <FileListHeader>
          <FileListTitle>Uploaded Files</FileListTitle>
          <FileListInfo>{files.length} files</FileListInfo>
          </FileListHeader>
          
          <FileList>
          {files.map(file => renderFileItem(file))}
          {renderErrorItems()}
          {files.length === 0 && Object.keys(fileErrors).length === 0 && (
            <EmptyState>
              <EmptyText>No files uploaded yet</EmptyText>
            </EmptyState>
          )}
          </FileList>
        </FileListContainer>
    </UploadContainer>
  );
};

// Styled components
const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const UploadHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
`;

const DropZone = styled.div`
  padding: 1.5rem;
  border: 2px dashed ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 0.5rem;
  background-color: ${props => props.active ? 'rgba(37, 99, 235, 0.05)' : 'var(--background-color)'};
  margin: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary-color);
    background-color: rgba(37, 99, 235, 0.05);
  }
`;

const DropZoneInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const DropText = styled.p`
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 1rem;
`;

const DropSubtext = styled.p`
  margin: 0 0 1.5rem 0;
  color: var(--text-light);
  font-size: 0.875rem;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    background-color: var(--primary-light);
    cursor: not-allowed;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FileListContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
  overflow: hidden;
`;

const FileListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
`;

const FileListTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
`;

const FileListInfo = styled.span`
  font-size: 0.75rem;
  color: var(--text-light);
`;

const FileList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: ${props => props.error ? 'rgba(239, 68, 68, 0.05)' : 'transparent'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.error ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0, 0, 0, 0.02)'};
  }
`;

const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.25rem;
  background-color: ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)'};
  color: ${props => props.error ? 'rgb(239, 68, 68)' : 'var(--primary-color)'};
  margin-right: 1rem;
  flex-shrink: 0;
`;

const FileDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileInfo = styled.div`
  font-size: 0.75rem;
  color: var(--text-light);
`;

const FileError = styled.div`
  font-size: 0.75rem;
  color: rgb(239, 68, 68);
  margin-top: 0.25rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  margin-left: 1rem;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: none;
  color: var(--text-light);
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: rgb(239, 68, 68);
  }
`;

const FileStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  color: ${props => props.success ? 'rgb(16, 185, 129)' : 'var(--primary-color)'};
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const EmptyText = styled.p`
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0;
`;

const VersionInfo = styled.div`
  font-size: 0.7rem;
  color: var(--primary-color);
  margin-top: 0.25rem;
  font-weight: 500;
`;

export default FileUpload; 