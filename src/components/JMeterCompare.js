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
  FaPlus,
  FaChartBar,
  FaTable,
  FaTimes,
  FaFileAlt
} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const JMeterCompare = ({ files, activeView, onUploadFiles, onViewFile, onRedirectToHistory, initialSelectedFiles = [], removedFromCompareIds = [], onRemoveFromCompare }) => {
  // State for selected files
  const [selectedFiles, setSelectedFiles] = useState(
    // Filter out any files that have been previously removed
    initialSelectedFiles.filter(id => !removedFromCompareIds.includes(id))
  );
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

  // State for files shown in the comparison section
  const [localFiles, setLocalFiles] = useState([]);

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

  // Initialize localFiles with initialSelectedFiles on component mount
  useEffect(() => {
    if (initialSelectedFiles.length > 0) {
      // Get unique file objects by filtering out duplicates based on ID
      // Also filter out any files that have been removed from comparison
      const initialFileObjects = files.filter(file => 
        initialSelectedFiles.includes(file.id) && 
        !removedFromCompareIds.includes(file.id)
      );
      
      // Create a map to track which file IDs we've already added
      const addedFileIds = new Set();
      const uniqueFiles = [];
      
      // Only add each file once based on its ID
      initialFileObjects.forEach(file => {
        if (!addedFileIds.has(file.id)) {
          addedFileIds.add(file.id);
          uniqueFiles.push(file);
        }
      });
      
      if (uniqueFiles.length > 0) {
        setLocalFiles(uniqueFiles);
      }
    }
  }, [initialSelectedFiles, files, removedFromCompareIds]);

  // Effect to update localFiles when selectedFiles changes
  useEffect(() => {
    // Update localFiles whenever selectedFiles changes
    // Get the file objects for any newly selected files
    const newSelectedFiles = selectedFiles.filter(id => 
      !localFiles.some(file => file.id === id)
    );
    
    if (newSelectedFiles.length > 0) {
      // Get the file objects for the newly selected files
      const newFileObjects = files.filter(file => 
        newSelectedFiles.includes(file.id)
      );
      
      // Create a map to ensure we're not adding duplicates
      const existingFileIds = new Set(localFiles.map(file => file.id));
      const uniqueNewFiles = newFileObjects.filter(file => !existingFileIds.has(file.id));
      
      if (uniqueNewFiles.length > 0) {
        setLocalFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);
      }
    }
  }, [files, selectedFiles, localFiles]);

  // Toggle file selection - modified to prevent duplicate selection
  const toggleFileSelection = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      // Remove the file if it's already selected
      setSelectedFiles(prevSelected => prevSelected.filter(id => id !== fileId));
    } else {
      // Add the file if we have less than 5 files selected
      if (selectedFiles.length < 5) {
        setSelectedFiles(prevSelected => [...prevSelected, fileId]);
      } else {
        // If we already have 5 files, show a toast message
        toast.info('Maximum of 5 files can be selected for comparison');
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
    // Ensure we only render unique files by ID
    const uniqueFileIds = new Set();
    const uniqueLocalFiles = localFiles.filter(file => {
      // Only keep the file if we haven't seen its ID before
      const isDuplicate = uniqueFileIds.has(file.id);
      if (!isDuplicate) {
        uniqueFileIds.add(file.id);
        return true;
      }
      return false;
    });

    return (
      <FileSelectorContainer>
        <SectionTitle>Select Files to Compare</SectionTitle>
        <FileList>
          {uniqueLocalFiles.map(file => (
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
              <FileItemActions>
                <FileItemAction 
                  title="View File" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewFile(file.id);
                  }}
                >
                  <FaFileAlt />
                </FileItemAction>
                <FileItemAction 
                  title="Remove" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(file.id);
                  }}
                >
                  <FaTimes />
                </FileItemAction>
              </FileItemActions>
            </FileItem>
          ))}
          {uniqueLocalFiles.length < 1 && (
            <EmptyState>
              <p>No files in comparison view. Go to File History to select files for comparison.</p>
            </EmptyState>
          )}
        </FileList>
        
        <UploadButtonContainer>
          <UploadButton onClick={() => {
            // This will redirect to the history section
            if (onRedirectToHistory) {
              onRedirectToHistory();
            }
          }}>
            <FaPlus /> Select Files from History
          </UploadButton>
        </UploadButtonContainer>
      </FileSelectorContainer>
    );
  };

  // Render the comparison table
  const renderComparisonTable = () => {
    if (selectedFiles.length < 1) {
      return (
        <EmptyState>
          <p>Select at least one file to compare</p>
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

    if (selectedData.length < 1) {
      return (
        <EmptyState>
          <p>Selected files data is not available</p>
        </EmptyState>
      );
    }

    // Extract all unique endpoints from all selected files
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

    // For single file comparison
    if (selectedData.length === 1) {
      return (
        <ComparisonTableContainer>
          <TableHeader>
            <TableHeaderCell width="40%">Endpoint / Metric</TableHeaderCell>
            <TableHeaderCell width="60%">{selectedData[0].name}</TableHeaderCell>
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
                </EndpointRow>

                {expandedEndpoints[endpoint] && comparisonMetrics.map(metric => {
                  const stats = selectedData[0].statistics?.byLabel?.[endpoint] || {};
                  const val = stats[metric];

                  return (
                    <MetricRow key={`${endpoint}-${metric}`}>
                      <MetricCell>{getMetricLabel(metric)}</MetricCell>
                      <ValueCell>{formatMetricValue(val, metric)}</ValueCell>
                    </MetricRow>
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </ComparisonTableContainer>
      );
    }

    // Multi-file comparison (2-5 files)
    const fileColumnWidth = Math.floor((80 / selectedData.length));
    const hasDiffColumn = selectedData.length === 2;
    const diffColumnWidth = hasDiffColumn ? 20 : 0;
    const endpointColumnWidth = 100 - (fileColumnWidth * selectedData.length) - diffColumnWidth;

    return (
      <ComparisonTableContainer>
        <TableHeader>
          <TableHeaderCell width={`${endpointColumnWidth}%`}>Endpoint / Metric</TableHeaderCell>
          {selectedData.map(file => (
            <TableHeaderCell key={file.id} width={`${fileColumnWidth}%`}>
              {file.name}
            </TableHeaderCell>
          ))}
          {hasDiffColumn && <TableHeaderCell width="20%">Difference</TableHeaderCell>}
        </TableHeader>

        <TableBody>
          {endpoints.map(endpoint => (
            <React.Fragment key={endpoint}>
              <EndpointRow onClick={() => toggleEndpoint(endpoint)}>
                <EndpointCell>
                  {expandedEndpoints[endpoint] ? <FaChevronDown /> : <FaChevronRight />}
                  {endpoint}
                </EndpointCell>
                {selectedData.map(file => (
                  <EndpointCell key={file.id}>
                    {file.statistics?.byLabel?.[endpoint] ? 'Available' : 'N/A'}
                  </EndpointCell>
                ))}
                {hasDiffColumn && <EndpointCell></EndpointCell>}
              </EndpointRow>

              {expandedEndpoints[endpoint] && comparisonMetrics.map(metric => {
                return (
                  <MetricRow key={`${endpoint}-${metric}`}>
                    <MetricCell>{getMetricLabel(metric)}</MetricCell>
                    {selectedData.map(file => {
                      const stats = file.statistics?.byLabel?.[endpoint] || {};
                      const val = stats[metric];
                      return (
                        <ValueCell key={file.id}>
                          {formatMetricValue(val, metric)}
                        </ValueCell>
                      );
                    })}
                    
                    {hasDiffColumn && (() => {
                      const stats1 = selectedData[0].statistics?.byLabel?.[endpoint] || {};
                      const stats2 = selectedData[1].statistics?.byLabel?.[endpoint] || {};
                      const val1 = stats1[metric];
                      const val2 = stats2[metric];
                      const diff = calculateDifference(val1 || 0, val2 || 0, diffMode);
                      const diffClass = getDiffClass(diff);
                      
                      return (
                        <DiffCell className={diffClass}>
                          {diff.displayValue}
                        </DiffCell>
                      );
                    })()}
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

  // Render the comparison content based on activeView
  const renderContent = () => {
    // Allow comparison with just one file if only one is selected
    if (selectedFiles.length < 1) {
      return (
        <EmptyState>
          <p>Select at least one file to compare</p>
        </EmptyState>
      );
    }
    
    if (activeView === 'graph') {
      return renderGraphView();
    } else {
      return renderComparisonTable();
    }
  };

  // New function to render graph visualization
  const renderGraphView = () => {
    if (selectedFiles.length < 1) {
      return (
        <EmptyState>
          <p>Select at least one file to compare</p>
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
        statistics: file.processedData?.statistics || {},
        visualizationData: file.processedData?.visualizationData || {}
      }));

    if (selectedData.length < 1) {
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

    // If no endpoints are found, use sample data for testing
    const useTestData = endpoints.length === 0;
    const testEndpoints = useTestData ? 
      ['/api/login', '/api/search', '/api/checkout', '/api/products'] : endpoints;

    // Prepare data for the chart
    const chartData = {
      labels: testEndpoints,
      datasets: selectedData.map((file, index) => {
        return {
          label: `${file.name} (${file.version})`,
          data: testEndpoints.map(endpoint => {
            if (useTestData) {
              // Generate random test data if no real data is available
              if (currentMetric === 'errorPercentage') {
                return Math.random() * 10; // 0-10% error rate
              } else if (currentMetric === 'throughput') {
                return 5 + Math.random() * 50; // 5-55 req/s
              } else {
                return 100 + Math.random() * 900; // 100-1000ms response times
              }
            } else {
              const stats = file.statistics?.byLabel?.[endpoint] || {};
              return stats[currentMetric] || 0;
            }
          }),
          backgroundColor: getFileColor(file.id),
          borderColor: getFileColor(file.id),
          borderWidth: 1
        };
      })
    };

    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `Comparison of ${getMetricLabel(currentMetric)} by Endpoint`
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              if (currentMetric === 'errorPercentage') {
                return `${context.dataset.label}: ${value.toFixed(2)}%`;
              } else if (['average', 'median', 'min', 'max', 'percentile90', 'percentile95', 'percentile99'].includes(currentMetric)) {
                return `${context.dataset.label}: ${value.toFixed(0)} ms`;
              } else {
                return `${context.dataset.label}: ${value}`;
              }
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: getMetricUnit(currentMetric)
          }
        }
      }
    };

    return (
      <GraphContainer>
        <GraphHeader>
          <GraphTitle>Comparison Graph</GraphTitle>
          <GraphControls>
            <MetricSelector 
              onChange={(e) => setCurrentMetric(e.target.value)}
              value={currentMetric || 'average'}
            >
              <option value="average">Average Response Time</option>
              <option value="median">Median Response Time</option>
              <option value="percentile95">95th Percentile</option>
              <option value="throughput">Throughput</option>
              <option value="errorPercentage">Error Rate</option>
            </MetricSelector>
          </GraphControls>
        </GraphHeader>
        
        <GraphContent>
          <ChartContainer>
            <Bar data={chartData} options={chartOptions} />
          </ChartContainer>
        </GraphContent>
      </GraphContainer>
    );
  };

  // Add state for current metric to display in graph
  const [currentMetric, setCurrentMetric] = useState('average');

  // Helper to get a color for a file based on its ID
  const getFileColor = (fileId) => {
    // Updated color palette for up to 5 files
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6'  // purple
    ];
    
    // If we have 5 or fewer files, assign each a unique color
    const index = selectedFiles.indexOf(fileId);
    if (index >= 0 && index < colors.length) {
      return colors[index];
    }
    
    // Fallback - use modulo to cycle through colors if we somehow have more than 5 files
    return colors[index % colors.length];
  };

  // Helper function to get the unit for a metric
  const getMetricUnit = (metric) => {
    switch (metric) {
      case 'average':
      case 'median':
      case 'min':
      case 'max':
      case 'percentile90':
      case 'percentile95':
      case 'percentile99':
        return 'Response Time (ms)';
      case 'throughput':
        return 'Requests per Second';
      case 'errorPercentage':
        return 'Error Rate (%)';
      case 'count':
        return 'Count';
      default:
        return '';
    }
  };

  // Add the handleViewFile and handleRemoveFile functions
  const handleViewFile = (fileId) => {
    // Handle redirecting to view the file
    if (onViewFile) {
      // Call onViewFile with the fileId to open the file
      onViewFile(fileId);
      // Log that we're trying to view a file
      console.log("Attempting to view file with ID:", fileId);
    } else {
      console.error("onViewFile prop is not provided to JMeterCompare component");
    }
  };

  const handleRemoveFile = (fileId) => {
    // Remove the file from the local file list (not from history)
    setLocalFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    
    // If the file was selected, also remove it from selectedFiles
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(prevSelected => prevSelected.filter(id => id !== fileId));
    }
    
    // Notify the parent component that this file has been removed from comparison
    if (onRemoveFromCompare) {
      onRemoveFromCompare(fileId);
    }
  };

  return (
    <Container>
      <ControlPanel>
        {renderFileSelector()}
        {renderConfigPanel()}
      </ControlPanel>
      <ContentPanel>
        <ViewIndicator>
          <ViewType active={activeView === 'graph'}><FaChartBar /> Graph View</ViewType>
          <ViewType active={activeView === 'table'}><FaTable /> Table View</ViewType>
        </ViewIndicator>
        {renderContent()}
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

const FileItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FileItemAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  background-color: transparent;
  color: var(--text-light);
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
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
  justify-content: space-between;
  gap: 0.5rem;
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
  flex: 1;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  svg {
    font-size: 0.75rem;
  }
`;

// Add new styled components for the graph view
const GraphContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  overflow: hidden;
  background-color: white;
`;

const GraphHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color);
`;

const GraphTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const GraphControls = styled.div`
  display: flex;
  gap: 1rem;
`;

const MetricSelector = styled.select`
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--border-color);
  background-color: white;
  font-size: 0.875rem;
`;

const GraphContent = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 400px; /* Ensure minimum height for the chart */
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

// Add styled components for the view indicator
const ViewIndicator = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  background-color: var(--background-color);
`;

const ViewType = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-light)'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  
  svg {
    font-size: 1rem;
  }
`;

export default JMeterCompare; 