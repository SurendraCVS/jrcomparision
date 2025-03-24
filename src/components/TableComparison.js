import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSort, FaSortUp, FaSortDown, FaDownload, FaFilter, FaChevronDown, FaChevronRight, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

const TableComparison = ({ data, files, activeTab = 'statistics' }) => {
  // Use the activeTab prop from App.js if provided, otherwise default to 'statistics'
  const [innerTab, setInnerTab] = useState(activeTab);
  
  // Update innerTab when activeTab prop changes
  useEffect(() => {
    setInnerTab(activeTab);
  }, [activeTab]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);
  const [apdexThresholds, setApdexThresholds] = useState({
    toleration: 500, // ms
    frustration: 1500 // ms
  });

  useEffect(() => {
    // If we have files, but none selected yet, select the first two files
    if (files && files.length > 0 && selectedFiles.length === 0) {
      const filesToSelect = files.length >= 2 
        ? [files[0].id, files[1].id]
        : [files[0].id];
      setSelectedFiles(filesToSelect);
    }
  }, [files, selectedFiles]);

  const handleFileSelection = (fileId) => {
    setSelectedFiles(prevSelected => {
      if (prevSelected.includes(fileId)) {
        return prevSelected.filter(id => id !== fileId);
      } else {
        // Limit to max 3 files for comparison
        const newSelected = [...prevSelected, fileId];
        return newSelected.slice(0, 3);
      }
    });
  };

  const toggleRowExpansion = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prevSortConfig => {
      if (prevSortConfig.key === key) {
        if (prevSortConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prevSortConfig.direction === 'desc') {
          return { key: '', direction: '' };
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleShowOnlyDiffs = () => {
    setShowOnlyDiffs(!showOnlyDiffs);
  };

  // Handle APDEX threshold updates
  const handleToleranceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setApdexThresholds(prev => ({
        ...prev,
        toleration: value
      }));
    }
  };
  
  const handleFrustrationChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setApdexThresholds(prev => ({
        ...prev,
        frustration: value
      }));
    }
  };

  const exportData = () => {
    let csvContent = '';
    let filename = '';
    
    if (innerTab === 'jtl') {
      // Export raw data
      const selectedData = files
        .filter(file => selectedFiles.includes(file.id))
        .map(file => ({
          name: file.name,
          data: file.processedData.rawData
        }));
      
      if (selectedData.length === 0) return;
      
      // Create CSV header
      csvContent = 'File,Timestamp,Label,Elapsed Time (ms),Success,ResponseCode,ResponseMessage,ThreadName,DataType,SampleCount,ErrorCount\n';
      
      // Add data rows
      selectedData.forEach(file => {
        file.data.forEach(row => {
          csvContent += `"${file.name}",${row.timestamp},"${row.label}",${row.elapsed},${row.success},"${row.responseCode}","${row.responseMessage}","${row.threadName}","${row.dataType}",${row.sampleCount},${row.errorCount}\n`;
        });
      });
      
      filename = 'raw-jtl-data.csv';
    } else if (innerTab === 'statistics') {
      // Export statistics
      const selectedData = files
        .filter(file => selectedFiles.includes(file.id))
        .map(file => ({
          name: file.name,
          statistics: file.processedData.statistics
        }));
      
      if (selectedData.length === 0) return;
      
      // Create CSV header
      csvContent = 'File,Label,Count,Error %,Average (ms),Median (ms),90% Line (ms),95% Line (ms),99% Line (ms),Min (ms),Max (ms),Throughput (/sec)\n';
      
      // Add data rows
      selectedData.forEach(file => {
        Object.entries(file.statistics.byLabel).forEach(([label, stats]) => {
          csvContent += `"${file.name}","${label}",${stats.count},${stats.errorPercentage.toFixed(2)},${stats.average.toFixed(2)},${stats.median.toFixed(2)},${stats.percentile90.toFixed(2)},${stats.percentile95.toFixed(2)},${stats.percentile99.toFixed(2)},${stats.min},${stats.max},${stats.throughput.toFixed(2)}\n`;
        });
      });
      
      filename = 'jmeter-statistics.csv';
    } else if (innerTab === 'apdex') {
      // Export APDEX scores
      const selectedData = files
        .filter(file => selectedFiles.includes(file.id))
        .map(file => ({
          name: file.name,
          apdex: file.processedData.apdexScores
        }));
      
      if (selectedData.length === 0) return;
      
      // Create CSV header with thresholds info
      csvContent = `APDEX Thresholds: Toleration=${apdexThresholds.toleration}ms, Frustration=${apdexThresholds.frustration}ms\n`;
      csvContent += 'File,Label,Satisfied Count,Tolerated Count,Frustrated Count,APDEX Score,Rating\n';
      
      // Add data rows
      selectedData.forEach(file => {
        Object.entries(file.apdex).forEach(([label, score]) => {
          csvContent += `"${file.name}","${label}",${score.satisfied},${score.tolerated},${score.frustrated},${score.score.toFixed(2)},"${score.rating}"\n`;
        });
      });
      
      filename = 'jmeter-apdex.csv';
    }
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render file selection options
  const renderFileOptions = () => {
    if (!files || files.length === 0) {
      return <NoFilesMessage>No files uploaded</NoFilesMessage>;
    }
    
    return (
      <FileOptions>
        <FileOptionsHeader>
          <h3>Select Files to Compare (max 3)</h3>
          <SelectedCount>{selectedFiles.length} selected</SelectedCount>
        </FileOptionsHeader>
        <FileOptionsList>
          {files.map(file => (
            <FileOptionAlternative 
              key={file.id} 
              isSelected={selectedFiles.includes(file.id)}
              onClick={() => handleFileSelection(file.id)}
            >
              <FileCheckbox type="checkbox" checked={selectedFiles.includes(file.id)} readOnly />
              <FileOptionName>{file.name}</FileOptionName>
              <FileOptionInfo>
                {file.processedData?.rawData?.length || 0} samples
              </FileOptionInfo>
            </FileOptionAlternative>
          ))}
        </FileOptionsList>
      </FileOptions>
    );
  };
  
  // Render raw JTL data table
  const renderRawDataTable = () => {
    // If no files are selected, show an empty state
    if (!files || files.length === 0 || selectedFiles.length === 0) {
      return <EmptyState>Select at least one file to view data</EmptyState>;
    }
    
    // Get the selected files with their raw data
    const selectedData = files
      .filter(file => selectedFiles.includes(file.id))
      .map(file => ({
        name: file.name,
        id: file.id,
        data: file.processedData?.rawData || []
      }));
    
    if (selectedData.length === 0 || selectedData.every(file => !file.data || file.data.length === 0)) {
      return <EmptyState>No raw data available for selected files</EmptyState>;
    }
    
    // Combine data from all files with file name
    let combinedData = [];
    selectedData.forEach(file => {
      combinedData = [
        ...combinedData,
        ...(file.data || []).map(row => ({
          ...row,
          file: file.name
        }))
      ];
    });
    
    // Calculate total samples
    const totalSamples = combinedData.length;
    const successCount = combinedData.filter(row => row.success).length;
    const failureCount = totalSamples - successCount;
    
    // Apply sorting if configured
    if (sortConfig.key) {
      combinedData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle special cases for sorting
        if (sortConfig.key === 'timeStamp') {
          aValue = new Date(parseInt(aValue)).getTime();
          bValue = new Date(parseInt(bValue)).getTime();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Filter data if needed
    let filteredData = combinedData;
    if (showOnlyDiffs) {
      // For raw data, we can't easily show "diffs", so instead filter to only show errors
      filteredData = combinedData.filter(row => !row.success);
    }
    
    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleString();
    };
    
  return (
      <>
        <TableInfo>
          <InfoText>
            {filteredData.length} samples from {selectedData.length} file(s) • 
            <SuccessRate>
              <SuccessLabel>Success: {successCount} ({((successCount / totalSamples) * 100).toFixed(1)}%)</SuccessLabel>
              <FailureLabel>Failure: {failureCount} ({((failureCount / totalSamples) * 100).toFixed(1)}%)</FailureLabel>
            </SuccessRate>
          </InfoText>
          <TableActions>
            <ActionButton onClick={toggleShowOnlyDiffs}>
              <FaFilter /> {showOnlyDiffs ? 'Show All' : 'Show Errors Only'}
            </ActionButton>
            <ActionButton onClick={exportData}>
              <FaDownload /> Export CSV
            </ActionButton>
          </TableActions>
        </TableInfo>
        
        <RawDataTable>
            <thead>
              <tr>
              <HeaderCell onClick={() => handleSort('file')}>
                File {sortConfig.key === 'file' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </HeaderCell>
              <HeaderCell onClick={() => handleSort('timeStamp')}>
                Timestamp {sortConfig.key === 'timeStamp' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      </HeaderCell>
              <HeaderCell onClick={() => handleSort('elapsed')}>
                Response Time (ms) {sortConfig.key === 'elapsed' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                    </HeaderCell>
              <HeaderCell onClick={() => handleSort('label')}>
                Label {sortConfig.key === 'label' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('responseCode')}>
                Response Code {sortConfig.key === 'responseCode' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('responseMessage')}>
                Response Message {sortConfig.key === 'responseMessage' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('threadName')}>
                Thread {sortConfig.key === 'threadName' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('dataType')}>
                Data Type {sortConfig.key === 'dataType' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('success')}>
                Success {sortConfig.key === 'success' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('failureMessage')}>
                Failure Message {sortConfig.key === 'failureMessage' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('bytes')}>
                Bytes {sortConfig.key === 'bytes' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('sentBytes')}>
                Sent Bytes {sortConfig.key === 'sentBytes' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('grpThreads')}>
                Group Threads {sortConfig.key === 'grpThreads' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('allThreads')}>
                All Threads {sortConfig.key === 'allThreads' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('URL')}>
                URL {sortConfig.key === 'URL' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('Latency')}>
                Latency (ms) {sortConfig.key === 'Latency' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('IdleTime')}>
                Idle Time {sortConfig.key === 'IdleTime' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
              <HeaderCell onClick={() => handleSort('Connect')}>
                Connect (ms) {sortConfig.key === 'Connect' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </HeaderCell>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <EmptyCell colSpan={18}>No data available</EmptyCell>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <TableRow key={index} success={row.success}>
                  <DataCell>{row.file}</DataCell>
                  <DataCell>{formatTimestamp(row.timeStamp)}</DataCell>
                  <DataCell numeric>{row.elapsed}</DataCell>
                  <DataCell>{row.label}</DataCell>
                  <DataCell highlight={!row.success && row.responseCode !== '200'}>
                    {row.responseCode}
                  </DataCell>
                  <DataCell highlight={!row.success}>
                    {row.responseMessage}
                  </DataCell>
                  <DataCell>{row.threadName}</DataCell>
                  <DataCell>{row.dataType}</DataCell>
                  <DataCell success={row.success} highlight={!row.success}>
                    {row.success ? 'Yes' : 'No'}
                  </DataCell>
                  <DataCell highlight={!!row.failureMessage}>
                    {row.failureMessage || '-'}
                  </DataCell>
                  <DataCell numeric>{row.bytes?.toLocaleString()}</DataCell>
                  <DataCell numeric>{row.sentBytes?.toLocaleString()}</DataCell>
                  <DataCell numeric>{row.grpThreads}</DataCell>
                  <DataCell numeric>{row.allThreads}</DataCell>
                  <DataCell>
                    <Truncated title={row.URL}>{row.URL || '-'}</Truncated>
                  </DataCell>
                  <DataCell numeric>{row.Latency}</DataCell>
                  <DataCell numeric>{row.IdleTime}</DataCell>
                  <DataCell numeric>{row.Connect}</DataCell>
                </TableRow>
              ))
            )}
          </tbody>
        </RawDataTable>
      </>
    );
  };

  // Render statistics table
  const renderStatisticsTable = () => {
    // If no files are selected, show an empty state
    if (!files || files.length === 0 || selectedFiles.length === 0) {
      return <EmptyState>Select at least one file to view statistics</EmptyState>;
    }
    
    // Get the selected files with their statistics
    const selectedData = files
      .filter(file => selectedFiles.includes(file.id))
      .map(file => ({
        name: file.name,
        id: file.id,
        statistics: file.processedData?.statistics || {}
      }));
    
    if (selectedData.length === 0) {
      return <EmptyState>No statistics available for selected files</EmptyState>;
    }

    // Get all unique endpoints/labels across all files
    const allLabels = new Set();
    selectedData.forEach(file => {
      if (file.statistics.byLabel) {
        Object.keys(file.statistics.byLabel).forEach(label => {
          allLabels.add(label);
        });
      }
    });
    
    // Add a "Total" entry
    allLabels.add("Total");
    
    // Format the value based on the metric type
    const formatValue = (value, isPercentage = false, decimalPlaces = 2) => {
      if (value === null || value === undefined) return '-';
      
      if (isPercentage) {
        return value.toFixed(decimalPlaces) + '%';
      } else if (Number.isInteger(value)) {
        return value.toLocaleString();
      } else {
        return value.toFixed(decimalPlaces);
      }
    };
    
    return (
      <>
        <TableInfo>
          <InfoText>
            Showing statistics from {selectedData.length} file(s)
          </InfoText>
          <TableActions>
            <ActionButton onClick={toggleShowOnlyDiffs}>
              <FaFilter /> {showOnlyDiffs ? 'Show All' : 'Show Differences'}
            </ActionButton>
            <ActionButton onClick={exportData}>
              <FaDownload /> Export CSV
            </ActionButton>
          </TableActions>
        </TableInfo>
        
        <StatisticsTable>
          <thead>
            <tr>
              <HeaderCell colSpan="1" className="section-header">Requests</HeaderCell>
              <HeaderCell colSpan="3" className="section-header">Executions</HeaderCell>
              <HeaderCell colSpan="7" className="section-header">Response Times (ms)</HeaderCell>
              <HeaderCell colSpan="1" className="section-header">Throughput</HeaderCell>
              <HeaderCell colSpan="2" className="section-header">Network (KB/sec)</HeaderCell>
            </tr>
            <tr>
              <HeaderCell>Label</HeaderCell>
              <HeaderCell>#Samples</HeaderCell>
              <HeaderCell>FAIL</HeaderCell>
              <HeaderCell>Error %</HeaderCell>
              <HeaderCell>Average</HeaderCell>
              <HeaderCell>Min</HeaderCell>
              <HeaderCell>Max</HeaderCell>
              <HeaderCell>Median</HeaderCell>
              <HeaderCell>90th pct</HeaderCell>
              <HeaderCell>95th pct</HeaderCell>
              <HeaderCell>99th pct</HeaderCell>
              <HeaderCell>Transactions/s</HeaderCell>
              <HeaderCell>Received</HeaderCell>
              <HeaderCell>Sent</HeaderCell>
              </tr>
            </thead>
            <tbody>
            {/* Total row */}
            <TableRow>
              <LabelCell>Total</LabelCell>
              <DataCell numeric>{selectedData[0].statistics.totalSamples || 0}</DataCell>
              <DataCell numeric>{selectedData[0].statistics.failures || 0}</DataCell>
              <DataCell numeric highlight={selectedData[0].statistics.errorPercentage > 5}>
                {formatValue(selectedData[0].statistics.errorPercentage, true)}
              </DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.avgResponseTime)}</DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.minResponseTime)}</DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.maxResponseTime)}</DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.medianResponseTime)}</DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.percentile90)}</DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.percentile95)}</DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.percentile99)}</DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.throughput)}</DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.receivedKBPerSec)}</DataCell>
              <DataCell numeric>{formatValue(selectedData[0].statistics.sentKBPerSec)}</DataCell>
            </TableRow>
            
            {/* Rows for each endpoint/label */}
            {Array.from(allLabels)
              .filter(label => label !== "Total")
              .map(label => {
                const labelStats = selectedData[0].statistics.byLabel?.[label];
                if (!labelStats) return null;
                
                return (
                  <TableRow key={label}>
                    <LabelCell>{label}</LabelCell>
                    <DataCell numeric>{formatValue(labelStats.count)}</DataCell>
                    <DataCell numeric>{formatValue(labelStats.failures)}</DataCell>
                    <DataCell numeric highlight={labelStats.errorPercentage > 5}>
                      {formatValue(labelStats.errorPercentage, true)}
                        </DataCell>
                    <DataCell numeric>{formatValue(labelStats.average)}</DataCell>
                    <DataCell numeric>{formatValue(labelStats.min)}</DataCell>
                    <DataCell numeric>{formatValue(labelStats.max)}</DataCell>
                    <DataCell numeric>{formatValue(labelStats.median)}</DataCell>
                    <DataCell numeric>{formatValue(labelStats.percentile90)}</DataCell>
                    <DataCell numeric>{formatValue(labelStats.percentile95)}</DataCell>
                    <DataCell numeric>{formatValue(labelStats.percentile99)}</DataCell>
                    <DataCell numeric>{formatValue(labelStats.throughput)}</DataCell>
                    <DataCell numeric>{formatValue(selectedData[0].statistics.receivedKBPerSec)}</DataCell>
                    <DataCell numeric>{formatValue(selectedData[0].statistics.sentKBPerSec)}</DataCell>
                  </TableRow>
                );
              })}
          </tbody>
        </StatisticsTable>
      </>
    );
  };
  
  // Render APDEX table
  const renderApdexTable = () => {
    // If no files are selected, show an empty state
    if (!files || files.length === 0 || selectedFiles.length === 0) {
      return <EmptyState>Select at least one file to view APDEX scores</EmptyState>;
    }
    
    // Get the selected files with their APDEX scores
    const selectedData = files
      .filter(file => selectedFiles.includes(file.id))
      .map(file => ({
        name: file.name,
        id: file.id,
        apdex: file.processedData?.apdexScores || {}
      }));
    
    if (selectedData.length === 0 || selectedData.every(file => !file.apdex || Object.keys(file.apdex).length === 0)) {
      return <EmptyState>No APDEX data available for selected files</EmptyState>;
    }
    
    // Get all unique endpoints across all files
    const allEndpoints = new Set();
    selectedData.forEach(file => {
      Object.keys(file.apdex || {}).forEach(endpoint => {
        allEndpoints.add(endpoint);
      });
    });
    
    // Create APDEX data array
    const apdexData = [];
    
    // First add the total as the first row (if exists)
    if (selectedData[0] && selectedData[0].apdex && 'Total' in selectedData[0].apdex) {
      const totalApdex = selectedData[0].apdex['Total']?.score || 0;
      apdexData.push({
        label: 'Total',
        apdex: totalApdex
      });
    } else {
      // Add a default Total row if it doesn't exist
      apdexData.push({
        label: 'Total',
        apdex: 0
      });
    }
    
    // Then add all other endpoints
    Array.from(allEndpoints).forEach(endpoint => {
      if (endpoint !== 'Total') {
        const score = selectedData[0]?.apdex?.[endpoint]?.score || 0;
        apdexData.push({
          label: endpoint,
          apdex: score
        });
      }
    });
    
    // Title with APDEX information
    const title = "APDEX (Application Performance Index)";
    
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{title}</h2>
          </div>
          <TableActions>
            <ActionButton onClick={exportData}>
              <FaDownload /> Export CSV
            </ActionButton>
          </TableActions>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: '1' }}>
            <ApdexTable>
              <thead>
                <tr>
                  <HeaderCell style={{ backgroundColor: '#e6f0ff', minWidth: '80px' }}>Apdex <SortIcon/></HeaderCell>
                  <HeaderCell style={{ backgroundColor: '#e6f0ff', minWidth: '100px' }}>T (Toleration threshold) <SortIcon/></HeaderCell>
                  <HeaderCell style={{ backgroundColor: '#e6f0ff', minWidth: '120px' }}>F (Frustration threshold) <SortIcon/></HeaderCell>
                  <HeaderCell style={{ backgroundColor: '#e6f0ff' }}>Label <SortIcon/></HeaderCell>
                </tr>
              </thead>
              <tbody>
                {apdexData.map((row, index) => (
                  <TableRow key={index} highlight={false}>
                    <DataCell style={{ fontWeight: '500', textAlign: 'left' }}>
                      {typeof row.apdex === 'number' ? row.apdex.toFixed(3) : '0.000'}
                    </DataCell>
                    <DataCell>
                      {apdexThresholds.toleration} ms
                    </DataCell>
                    <DataCell>
                      {apdexThresholds.frustration === 1500 ? '1 sec 500 ms' : `${apdexThresholds.frustration} ms`}
                    </DataCell>
                    <DataCell>
                      {row.label}
                    </DataCell>
                  </TableRow>
              ))}
            </tbody>
            </ApdexTable>
          </div>
          
          <div style={{ width: '400px' }}>
            <RequestsSummary>
              <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center', fontWeight: '600' }}>Requests Summary</h3>
              <PieChartContainer>
                {selectedData[0] && selectedData[0].statistics && (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <PassRateLabel style={{ 
                      position: 'absolute', 
                      left: '50%', 
                      top: '70%', 
                      transform: 'translate(-50%, -50%)', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: 'rgba(136, 226, 38, 0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>PASS</span>
                      <span>{selectedData[0].statistics?.errorPercentage !== undefined ? 
                        ((1 - (selectedData[0].statistics.errorPercentage / 100)) * 100).toFixed(1) : 
                        '100.0'}%</span>
                    </PassRateLabel>
                    <FailRateLabel style={{ 
                      position: 'absolute', 
                      right: '15%', 
                      top: '15%', 
                      backgroundColor: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>FAIL</span>
                      <span>{selectedData[0].statistics?.errorPercentage !== undefined ? 
                        selectedData[0].statistics.errorPercentage.toFixed(1) : 
                        '0.0'}%</span>
                    </FailRateLabel>
                  </div>
                )}
                {(!selectedData[0] || !selectedData[0].statistics) && (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                    No statistics data available
                  </div>
                )}
              </PieChartContainer>
            </RequestsSummary>
          </div>
        </div>
        
        <ApdexFormulaContainer>
          <FormulaTitle>APDEX Formula:</FormulaTitle>
          <Formula>
            APDEX = (Satisfied Count + (Tolerating Count / 2)) / Total Requests
          </Formula>
          <FormulaLegend>
            <LegendItem>Satisfied: Response time {'\u2264'} T ({apdexThresholds.toleration}ms)</LegendItem>
            <LegendItem>Tolerating: T {'\u003C'} Response time {'\u2264'} F ({apdexThresholds.frustration}ms)</LegendItem>
            <LegendItem>Frustrated: Response time {'\u003E'} F ({apdexThresholds.frustration}ms)</LegendItem>
          </FormulaLegend>
        </ApdexFormulaContainer>
        
        <ApdexThresholdControls>
          <ThresholdControl>
            <ThresholdLabel>Toleration Threshold (ms):</ThresholdLabel>
            <ThresholdInput 
              type="number" 
              min="100" 
              step="100" 
              value={apdexThresholds.toleration} 
              onChange={handleToleranceChange}
            />
          </ThresholdControl>
          <ThresholdControl>
            <ThresholdLabel>Frustration Threshold (ms):</ThresholdLabel>
            <ThresholdInput 
              type="number" 
              min="100" 
              step="100" 
              value={apdexThresholds.frustration} 
              onChange={handleFrustrationChange}
            />
          </ThresholdControl>
        </ApdexThresholdControls>
      </>
    );
  };

  // Get title based on active tab
  const getTableTitle = () => {
    switch (innerTab) {
      case 'jtl':
        return 'JTL Raw Data Table';
      case 'statistics':
        return 'Performance Statistics Table';
      case 'apdex':
        return 'APDEX Scores Table';
      default:
        return 'Data Table';
    }
  };

  return (
    <TableContainer>
      <TableHeader>
        <TableTitle>{getTableTitle()}</TableTitle>
        <GraphViewHint>
          <FaChartLine /> Switch to Graph View for visual analysis using the toggle in the header
        </GraphViewHint>
      </TableHeader>
      
      {renderFileOptions()}
      
      {innerTab === 'jtl' && renderRawDataTable()}
      {innerTab === 'statistics' && renderStatisticsTable()}
      {innerTab === 'apdex' && renderApdexTable()}
    </TableContainer>
  );
};

// Styled Components
const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
  margin: 1rem;
  padding: 1rem;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const TableTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
`;

const GraphViewHint = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-light);
  
  svg {
    margin-right: 0.5rem;
    color: var(--primary-color);
  }
`;

const ComparisonContainer = styled.div`
  padding: 1.5rem;
  width: 100%;
  overflow-x: auto;
`;

const ComparisonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const ComparisonTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
`;

const ComparisonControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const ComparisonAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--background-color);
  }
  
  svg {
    font-size: 0.875rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.375rem 0.625rem;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  overflow: hidden;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: none;
  border-right: ${props => props.active ? 'none' : '1px solid var(--border-color)'};
  font-size: 0.875rem;
  cursor: pointer;
  
  &:last-child {
    border-right: none;
  }
  
  svg {
    margin-right: 0.375rem;
  }
`;

const ButtonText = styled.span`
  @media (max-width: 576px) {
    display: none;
  }
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
  
  input {
    margin-right: 0.5rem;
  }
`;

const ToggleText = styled.span`
  color: var(--text-color);
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color);
`;

const TabButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: none;
  border-bottom: ${props => props.active ? '2px solid var(--primary-color)' : 'none'};
  font-size: 0.875rem;
  cursor: pointer;
`;

const FileSelectorContainer = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color);
`;

const FileSelectorLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const FileSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TableInfo = styled.div`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color);
`;

const InfoText = styled.span`
  font-size: 0.875rem;
  color: var(--text-light);
`;

const RawDataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const EmptyCell = styled.td`
  padding: 2rem;
  text-align: center;
  color: var(--text-light);
  font-style: italic;
`;

const StatisticsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  
  .section-header {
    background-color: var(--background-color);
    font-weight: 600;
    padding: 0.75rem 1rem;
  }
`;

const TableActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--background-color);
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

const ComparisonDetailsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  border: 1px solid var(--border-color);
  margin-bottom: 1rem;
`;

const ComparisonHeaderCell = styled.th`
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  text-align: left;
  font-weight: 600;
`;

const ComparisonRow = styled.tr`
  &:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

const ComparisonCell = styled.td`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  text-align: ${props => props.numeric ? 'right' : 'left'};
  white-space: nowrap;
  color: ${props => 
    props.increase 
      ? 'var(--error-color)' 
      : props.decrease 
        ? 'var(--success-color)' 
        : 'inherit'
  };
  font-weight: ${props => (props.increase || props.decrease) ? '500' : 'normal'};
`;

const ApdexTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  background-color: white;
`;

const ApdexScore = styled.div`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  
  &.good {
    background-color: rgba(16, 185, 129, 0.2);
    color: rgb(6, 95, 70);
  }
  
  &.fair {
    background-color: rgba(245, 158, 11, 0.2);
    color: rgb(146, 64, 14);
  }
  
  &.poor {
    background-color: rgba(239, 68, 68, 0.2);
    color: rgb(185, 28, 28);
  }
`;

const ApdexRating = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  
  &.good {
    color: rgb(6, 95, 70);
  }
  
  &.fair {
    color: rgb(146, 64, 14);
  }
  
  &.poor {
    color: rgb(185, 28, 28);
  }
`;

const ApdexLegend = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 0.25rem;
  
  h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    span {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .good {
      background-color: rgba(16, 185, 129, 0.2);
      color: rgb(6, 95, 70);
    }
    
    .fair {
      background-color: rgba(245, 158, 11, 0.2);
      color: rgb(146, 64, 14);
    }
    
    .poor {
      background-color: rgba(239, 68, 68, 0.2);
      color: rgb(185, 28, 28);
    }
  }
  
  .apdex-explanation {
    font-size: 0.75rem;
    color: var(--text-light);
    margin: 0;
    line-height: 1.4;
  }
`;

const ApdexInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ApdexThresholds = styled.div`
  display: flex;
  gap: 1rem;
`;

const ThresholdInput = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  
  label {
    margin-right: 0.5rem;
    white-space: nowrap;
  }
  
  input {
    width: 70px;
    padding: 0.25rem;
    border: 1px solid var(--border-color);
    border-radius: 0.25rem;
  }
`;

const ApdexThresholdControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const ThresholdControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ThresholdLabel = styled.label`
  font-size: 0.75rem;
  color: var(--text-light);
`;

const EndpointStatisticsContainer = styled.div`
  margin-top: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  overflow: hidden;
`;

const EndpointHeader = styled.div`
  padding: 1rem;
    background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
  }
`;

const EndpointItem = styled.div`
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const EndpointName = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  svg {
    margin-right: 0.5rem;
    color: var(--text-light);
  }
`;

const EndpointDetails = styled.div`
  padding: 0.5rem 1rem 1rem;
  background-color: rgba(0, 0, 0, 0.01);
`;

const EndpointStatisticsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  border: 1px solid var(--border-color);
  
  th, td {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
  }
  
  th {
    background-color: rgba(0, 0, 0, 0.03);
    font-weight: 600;
  }
`;

const ApdexFormulaContainer = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  background-color: var(--background-color);
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
`;

const FormulaTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
`;

const Formula = styled.div`
  font-family: monospace;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const FormulaLegend = styled.div`
  font-size: 0.75rem;
  color: var(--text-light);
`;

const LegendItem = styled.div`
  margin-bottom: 0.25rem;
`;

const ApdexDifference = styled.div`
  font-weight: 500;
  color: ${props => {
    const val = parseFloat(props.value);
    if (val > 0.1) return 'rgb(16, 185, 129)';
    if (val < -0.1) return 'rgb(239, 68, 68)';
    return 'inherit';
  }};
  text-align: center;
  font-size: 0.875rem;
`;

const SuccessRate = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  margin-left: 0.5rem;
`;

const SuccessLabel = styled.span`
  color: var(--success-color);
  font-weight: 500;
`;

const FailureLabel = styled.span`
  color: var(--error-color);
  font-weight: 500;
`;

const Truncated = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const ComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  
  .difference-column {
    background-color: rgba(243, 244, 246, 0.5);
  }
`;

const HeaderCell = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
  cursor: pointer;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  
  &:hover {
    background-color: var(--background-color);
  }
  
  svg {
    margin-left: 0.25rem;
    font-size: 0.75rem;
    vertical-align: middle;
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  background-color: ${props => 
    props.success === false 
      ? 'rgba(239, 68, 68, 0.1)' 
      : props.highlight 
        ? 'rgba(255, 237, 213, 0.4)' 
        : 'inherit'
  };
  
  &:hover {
    background-color: rgba(37, 99, 235, 0.05);
  }
  
  cursor: pointer;
`;

const LabelCell = styled.td`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
  font-weight: 500;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  
  svg {
    margin-right: 0.5rem;
    color: var(--text-light);
    vertical-align: middle;
  }
`;

const DataCell = styled.td`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  white-space: ${props => props.numeric ? 'nowrap' : 'normal'};
  text-align: ${props => props.numeric ? 'right' : 'left'};
  color: ${props => 
    props.empty 
      ? 'var(--text-light)' 
      : props.highlight 
        ? 'var(--error-color)' 
        : props.positive
          ? 'var(--success-color)'
          : props.negative
            ? 'var(--error-color)'
            : 'var(--text-color)'
  };
  font-weight: ${props => (props.highlight || props.positive || props.negative) ? '500' : 'normal'};
`;

const DifferenceCell = styled(DataCell)`
  &.increase {
    color: var(--error-color);
    &::before {
      content: '+';
    }
  }
  
  &.decrease {
    color: var(--success-color);
  }
  
  font-weight: 500;
`;

const ExpandedRow = styled.tr`
  background-color: rgba(0, 0, 0, 0.02);
`;

const ExpandedContent = styled.td`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const ExpandedTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-color);
  font-size: 0.875rem;
`;

const ExpandedData = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-light);
`;

const DetailValue = styled.div`
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-color);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
`;

const EmptyMessage = styled.p`
  color: var(--text-light);
  font-size: 1rem;
  margin: 0;
`;

const FileOptions = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color);
`;

const FileOptionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const SelectedCount = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
`;

const FileOptionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FileOptionAlternative = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: ${props => props.isSelected ? 'var(--primary-color)' : 'white'};
  color: ${props => props.isSelected ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.isSelected ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 0.25rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'var(--primary-dark)' : 'var(--background-color)'};
  }
`;

const FileCheckbox = styled.input`
  margin-right: 0.5rem;
`;

const FileOptionName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
`;

const FileOptionInfo = styled.span`
  font-size: 0.75rem;
  color: inherit;
  opacity: 0.8;
  margin-left: 0.5rem;
`;

const NoFilesMessage = styled.p`
  color: var(--text-light);
  font-size: 1rem;
  margin: 0;
`;

// New styled components for the updated APDEX format
const RequestsSummary = styled.div`
  border: 1px solid #e0e0e0;
  padding: 1rem;
  border-radius: 6px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PieChartContainer = styled.div`
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const PassRateLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FailRateLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SortIcon = styled(FaSort)`
  font-size: 0.75rem;
  opacity: 0.5;
  margin-left: 0.25rem;
`;

export default TableComparison; 