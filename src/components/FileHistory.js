import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaFileAlt,
  FaTrashAlt,
  FaDownload,
  FaPlus,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaSort,
  FaExchangeAlt
} from 'react-icons/fa';

const FileHistory = ({ files, onSelectFiles, onDeleteFile, onUploadFiles, onOpenFile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [groupByVersion, setGroupByVersion] = useState(false);

  // Reset selected files when files prop changes
  useEffect(() => {
    setSelectedFiles([]);
  }, [files]);

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId) 
        : [...prev, fileId]
    );
  };

  const handleCompare = () => {
    if (selectedFiles.length >= 2) {
      onSelectFiles(selectedFiles);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="sort-icon" />;
    return sortDirection === 'asc' ? 
      <FaSort className="sort-icon active asc" /> : 
      <FaSort className="sort-icon active desc" />;
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter and sort files
  const filteredFiles = files.filter(file => {
    if (!searchQuery) return true;
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      file.name.toLowerCase().includes(lowercaseQuery) ||
      (file.processedData?.jmeterVersion || '').toLowerCase().includes(lowercaseQuery)
    );
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch(sortBy) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'size':
        return direction * (a.size - b.size);
      case 'version':
        const versionA = a.processedData?.jmeterVersion || '';
        const versionB = b.processedData?.jmeterVersion || '';
        return direction * versionA.localeCompare(versionB);
      case 'date':
      default:
        const dateA = a.uploadDate ? new Date(a.uploadDate).getTime() : 0;
        const dateB = b.uploadDate ? new Date(b.uploadDate).getTime() : 0;
        return direction * (dateA - dateB);
    }
  });

  // Group files by JMeter version if groupByVersion is true
  let groupedFiles = sortedFiles;
  if (groupByVersion) {
    const groups = {};
    sortedFiles.forEach(file => {
      const version = file.processedData?.jmeterVersion || 'Unknown Version';
      if (!groups[version]) {
        groups[version] = [];
      }
      groups[version].push(file);
    });
    groupedFiles = Object.entries(groups).flatMap(([version, files]) => [
      { isVersionHeader: true, version },
      ...files
    ]);
  }

  // Add a handler function for opening a selected file
  const handleOpenSelected = () => {
    if (selectedFiles.length === 1) {
      onOpenFile && onOpenFile(selectedFiles[0]);
    }
  };

  return (
    <HistoryContainer>
      <HistoryHeader>
        <h2>JMeter Files History</h2>
        <HeaderActions>
          <SearchBar>
            <FaSearch />
            <SearchInput 
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          <ActionButton onClick={() => setGroupByVersion(!groupByVersion)}>
            <FaFilter />
            {groupByVersion ? 'Ungroup' : 'Group by Version'}
          </ActionButton>
          <ActionButton primary onClick={() => document.getElementById('file-upload').click()}>
            <FaPlus />
            Upload Files
          </ActionButton>
          <input
            id="file-upload"
            type="file"
            accept=".jtl,.csv"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onUploadFiles(e.target.files);
                e.target.value = null; // Reset input
              }
            }}
          />
        </HeaderActions>
      </HistoryHeader>

      <FileTable>
        <FileTableHeader>
          <HeaderCell width="3%"></HeaderCell>
          <HeaderCell width="37%" onClick={() => handleSort('name')}>
            File Name {getSortIcon('name')}
          </HeaderCell>
          <HeaderCell width="15%" onClick={() => handleSort('size')}>
            Size {getSortIcon('size')}
          </HeaderCell>
          <HeaderCell width="20%" onClick={() => handleSort('version')}>
            JMeter Version {getSortIcon('version')}
          </HeaderCell>
          <HeaderCell width="15%" onClick={() => handleSort('date')}>
            Upload Date {getSortIcon('date')}
          </HeaderCell>
          <HeaderCell width="10%">Actions</HeaderCell>
        </FileTableHeader>

        <FileTableBody>
          {groupedFiles.length === 0 ? (
            <EmptyState>
              <p>No files in history. Upload JMeter files to get started.</p>
              <ActionButton primary onClick={() => document.getElementById('file-upload').click()}>
                <FaPlus /> Upload Files
              </ActionButton>
            </EmptyState>
          ) : (
            groupedFiles.map((file, index) => 
              file.isVersionHeader ? (
                <VersionHeader key={`version-${index}`}>
                  <span>JMeter Version: {file.version}</span>
                </VersionHeader>
              ) : (
                <FileRow 
                  key={file.id} 
                  selected={selectedFiles.includes(file.id)}
                  onClick={() => toggleFileSelection(file.id)}
                  onDoubleClick={() => onOpenFile && onOpenFile(file.id)}
                >
                  <FileCell width="3%">
                    <CheckboxContainer onClick={(e) => e.stopPropagation()}>
                      <StyledCheckbox 
                        type="checkbox" 
                        checked={selectedFiles.includes(file.id)} 
                        onChange={() => toggleFileSelection(file.id)}
                      />
                    </CheckboxContainer>
                  </FileCell>
                  <FileCell width="37%">
                    <FileIcon><FaFileAlt /></FileIcon>
                    <FileName>{file.name}</FileName>
                  </FileCell>
                  <FileCell width="15%">{formatFileSize(file.size)}</FileCell>
                  <FileCell width="20%">
                    {file.processedData?.jmeterVersion || 'Unknown Version'}
                  </FileCell>
                  <FileCell width="15%">
                    <FaCalendarAlt className="date-icon" />
                    {formatDate(file.uploadDate)}
                  </FileCell>
                  <FileCell width="10%">
                    <ActionIcons>
                      <ActionIcon 
                        title="Open" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFile && onOpenFile(file.id);
                        }}
                      >
                        <FaFileAlt />
                      </ActionIcon>
                      <ActionIcon 
                        title="Delete" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFile(file.id);
                        }}
                      >
                        <FaTrashAlt />
                      </ActionIcon>
                    </ActionIcons>
                  </FileCell>
                </FileRow>
              )
            )
          )}
        </FileTableBody>
      </FileTable>

      <HistoryFooter>
        <SelectedInfo>
          {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'No files selected'}
        </SelectedInfo>
        <FooterActions>
          <ActionButton 
            disabled={selectedFiles.length !== 1}
            onClick={handleOpenSelected}
          >
            <FaFileAlt /> Open Selected
          </ActionButton>
          <CompareButton 
            disabled={selectedFiles.length < 2}
            onClick={handleCompare}
          >
            <FaExchangeAlt /> Compare Selected Files
          </CompareButton>
        </FooterActions>
      </HistoryFooter>
    </HistoryContainer>
  );
};

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
`;

const HistoryHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);

  h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--background-color);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  flex: 1;
  min-width: 200px;
  
  svg {
    color: var(--text-light);
    margin-right: 0.5rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 0.875rem;
  color: var(--text-color);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : 'var(--border-color)'};
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--primary-dark)' : 'var(--background-color)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FileTable = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  margin: 0 1.5rem 1.5rem;
`;

const FileTableHeader = styled.div`
  display: flex;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 0.875rem;
`;

const HeaderCell = styled.div`
  width: ${props => props.width || '20%'};
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .sort-icon {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    opacity: 0.4;
    
    &.active {
      opacity: 1;
      color: var(--primary-color);
    }
  }
`;

const FileTableBody = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const VersionHeader = styled.div`
  padding: 0.5rem 1rem;
  background-color: rgba(37, 99, 235, 0.08);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
`;

const FileRow = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.selected ? 'rgba(37, 99, 235, 0.1)' : 'white'};
  
  &:hover {
    background-color: ${props => props.selected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(0, 0, 0, 0.02)'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const FileCell = styled.div`
  width: ${props => props.width || '20%'};
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  
  .date-icon {
    margin-right: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-light);
  }
`;

const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background-color: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
  border-radius: 0.25rem;
  margin-right: 0.75rem;
`;

const FileName = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--text-light);
  border-radius: 0.25rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--background-color);
    color: ${props => props.title === 'Delete' ? 'var(--error-color)' : 'var(--primary-color)'};
  }
`;

const HistoryFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: white;
`;

const SelectedInfo = styled.div`
  font-size: 0.875rem;
  color: var(--text-light);
`;

const CompareButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--primary-color);
  }
`;

const FooterActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--text-light);
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const StyledCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

export default FileHistory; 