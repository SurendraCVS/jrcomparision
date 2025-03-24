import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { 
  FaExchangeAlt, 
  FaChevronDown, 
  FaChevronRight,
  FaFileExport, 
  FaCogs, 
  FaCheck, 
  FaPercent, 
  FaHashtag,
  FaPlus
} from 'react-icons/fa';

const JMeterCompare = ({ files, activeView, onUploadFiles }) => {
  // State for selected files
  const [selectedFiles, setSelectedFiles] = useState([]);
  // State for storing JMeter versions
  const [jmeterVersions, setJmeterVersions] = useState({});
  // State for difference display mode (absolute, percentage, hybrid)
  const [diffMode, setDiffMode] = useState('hybrid');
  // State for difference threshold
  const [threshold, setThreshold] = useState(5);
  // State for expanded endpoints
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  // State for selected metrics for comparison
  const [comparisonMetrics, setComparisonMetrics] = useState([
    'average', 'median', 'percentile95', 'throughput', 'errorPercentage'
  ]);

  // Effect to extract JMeter versions when files change
  useEffect(() => {
    const versions = {};
    files.forEach(file => {
      if (file.processedData?.jmeterVersion) {
        versions[file.id] = file.processedData.jmeterVersion;
      }
    });
    setJmeterVersions(versions);
  }, [files]);

  // Effect to initialize selected files when files change
  useEffect(() => {
    if (files.length >= 2 && selectedFiles.length < 2) {
      setSelectedFiles([files[0].id, files[1].id]);
    }
  }, [files, selectedFiles]);

  // Toggle file selection
  const toggleFileSelection = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      // Only remove if we have more than 2 files selected
      if (selectedFiles.length > 2) {
        setSelectedFiles(selectedFiles.filter(id => id !== fileId));
      }
    } else {
      // Only keep the most recent 2 selections
      if (selectedFiles.length >= 2) {
        setSelectedFiles([selectedFiles[1], fileId]);
      } else {
        setSelectedFiles([...selectedFiles, fileId]);
      }
    }
  };

  // Change difference display mode
  const changeDiffMode = (mode) => {
    setDiffMode(mode);
  };

  // Change threshold value
  const changeThreshold = (value) => {
    setThreshold(parseFloat(value));
  };

  // Toggle metric selection
  const toggleMetric = (metric) => {
    if (comparisonMetrics.includes(metric)) {
      setComparisonMetrics(comparisonMetrics.filter(m => m !== metric));
    } else {
      setComparisonMetrics([...comparisonMetrics, metric]);
    }
  };

  // Toggle endpoint expansion
  const toggleEndpoint = (endpoint) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [endpoint]: !prev[endpoint]
    }));
  };

  // Get metric label for display
  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'average': return 'Average (ms)';
      case 'median': return 'Median (ms)';
      case 'min': return 'Min (ms)';
      case 'max': return 'Max (ms)';
      case 'percentile90': return '90th Percentile (ms)';
      case 'percentile95': return '95th Percentile (ms)';
      case 'percentile99': return '99th Percentile (ms)';
      case 'throughput': return 'Throughput (req/s)';
      case 'errorPercentage': return 'Error Rate (%)';
      case 'count': return 'Sample Count';
      default: return metric;
    }
  };

  // Calculate difference between two values based on mode
  const calculateDifference = (value1, value2, mode) => {
    const absoluteDiff = value2 - value1;
    const percentageDiff = value1 === 0 ? 0 : (absoluteDiff / value1) * 100;
    
    return {
      absoluteDiff,
      percentageDiff,
      displayValue: mode === 'absolute' 
        ? absoluteDiff.toFixed(2) 
        : mode === 'percentage' 
          ? percentageDiff.toFixed(2) + '%' 
          : `${absoluteDiff.toFixed(2)} (${percentageDiff.toFixed(2)}%)`
    };
  };

  // Format metric value based on metric type
  const formatMetricValue = (value, metric) => {
    if (value === undefined || value === null) return 'N/A';
    
    if (metric === 'errorPercentage') {
      return value.toFixed(2) + '%';
    } else if (metric === 'throughput') {
      return value.toFixed(2);
    } else if (['average', 'median', 'min', 'max', 'percentile90', 'percentile95', 'percentile99'].includes(metric)) {
      return value.toFixed(0) + ' ms';
    } else {
      return value.toString();
    }
  };

  // Determine if a difference is significant based on threshold
  const isSignificantDifference = (diff) => {
    return Math.abs(diff.percentageDiff) >= threshold;
  };

  // Get CSS class for displaying the difference
  const getDiffClass = (diff) => {
    if (!isSignificantDifference(diff)) return '';
    return diff.absoluteDiff < 0 ? 'better' : 'worse';
  };

  // Export comparison data to CSV
  const exportComparisonData = () => {
    if (selectedFiles.length < 2) {
      return;
    }
    
    // Get the selected files' data
    const selectedData = files
      .filter(file => selectedFiles.includes(file.id))
      .map(file => ({
        name: file.name,
        id: file.id,
        version: jmeterVersions[file.id] || 'Unknown',
        statistics: file.processedData?.statistics || {}
      }));
      
    if (selectedData.length < 2) {
      return;
    }
    
    // Extract all unique endpoints from both files
    const allEndpoints = new Set();
    selectedData.forEach(file => {
      if (file.statistics && file.statistics.byLabel) {
        Object.keys(file.statistics.byLabel).forEach(endpoint => {
          allEndpoints.add(endpoint);
        });
      }
    });
    
    // Convert to array and sort alphabetically
    const endpoints = Array.from(allEndpoints).sort();
    
    // Create CSV header
    let csvContent = `Endpoint,Metric,${selectedData[0].name} (${selectedData[0].version}),${selectedData[1].name} (${selectedData[1].version}),Difference,% Difference\n`;
    
    // Add data rows
    endpoints.forEach(endpoint => {
      const stats1 = selectedData[0].statistics?.byLabel?.[endpoint] || {};
      const stats2 = selectedData[1].statistics?.byLabel?.[endpoint] || {};
      
      comparisonMetrics.forEach(metric => {
        const val1 = stats1[metric] || 0;
        const val2 = stats2[metric] || 0;
        const diff = calculateDifference(val1, val2, diffMode);
        
        csvContent += `"${endpoint}","${getMetricLabel(metric)}",${val1},${val2},${diff.absoluteDiff.toFixed(2)},${diff.percentageDiff.toFixed(2)}%\n`;
      });
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jmeter-comparison-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render the file selector component
  const renderFileSelector = () => {
    return (
      <FileSelectorContainer>
        <SectionTitle>Select Files to Compare</SectionTitle>
        <FileList>
          {files.map(file => (
            <FileItem 
              key={file.id} 
              selected={selectedFiles.includes(file.id)}
              onClick={() => toggleFileSelection(file.id)}
            >
              <FileItemCheckbox>
                {selectedFiles.includes(file.id) && <FaCheck />}
              </FileItemCheckbox>
              <FileItemDetails>
                <FileItemName>{file.name}</FileItemName>
                <FileItemVersion>JMeter: {jmeterVersions[file.id] || 'Unknown Version'}</FileItemVersion>
              </FileItemDetails>
            </FileItem>
          ))}
          {files.length < 2 && (
            <EmptyState>
              <p>Upload at least two JMeter files to compare</p>
            </EmptyState>
          )}
        </FileList>
        
        <UploadButtonContainer>
          <UploadButton onClick={() => document.getElementById('compare-file-upload').click()}>
            <FaPlus /> Upload New Files
          </UploadButton>
          <input
            id="compare-file-upload"
            type="file"
            accept=".jtl,.csv"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                if (onUploadFiles) {
                  onUploadFiles(e.target.files);
                } else {
                  toast.info(`Processing ${e.target.files.length} files...`);
                }
                e.target.value = null; // Reset input
              }
            }}
          />
        </UploadButtonContainer>
      </FileSelectorContainer>
    );
  };

  // Render the comparison table
  const renderComparisonTable = () => {
    if (selectedFiles.length < 2) {
      return (
        <EmptyState>
          <p>Select at least two files to compare</p>
        </EmptyState>
      );
    }

    // Get the selected files' data
    const selectedData = files
      .filter(file => selectedFiles.includes(file.id))
      .map(file => ({
        name: file.name,
        id: file.id,
        version: jmeterVersions[file.id] || 'Unknown',
        statistics: file.processedData?.statistics || {}
      }));

    if (selectedData.length < 2) {
      return (
        <EmptyState>
          <p>Selected files data is not available</p>
        </EmptyState>
      );
    }

    // Extract all unique endpoints from both files
    const allEndpoints = new Set();
    selectedData.forEach(file => {
      if (file.statistics && file.statistics.byLabel) {
        Object.keys(file.statistics.byLabel).forEach(endpoint => {
          allEndpoints.add(endpoint);
        });
      }
    });

    // Convert to array and sort alphabetically
    const endpoints = Array.from(allEndpoints).sort();

    return (
      <ComparisonTableContainer>
        <TableHeader>
          <TableHeaderCell width="35%">Endpoint / Metric</TableHeaderCell>
          <TableHeaderCell width="20%">{selectedData[0].name}</TableHeaderCell>
          <TableHeaderCell width="20%">{selectedData[1].name}</TableHeaderCell>
          <TableHeaderCell width="25%">Difference</TableHeaderCell>
        </TableHeader>

        <TableBody>
          {endpoints.map(endpoint => (
            <React.Fragment key={endpoint}>
              <EndpointRow onClick={() => toggleEndpoint(endpoint)}>
                <EndpointCell>
                  {expandedEndpoints[endpoint] ? <FaChevronDown /> : <FaChevronRight />}
                  {endpoint}
                </EndpointCell>
                <EndpointCell>{selectedData[0].statistics?.byLabel?.[endpoint] ? 'Available' : 'N/A'}</EndpointCell>
                <EndpointCell>{selectedData[1].statistics?.byLabel?.[endpoint] ? 'Available' : 'N/A'}</EndpointCell>
                <EndpointCell></EndpointCell>
              </EndpointRow>

              {expandedEndpoints[endpoint] && comparisonMetrics.map(metric => {
                const stats1 = selectedData[0].statistics?.byLabel?.[endpoint] || {};
                const stats2 = selectedData[1].statistics?.byLabel?.[endpoint] || {};
                const val1 = stats1[metric];
                const val2 = stats2[metric];
                const diff = calculateDifference(val1 || 0, val2 || 0, diffMode);
                const diffClass = getDiffClass(diff);

                return (
                  <MetricRow key={`${endpoint}-${metric}`}>
                    <MetricCell>{getMetricLabel(metric)}</MetricCell>
                    <ValueCell>{formatMetricValue(val1, metric)}</ValueCell>
                    <ValueCell>{formatMetricValue(val2, metric)}</ValueCell>
                    <DiffCell className={diffClass}>
                      {diff.displayValue}
                    </DiffCell>
                  </MetricRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </ComparisonTableContainer>
    );
  };

  // Render the comparison configuration panel
  const renderConfigPanel = () => {
    return (
      <ConfigPanel>
        <SectionTitle>Comparison Settings</SectionTitle>
        
        <ConfigSection>
          <ConfigSectionTitle>Difference Mode</ConfigSectionTitle>
          <ButtonGroup>
            <ToggleButton 
              active={diffMode === 'absolute'}
              onClick={() => changeDiffMode('absolute')}
              title="Show absolute differences"
            >
              <FaHashtag size={12} /> Absolute
            </ToggleButton>
            <ToggleButton 
              active={diffMode === 'percentage'}
              onClick={() => changeDiffMode('percentage')}
              title="Show percentage differences"
            >
              <FaPercent size={12} /> Percentage
            </ToggleButton>
            <ToggleButton 
              active={diffMode === 'hybrid'}
              onClick={() => changeDiffMode('hybrid')}
              title="Show both absolute and percentage differences"
            >
              <FaExchangeAlt size={12} /> Both
            </ToggleButton>
          </ButtonGroup>
        </ConfigSection>
        
        <ConfigSection>
          <ConfigSectionTitle>Threshold ({threshold}%)</ConfigSectionTitle>
          <RangeSlider 
            type="range" 
            min="0" 
            max="50" 
            step="1" 
            value={threshold}
            onChange={(e) => changeThreshold(e.target.value)}
          />
          <SliderLabels>
            <SliderLabel>0%</SliderLabel>
            <SliderLabel>25%</SliderLabel>
            <SliderLabel>50%</SliderLabel>
          </SliderLabels>
        </ConfigSection>
        
        <ConfigSection>
          <ConfigSectionTitle>Metrics to Compare</ConfigSectionTitle>
          <CheckboxList>
            {['average', 'median', 'percentile95', 'throughput', 'errorPercentage', 'count'].map(metric => (
              <CheckboxItem key={metric}>
                <Checkbox 
                  checked={comparisonMetrics.includes(metric)} 
                  onChange={() => toggleMetric(metric)}
                  id={`metric-${metric}`}
                />
                <CheckboxLabel htmlFor={`metric-${metric}`}>
                  {getMetricLabel(metric)}
                </CheckboxLabel>
              </CheckboxItem>
            ))}
          </CheckboxList>
        </ConfigSection>
        
        <ExportButton onClick={exportComparisonData}>
          <FaFileExport /> Export Comparison
        </ExportButton>
      </ConfigPanel>
    );
  };

  return (
    <Container>
      <ControlPanel>
        {renderFileSelector()}
        {renderConfigPanel()}
      </ControlPanel>
      <ContentPanel>
        {renderComparisonTable()}
      </ContentPanel>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const ControlPanel = styled.div`
  width: 320px;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  background-color: var(--background-color);
`;

const ContentPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const FileSelectorContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text-color);
`;

const FileList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  background-color: white;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  background-color: ${props => props.selected ? 'rgba(37, 99, 235, 0.1)' : 'white'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.selected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(0, 0, 0, 0.05)'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const FileItemCheckbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  border: 1.5px solid var(--primary-color);
  margin-right: 0.75rem;
  color: var(--primary-color);
`;

const FileItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileItemName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileItemVersion = styled.div`
  font-size: 0.75rem;
  color: var(--primary-color);
  margin-top: 0.25rem;
`;

const ConfigPanel = styled.div`
  padding: 1rem;
`;

const ConfigSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ConfigSectionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--text-color);
`;

const ButtonGroup = styled.div`
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  overflow: hidden;
`;

const ToggleButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: none;
  border-right: 1px solid var(--border-color);
  font-size: 0.75rem;
  cursor: pointer;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-dark)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const RangeSlider = styled.input`
  width: 100%;
  margin: 0.5rem 0;
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
`;

const SliderLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-light);
`;

const CheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: var(--text-color);
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

const ComparisonTableContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  overflow: hidden;
  background-color: white;
`;

const TableHeader = styled.div`
  display: flex;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
`;

const TableHeaderCell = styled.div`
  width: ${props => props.width || '25%'};
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
`;

const TableBody = styled.div`
  max-height: calc(100vh - 300px);
  overflow-y: auto;
`;

const EndpointRow = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const EndpointCell = styled.div`
  width: ${props => props.width || '25%'};
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetricRow = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: white;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetricCell = styled.div`
  width: 35%;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  font-size: 0.8125rem;
  color: var(--text-light);
`;

const ValueCell = styled.div`
  width: 20%;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
`;

const DiffCell = styled.div`
  width: 25%;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  
  &.better {
    color: #10b981;
  }
  
  &.worse {
    color: #ef4444;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-light);
  font-size: 0.875rem;
  text-align: center;
`;

const UploadButtonContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
`;

const UploadButton = styled.button`
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
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  svg {
    font-size: 0.75rem;
  }
`;

export default JMeterCompare; 