/**
 * JTL Processor Utility
 * 
 * Processes JTL files (JMeter Test Log) to extract statistics,
 * calculate APDEX scores, and prepare data for visualization
 */

/**
 * Parse JTL data from CSV format into a structured format
 * @param {string} csvData - Raw CSV data from JTL file
 * @returns {Array} - Array of parsed JTL records
 */
export const parseJTLData = (csvData) => {
  // Split by lines and get header row
  const lines = csvData.trim().split('\n');
  const headerRow = lines[0].split(',');
  
  // Define all possible columns in JTL files
  const columns = [
    'timeStamp',
    'elapsed',
    'label',
    'responseCode',
    'responseMessage',
    'threadName',
    'dataType',
    'success',
    'failureMessage',
    'bytes',
    'sentBytes',
    'grpThreads',
    'allThreads',
    'URL',
    'Latency',
    'IdleTime',
    'Connect'
  ];
  
  // Find indices for all columns (will be -1 if column doesn't exist in the file)
  const columnIndices = {};
  columns.forEach(column => {
    columnIndices[column] = headerRow.indexOf(column);
  });
  
  // Parse each data row
  const parsedData = [];
  for (let i = 1; i < lines.length; i++) {
    // Skip empty lines
    if (!lines[i].trim()) continue;
    
    // Handle potential quoted values with commas inside
    let currentLine = lines[i];
    let values = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < currentLine.length; j++) {
      const char = currentLine[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue);
    
    // Create record with all available columns
    const record = {};
    
    // Process each column if it exists in the file
    columns.forEach(column => {
      const index = columnIndices[column];
      if (index !== -1 && index < values.length) {
        let value = values[index].replace(/"/g, '').trim();
        
        // Convert numeric values
        if (['timeStamp', 'elapsed', 'bytes', 'sentBytes', 'grpThreads', 
             'allThreads', 'Latency', 'IdleTime', 'Connect'].includes(column)) {
          value = value === '' ? 0 : parseInt(value, 10);
        }
        
        // Convert boolean values
        if (column === 'success') {
          value = value.toLowerCase() === 'true';
        }
        
        record[column] = value;
      }
    });
    
    parsedData.push(record);
  }
  
  return parsedData;
};

/**
 * Calculate statistics from parsed JTL data
 * @param {Array} parsedData - Array of parsed JTL records
 * @returns {Object} - Statistics including response times, error rates, throughput, etc.
 */
export const calculateStatistics = (parsedData) => {
  if (!parsedData || parsedData.length === 0) {
    return {
      totalSamples: 0,
      failures: 0,
      errorPercentage: 0,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      medianResponseTime: 0,
      percentile90: 0,
      percentile95: 0,
      percentile99: 0,
      throughput: 0,
      receivedKBPerSec: 0,
      sentKBPerSec: 0,
      byLabel: {}
    };
  }
  
  // Overall statistics
  const totalSamples = parsedData.length;
  const failures = parsedData.filter(r => !r.success).length;
  const errorPercentage = (failures / totalSamples) * 100;
  
  // Response time calculations
  const allResponseTimes = parsedData.map(r => r.elapsed).sort((a, b) => a - b);
  const minResponseTime = allResponseTimes[0];
  const maxResponseTime = allResponseTimes[allResponseTimes.length - 1];
  const avgResponseTime = allResponseTimes.reduce((sum, time) => sum + time, 0) / totalSamples;
  
  // Percentile calculations
  const medianResponseTime = calculatePercentile(allResponseTimes, 50);
  const percentile90 = calculatePercentile(allResponseTimes, 90);
  const percentile95 = calculatePercentile(allResponseTimes, 95);
  const percentile99 = calculatePercentile(allResponseTimes, 99);
  
  // Throughput calculations (requests per second)
  const startTime = Math.min(...parsedData.map(r => r.timeStamp));
  const endTime = Math.max(...parsedData.map(r => r.timeStamp));
  const durationSec = (endTime - startTime) / 1000 || 1; // Avoid division by zero
  const throughput = totalSamples / durationSec;
  
  // Bandwidth calculations (KB/sec)
  const totalReceived = parsedData.reduce((sum, r) => sum + (r.bytes || 0), 0);
  const totalSent = parsedData.reduce((sum, r) => sum + (r.sentBytes || 0), 0);
  const receivedKBPerSec = (totalReceived / 1024) / durationSec;
  const sentKBPerSec = (totalSent / 1024) / durationSec;
  
  // Statistics by label/endpoint
  const byLabel = {};
  const labels = [...new Set(parsedData.map(r => r.label))];
  
  labels.forEach(label => {
    const labelData = parsedData.filter(r => r.label === label);
    const labelSamples = labelData.length;
    const labelFailures = labelData.filter(r => !r.success).length;
    const labelErrorPercentage = (labelFailures / labelSamples) * 100;
    
    const labelResponseTimes = labelData.map(r => r.elapsed).sort((a, b) => a - b);
    const labelMinResponseTime = labelResponseTimes[0];
    const labelMaxResponseTime = labelResponseTimes[labelResponseTimes.length - 1];
    const labelAvgResponseTime = labelResponseTimes.reduce((sum, time) => sum + time, 0) / labelSamples;
    
    const labelThroughput = labelSamples / durationSec;
    
    byLabel[label] = {
      count: labelSamples,
      failures: labelFailures,
      errorPercentage: labelErrorPercentage,
      min: labelMinResponseTime,
      max: labelMaxResponseTime,
      average: labelAvgResponseTime,
      median: calculatePercentile(labelResponseTimes, 50),
      percentile90: calculatePercentile(labelResponseTimes, 90),
      percentile95: calculatePercentile(labelResponseTimes, 95),
      percentile99: calculatePercentile(labelResponseTimes, 99),
      throughput: labelThroughput
    };
  });
  
  return {
    totalSamples,
    failures,
    errorPercentage,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    medianResponseTime,
    percentile90,
    percentile95,
    percentile99,
    throughput,
    receivedKBPerSec,
    sentKBPerSec,
    byLabel
  };
};

/**
 * Calculate APDEX scores by endpoint based on toleration and frustration thresholds
 * @param {Array} parsedData - Array of parsed JTL records
 * @param {Object} thresholds - APDEX thresholds { toleration, frustration }
 * @returns {Object} - APDEX scores by endpoint
 */
export const calculateApdexScores = (parsedData, thresholds = { toleration: 500, frustration: 1500 }) => {
  if (!parsedData || parsedData.length === 0) {
    return {};
  }
  
  const apdexScores = {};
  const labels = [...new Set(parsedData.map(r => r.label))];
  
  labels.forEach(label => {
    const labelData = parsedData.filter(r => r.label === label && r.success);
    const totalRequests = labelData.length;
    
    // Count satisfied, tolerated, and frustrated requests
    let satisfied = 0;
    let tolerated = 0;
    let frustrated = 0;
    
    labelData.forEach(record => {
      if (record.elapsed <= thresholds.toleration) {
        satisfied++;
      } else if (record.elapsed <= thresholds.frustration) {
        tolerated++;
      } else {
        frustrated++;
      }
    });
    
    // Calculate APDEX score
    const apdexScore = (satisfied + (tolerated / 2)) / totalRequests;
    
    // Determine performance rating based on score
    let rating;
    if (apdexScore >= 0.94) rating = 'Excellent';
    else if (apdexScore >= 0.85) rating = 'Good';
    else if (apdexScore >= 0.7) rating = 'Fair';
    else if (apdexScore >= 0.5) rating = 'Poor';
    else rating = 'Unacceptable';
    
    apdexScores[label] = {
      satisfied,
      tolerated,
      frustrated,
      score: apdexScore,
      rating
    };
  });
  
  return apdexScores;
};

/**
 * Helper function to calculate a percentile value from a sorted array
 * @param {Array} sortedValues - Array of values sorted in ascending order
 * @param {number} percentile - Percentile to calculate (0-100)
 * @returns {number} - The calculated percentile value
 */
const calculatePercentile = (sortedValues, percentile) => {
  if (!sortedValues || sortedValues.length === 0) return 0;
  
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
};

/**
 * Extract JMeter version from CSV data if available in headers or comments
 * @param {string} csvData - Raw CSV data from JTL file
 * @returns {string} - JMeter version info or null if not found
 */
export const extractJMeterVersion = (csvData) => {
  // Look for JMeter version in headers or comments
  // JMeter files sometimes include version info in comments at the top
  const lines = csvData.trim().split('\n');
  
  // Check the first few lines for version information
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    // Look for version patterns in comments
    if (line.startsWith('#')) {
      const versionMatch = line.match(/JMeter\s+([vV]ersion\s*)?([0-9]+(\.[0-9]+)+(-[a-zA-Z0-9]+)?)/);
      if (versionMatch) {
        return versionMatch[0];
      }
    }
  }
  
  // Parse basic test-plan name that might include version
  const testPlanMatch = csvData.match(/test-plan\s+([vV]ersion\s*)?([0-9]+(\.[0-9]+)+(-[a-zA-Z0-9]+)?)/);
  if (testPlanMatch) {
    return testPlanMatch[0];
  }
  
  return null;
};

/**
 * Process a JTL file for visualization
 * @param {File} file - JTL file object
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise<Object>} - Processed data including raw data, statistics, APDEX scores and visualization data
 */
export const processJTLFile = async (file, progressCallback = () => {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvData = e.target.result;
        progressCallback(20, 'Parsing JTL data...');
        
        // Extract JMeter version if available
        const jmeterVersion = extractJMeterVersion(csvData) || 'Unknown Version';
        
        // Parse raw data
        const rawData = parseJTLData(csvData);
        progressCallback(40, 'Calculating statistics...');
        
        // Calculate statistics
        const statistics = calculateStatistics(rawData);
        progressCallback(60, 'Calculating APDEX scores...');
        
        // Calculate APDEX scores with default thresholds
        const apdexScores = calculateApdexScores(rawData);
        progressCallback(80, 'Preparing visualization data...');
        
        // Prepare data for visualizations
        const visualizationData = prepareVisualizationData(rawData, statistics);
        progressCallback(100, 'Processing complete');
        
        resolve({
          rawData,
          statistics,
          apdexScores,
          visualizationData,
          jmeterVersion
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Prepare data for visualizations from raw data and statistics
 * @param {Array} rawData - Array of parsed JTL records
 * @param {Object} statistics - Calculated statistics
 * @returns {Object} - Data formatted for chart visualization
 */
const prepareVisualizationData = (rawData, statistics) => {
  // Extract time series for response times
  const timeLabels = [];
  const responseTimeSeries = [];
  const throughputSeries = [];
  const errorRateSeries = [];
  
  // Group data by time intervals (every 5 seconds)
  const interval = 5000; // 5 seconds
  const timeGroups = {};
  
  rawData.forEach(record => {
    const timeKey = Math.floor(record.timeStamp / interval) * interval;
    if (!timeGroups[timeKey]) {
      timeGroups[timeKey] = {
        samples: [],
        errors: 0
      };
    }
    
    timeGroups[timeKey].samples.push(record);
    if (!record.success) {
      timeGroups[timeKey].errors++;
    }
  });
  
  // Convert grouped data to series
  Object.keys(timeGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(timeKey => {
    const group = timeGroups[timeKey];
    const timestamp = new Date(parseInt(timeKey)).toISOString().substr(11, 8); // HH:MM:SS
    
    timeLabels.push(timestamp);
    
    // Calculate average response time for this interval
    const avgResponseTime = group.samples.reduce((sum, r) => sum + r.elapsed, 0) / group.samples.length;
    responseTimeSeries.push(avgResponseTime);
    
    // Calculate throughput for this interval (requests per second)
    const throughput = group.samples.length / (interval / 1000);
    throughputSeries.push(throughput);
    
    // Calculate error rate for this interval
    const errorRate = (group.errors / group.samples.length) * 100;
    errorRateSeries.push(errorRate);
  });
  
  return {
    summary: {
      totalRequests: statistics.totalSamples,
      avgResponseTime: statistics.avgResponseTime,
      errorRate: statistics.errorPercentage,
      throughput: statistics.throughput
    },
    timeLabels,
    datasets: [
      {
        label: 'Response Time (ms)',
        values: responseTimeSeries
      },
      {
        label: 'Throughput (req/sec)',
        values: throughputSeries
      },
      {
        label: 'Error Rate (%)',
        values: errorRateSeries
      }
    ]
  };
};

export default {
  parseJTLData,
  calculateStatistics,
  calculateApdexScores,
  processJTLFile
}; 