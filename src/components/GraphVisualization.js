import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { FaDownload, FaExpand, FaCompress, FaChartLine, FaChartBar, FaSync, FaChartPie, FaChartArea, FaExclamationTriangle } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

// Color palette for metrics
const COLORS = {
  responseTime: { 
    border: 'rgba(37, 99, 235, 1)', 
    background: 'rgba(37, 99, 235, 0.2)' 
  },
  throughput: { 
    border: 'rgba(5, 150, 105, 1)', 
    background: 'rgba(5, 150, 105, 0.2)' 
  },
  errorRate: { 
    border: 'rgba(239, 68, 68, 1)', 
    background: 'rgba(239, 68, 68, 0.2)' 
  },
  latency: { 
    border: 'rgba(245, 158, 11, 1)', 
    background: 'rgba(245, 158, 11, 0.2)' 
  },
  bandwidth: { 
    border: 'rgba(107, 114, 128, 1)', 
    background: 'rgba(107, 114, 128, 0.2)' 
  },
  apdex: { 
    border: 'rgba(139, 92, 246, 1)', 
    background: 'rgba(139, 92, 246, 0.2)' 
  },
  success: {
    border: 'rgba(16, 185, 129, 1)',
    background: 'rgba(16, 185, 129, 0.2)'
  },
  failure: {
    border: 'rgba(239, 68, 68, 1)',
    background: 'rgba(239, 68, 68, 0.2)'
  }
};

const GraphVisualization = ({ data, dataType = 'statistics', files }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [graphType, setGraphType] = useState('line');
  const [selectedGraph, setSelectedGraph] = useState('responseTime');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const chartContainerRef = useRef(null);
  
  // Set initial selected files based on available files
  useEffect(() => {
    if (files && files.length > 0 && selectedFiles.length === 0) {
      // Select the first file by default
      setSelectedFiles([files[0].id]);
    }
  }, [files, selectedFiles]);
  
  // Set initial graph type and selected graph based on the data type
  useEffect(() => {
    if (dataType === 'apdex') {
      setSelectedGraph('apdexScores');
      setGraphType('bar');
    } else if (dataType === 'jtl') {
      setSelectedGraph('responseTime');
      setGraphType('line');
    } else {
      // statistics
      setSelectedGraph('responseTime');
      setGraphType('line');
    }
  }, [dataType]);
  
  // Get graph title based on data type and selected graph
  const getGraphTitle = () => {
    if (dataType === 'jtl') {
      return 'JTL Data Visualization';
    } else if (dataType === 'apdex') {
      return 'APDEX Score Visualization';
    } else if (dataType === 'statistics') {
      switch (selectedGraph) {
            case 'responseTime':
          return 'Response Time Over Time';
            case 'throughput':
          return 'Throughput Over Time';
            case 'errorRate':
          return 'Error Rate Over Time';
        case 'latencyDistribution':
          return 'Latency Distribution';
        case 'successFailure':
          return 'Success vs Failure Rate';
            default:
          return 'Performance Statistics Visualization';
      }
    }
    return 'Performance Visualization';
  };
  
  // Convert incoming data to chart format based on data type and selected graph
  useEffect(() => {
    if (!data) return;
    
    setIsLoading(true);
    
    try {
      // Set chart type based on data type and selected graph
      if (dataType === 'apdex') {
        if (selectedGraph === 'apdexRating') {
          setGraphType('pie'); // APDEX rating distribution as a pie chart
        } else {
          setGraphType('bar'); // APDEX scores as a bar chart
        }
      } else if (selectedGraph === 'latencyDistribution') {
        setGraphType('bar'); // Histograms are bar charts
      } else if (selectedGraph === 'successFailure') {
        setGraphType('pie'); // Success/Failure is a pie chart
      }
      
      let formattedData = { labels: [], datasets: [] };
      
      // Create mock/sample data for demonstration
      if (dataType === 'statistics') {
        if (selectedGraph === 'responseTime') {
          // Response Time Over Time
          formattedData.labels = Array.from({ length: 20 }, (_, i) => `${i+1}m`);
          formattedData.datasets = [
            {
              label: 'Average Response Time (ms)',
              data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 500) + 200),
              borderColor: COLORS.responseTime.border,
              backgroundColor: COLORS.responseTime.background,
          borderWidth: 2,
              fill: false,
          tension: 0.4
            },
            {
              label: '90th Percentile (ms)',
              data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 1000) + 500),
              borderColor: COLORS.latency.border,
              backgroundColor: COLORS.latency.background,
              borderWidth: 2,
              fill: false,
              tension: 0.4
            }
          ];
        } else if (selectedGraph === 'throughput') {
          // Throughput Over Time
          formattedData.labels = Array.from({ length: 20 }, (_, i) => `${i+1}m`);
          formattedData.datasets = [
            {
              label: 'Transactions/sec',
              data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 50) + 10),
              borderColor: COLORS.throughput.border,
              backgroundColor: COLORS.throughput.background,
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Received KB/sec',
              data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 500) + 100),
              borderColor: COLORS.bandwidth.border,
              backgroundColor: COLORS.bandwidth.background,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              yAxisID: 'y1'
            }
          ];
        } else if (selectedGraph === 'errorRate') {
          // Error Rate Over Time
          formattedData.labels = Array.from({ length: 20 }, (_, i) => `${i+1}m`);
          formattedData.datasets = [
            {
              label: 'Error Rate (%)',
              data: Array.from({ length: 20 }, () => Math.random() * 10),
              borderColor: COLORS.errorRate.border,
              backgroundColor: COLORS.errorRate.background,
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }
          ];
        } else if (selectedGraph === 'latencyDistribution') {
          // Latency Distribution (Histogram)
          formattedData.labels = ['0-100', '101-200', '201-500', '501-1000', '1001-2000', '2000+'];
          formattedData.datasets = [
            {
              label: 'Number of Requests',
              data: [150, 350, 240, 120, 40, 15],
              backgroundColor: COLORS.responseTime.background,
              borderColor: COLORS.responseTime.border,
              borderWidth: 1
            }
          ];
        } else if (selectedGraph === 'successFailure') {
          // Success vs Failure Rate (Pie Chart)
          formattedData.labels = ['Successful', 'Failed'];
          formattedData.datasets = [
            {
              data: [data.summary?.totalRequests - data.summary?.failures || 980, data.summary?.failures || 20],
              backgroundColor: [COLORS.success.background, COLORS.failure.background],
              borderColor: [COLORS.success.border, COLORS.failure.border],
              borderWidth: 1
            }
          ];
        }
      } else if (dataType === 'apdex') {
        if (selectedGraph === 'apdexScores') {
          // APDEX Scores as bar chart
          // Use real data from the selected files if available
          if (files && files.length > 0 && selectedFiles.length > 0) {
            // Get the first selected file's APDEX data
            const selectedFile = files.find(file => file.id === selectedFiles[0]);
            
            if (selectedFile && selectedFile.processedData && selectedFile.processedData.apdexScores) {
              const apdexData = selectedFile.processedData.apdexScores;
              const endpoints = Object.keys(apdexData).filter(endpoint => endpoint !== 'Total');
              const scores = endpoints.map(endpoint => apdexData[endpoint]?.score || 0);
              
              formattedData.labels = endpoints;
              formattedData.datasets = [
                {
                  label: 'APDEX Scores',
                  data: scores,
                  backgroundColor: endpoints.map(endpoint => {
                    const score = apdexData[endpoint]?.score || 0;
                    if (score >= 0.94) return 'rgba(16, 185, 129, 0.7)'; // Excellent
                    if (score >= 0.85) return 'rgba(59, 130, 246, 0.7)'; // Good
                    if (score >= 0.7) return 'rgba(245, 158, 11, 0.7)';  // Fair
                    if (score >= 0.5) return 'rgba(249, 115, 22, 0.7)';  // Poor
                    return 'rgba(239, 68, 68, 0.7)';                     // Unacceptable
                  }),
                  borderColor: endpoints.map(endpoint => {
                    const score = apdexData[endpoint]?.score || 0;
                    if (score >= 0.94) return 'rgba(16, 185, 129, 1)'; // Excellent
                    if (score >= 0.85) return 'rgba(59, 130, 246, 1)'; // Good
                    if (score >= 0.7) return 'rgba(245, 158, 11, 1)';  // Fair
                    if (score >= 0.5) return 'rgba(249, 115, 22, 1)';  // Poor
                    return 'rgba(239, 68, 68, 1)';                     // Unacceptable
                  }),
                  borderWidth: 1,
                }
              ];
            } else {
              // Sample data if no real data is available in the selected file
              formattedData.labels = ['Total', 'Login', 'Search', 'Checkout', 'Product Page', 'Home'];
              formattedData.datasets = [
                {
                  label: 'APDEX Scores',
                  data: [0.89, 0.95, 0.82, 0.76, 0.91, 0.88],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.7)', // Good - Total
                    'rgba(16, 185, 129, 0.7)', // Excellent - Login
                    'rgba(59, 130, 246, 0.7)', // Good - Search
                    'rgba(245, 158, 11, 0.7)', // Fair - Checkout
                    'rgba(59, 130, 246, 0.7)', // Good - Product
                    'rgba(59, 130, 246, 0.7)', // Good - Home
                  ],
                  borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(59, 130, 246, 1)',
                  ],
                  borderWidth: 1,
                }
              ];
            }
          } else {
            // Sample data if no files are selected
            formattedData.labels = ['Total', 'Login', 'Search', 'Checkout', 'Product Page', 'Home'];
            formattedData.datasets = [
              {
                label: 'APDEX Scores',
                data: [0.89, 0.95, 0.82, 0.76, 0.91, 0.88],
                backgroundColor: [
                  'rgba(59, 130, 246, 0.7)', // Good - Total
                  'rgba(16, 185, 129, 0.7)', // Excellent - Login
                  'rgba(59, 130, 246, 0.7)', // Good - Search
                  'rgba(245, 158, 11, 0.7)', // Fair - Checkout
                  'rgba(59, 130, 246, 0.7)', // Good - Product
                  'rgba(59, 130, 246, 0.7)', // Good - Home
                ],
                borderColor: [
                  'rgba(59, 130, 246, 1)',
                  'rgba(16, 185, 129, 1)',
                  'rgba(59, 130, 246, 1)',
                  'rgba(245, 158, 11, 1)',
                  'rgba(59, 130, 246, 1)',
                  'rgba(59, 130, 246, 1)',
                ],
                borderWidth: 1,
              }
            ];
          }
        } else if (selectedGraph === 'apdexRating') {
          // APDEX Rating distribution as pie chart
          if (files && files.length > 0 && selectedFiles.length > 0) {
            // Get the first selected file's APDEX data
            const selectedFile = files.find(file => file.id === selectedFiles[0]);
            
            if (selectedFile && selectedFile.processedData && selectedFile.processedData.apdexScores) {
              const apdexData = selectedFile.processedData.apdexScores;
              
              // Calculate the distribution of ratings
              const ratingCounts = {
                excellent: 0, // >0.94
                good: 0,      // 0.85-0.94
                fair: 0,      // 0.7-0.84
                poor: 0,      // 0.5-0.69
                unacceptable: 0 // <0.5
              };
              
              Object.keys(apdexData).forEach(endpoint => {
                const score = apdexData[endpoint]?.score || 0;
                
                if (score >= 0.94) ratingCounts.excellent++;
                else if (score >= 0.85) ratingCounts.good++;
                else if (score >= 0.7) ratingCounts.fair++;
                else if (score >= 0.5) ratingCounts.poor++;
                else ratingCounts.unacceptable++;
              });
              
              formattedData.labels = ['Excellent (>0.94)', 'Good (0.85-0.94)', 'Fair (0.7-0.84)', 'Poor (0.5-0.69)', 'Unacceptable (<0.5)'];
              formattedData.datasets = [
                {
                  data: [
                    ratingCounts.excellent,
                    ratingCounts.good,
                    ratingCounts.fair,
                    ratingCounts.poor,
                    ratingCounts.unacceptable
                  ],
                  backgroundColor: [
                    'rgba(16, 185, 129, 0.7)', // Green for excellent
                    'rgba(59, 130, 246, 0.7)', // Blue for good
                    'rgba(245, 158, 11, 0.7)', // Yellow for fair
                    'rgba(249, 115, 22, 0.7)', // Orange for poor
                    'rgba(239, 68, 68, 0.7)'   // Red for unacceptable
                  ],
                  borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(239, 68, 68, 1)'
                  ],
                  borderWidth: 1
                }
              ];
            } else {
              // Sample data
              formattedData.labels = ['Excellent (>0.94)', 'Good (0.85-0.94)', 'Fair (0.7-0.84)', 'Poor (0.5-0.69)', 'Unacceptable (<0.5)'];
              formattedData.datasets = [
                {
                  data: [2, 3, 1, 0, 1], // Example count of endpoints in each rating
                  backgroundColor: [
                    'rgba(16, 185, 129, 0.7)', // Green for excellent
                    'rgba(59, 130, 246, 0.7)', // Blue for good
                    'rgba(245, 158, 11, 0.7)', // Yellow for fair
                    'rgba(249, 115, 22, 0.7)', // Orange for poor
                    'rgba(239, 68, 68, 0.7)'   // Red for unacceptable
                  ],
                  borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(239, 68, 68, 1)'
                  ],
                  borderWidth: 1
                }
              ];
            }
          } else {
            // Sample data if no files are selected
            formattedData.labels = ['Excellent (>0.94)', 'Good (0.85-0.94)', 'Fair (0.7-0.84)', 'Poor (0.5-0.69)', 'Unacceptable (<0.5)'];
            formattedData.datasets = [
              {
                data: [2, 3, 1, 0, 1], // Example count of endpoints in each rating
                backgroundColor: [
                  'rgba(16, 185, 129, 0.7)', // Green for excellent
                  'rgba(59, 130, 246, 0.7)', // Blue for good
                  'rgba(245, 158, 11, 0.7)', // Yellow for fair
                  'rgba(249, 115, 22, 0.7)', // Orange for poor
                  'rgba(239, 68, 68, 0.7)'   // Red for unacceptable
                ],
                borderColor: [
                  'rgba(16, 185, 129, 1)',
                  'rgba(59, 130, 246, 1)',
                  'rgba(245, 158, 11, 1)',
                  'rgba(249, 115, 22, 1)',
                  'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 1
              }
            ];
          }
        }
      } else if (dataType === 'jtl') {
        // JTL Visualization
        if (selectedGraph === 'responseTime') {
          // Use real JTL data from the selected files if available
          if (files && files.length > 0 && selectedFiles.length > 0) {
            // Get the selected files with their raw data
            const selectedData = files
              .filter(file => selectedFiles.includes(file.id))
              .map(file => ({
                name: file.name,
                id: file.id,
                data: file.processedData?.rawData || []
              }));
            
            if (selectedData.length > 0 && selectedData.some(file => file.data && file.data.length > 0)) {
              // Create datasets for each selected file
              const datasets = selectedData.map((file, fileIndex) => {
                // Group data by label
                const dataByLabel = {};
                file.data.forEach(row => {
                  if (!dataByLabel[row.label]) {
                    dataByLabel[row.label] = [];
                  }
                  dataByLabel[row.label].push(row);
                });
                
                // Create datasets for each label
                const labelDatasets = Object.keys(dataByLabel).map((label, labelIndex) => {
                  const data = dataByLabel[label].map(row => row.elapsed);
      return {
                    label: `${file.name} - ${label}`,
                    data: data,
                    borderColor: Object.values(COLORS)[(fileIndex + labelIndex) % Object.values(COLORS).length].border,
                    backgroundColor: Object.values(COLORS)[(fileIndex + labelIndex) % Object.values(COLORS).length].background,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5
                  };
                });
                
                return labelDatasets;
              }).flat();
              
              // Create labels for the x-axis (use numeric indices)
              const maxSamples = Math.max(...datasets.map(ds => ds.data.length));
              formattedData.labels = Array.from({ length: maxSamples }, (_, i) => `Sample ${i+1}`);
              formattedData.datasets = datasets;
            } else {
              // Fall back to sample data if no real data is available
              formattedData.labels = Array.from({ length: 20 }, (_, i) => `Sample ${i+1}`);
              formattedData.datasets = [
                {
                  label: 'Sample Response Time',
                  data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 500) + 100),
                  borderColor: COLORS.responseTime.border,
                  backgroundColor: COLORS.responseTime.background,
                  borderWidth: 2,
                  fill: false,
                  tension: 0.4
                }
              ];
            }
          } else {
            // Fall back to data from the data prop if no files are selected
            formattedData.labels = Array.from({ length: data.datasets?.[0]?.values?.length || 20 }, (_, i) => `Sample ${i+1}`);
            formattedData.datasets = data.datasets?.map((dataset, index) => ({
              label: dataset.label || `Test ${index+1}`,
              data: dataset.values || Array.from({ length: 20 }, () => Math.floor(Math.random() * 500) + 100),
              borderColor: Object.values(COLORS)[index % Object.values(COLORS).length].border,
              backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length].background,
              borderWidth: 2,
              fill: false,
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 5
            })) || [
              {
                label: 'Sample Response Time',
                data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 500) + 100),
                borderColor: COLORS.responseTime.border,
                backgroundColor: COLORS.responseTime.background,
                borderWidth: 2,
                fill: false,
                tension: 0.4
              }
            ];
          }
        } else if (selectedGraph === 'throughput') {
          // Calculate throughput from raw data if available
          if (files && files.length > 0 && selectedFiles.length > 0) {
            // Get the selected files with their raw data
            const selectedData = files
              .filter(file => selectedFiles.includes(file.id))
              .map(file => ({
                name: file.name,
                id: file.id,
                data: file.processedData?.rawData || []
              }));
            
            if (selectedData.length > 0 && selectedData.some(file => file.data && file.data.length > 0)) {
              // Create datasets for throughput calculations
              const datasets = selectedData.map((file, fileIndex) => {
                // Group data by label
                const dataByLabel = {};
                file.data.forEach(row => {
                  if (!dataByLabel[row.label]) {
                    dataByLabel[row.label] = [];
                  }
                  dataByLabel[row.label].push(row);
                });
                
                // Create datasets for each label
                return Object.keys(dataByLabel).map((label, labelIndex) => {
                  const labelData = dataByLabel[label];
                  
                  // Calculate throughput (hits per second)
                  // Sort by timestamp
                  labelData.sort((a, b) => a.timeStamp - b.timeStamp);
                  
                  // Group by time intervals (1 second)
                  const intervalData = {};
                  const intervalSize = 1000; // 1 second in ms
                  
                  labelData.forEach(row => {
                    const intervalKey = Math.floor(row.timeStamp / intervalSize) * intervalSize;
                    if (!intervalData[intervalKey]) {
                      intervalData[intervalKey] = 0;
                    }
                    intervalData[intervalKey]++;
                  });
                  
                  // Convert to array of throughput values
                  const throughputData = Object.values(intervalData);
                  
                  return {
                    label: `${file.name} - ${label}`,
                    data: throughputData,
                    borderColor: Object.values(COLORS)[(fileIndex + labelIndex) % Object.values(COLORS).length].border,
                    backgroundColor: Object.values(COLORS)[(fileIndex + labelIndex) % Object.values(COLORS).length].background,
                    borderWidth: 2,
                    fill: true
                  };
                });
              }).flat();
              
              // Create labels for the x-axis (seconds)
              const maxSamples = Math.max(...datasets.map(ds => ds.data.length));
              formattedData.labels = Array.from({ length: maxSamples }, (_, i) => `${i+1}s`);
              formattedData.datasets = datasets;
            } else {
              // Fall back to sample data
              formattedData.labels = Array.from({ length: 20 }, (_, i) => `${i+1}s`);
              formattedData.datasets = [
                {
                  label: 'Requests/sec',
                  data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 50) + 10),
                  borderColor: COLORS.throughput.border,
                  backgroundColor: COLORS.throughput.background,
                  borderWidth: 2,
                  fill: true
                }
              ];
            }
          } else {
            // Fall back to sample data
            formattedData.labels = Array.from({ length: 20 }, (_, i) => `${i+1}s`);
            formattedData.datasets = [
              {
                label: 'Requests/sec',
                data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 50) + 10),
                borderColor: COLORS.throughput.border,
                backgroundColor: COLORS.throughput.background,
                borderWidth: 2,
                fill: true
              }
            ];
          }
        } else if (selectedGraph === 'successFailure') {
          // Success/Failure ratio for JTL data
          if (files && files.length > 0 && selectedFiles.length > 0) {
            // Get the selected files with their raw data
            const selectedData = files
              .filter(file => selectedFiles.includes(file.id))
              .map(file => ({
                name: file.name,
                id: file.id,
                data: file.processedData?.rawData || []
              }));
            
            if (selectedData.length > 0 && selectedData.some(file => file.data && file.data.length > 0)) {
              // Combine all data to calculate success/fail rates
              let combinedData = [];
              selectedData.forEach(file => {
                combinedData = [
                  ...combinedData,
                  ...(file.data || [])
                ];
              });
              
              const totalSamples = combinedData.length;
              const successCount = combinedData.filter(row => row.success).length;
              const failureCount = totalSamples - successCount;
              
              formattedData.labels = ['Successful', 'Failed'];
              formattedData.datasets = [
                {
                  data: [successCount, failureCount],
                  backgroundColor: [COLORS.success.background, COLORS.failure.background],
                  borderColor: [COLORS.success.border, COLORS.failure.border],
                  borderWidth: 1
                }
              ];
            } else {
              // Fall back to sample data
              const successCount = data.summary?.totalRequests - data.summary?.failures || 980;
              const failureCount = data.summary?.failures || 20;
              
              formattedData.labels = ['Successful', 'Failed'];
              formattedData.datasets = [
                {
                  data: [successCount, failureCount],
                  backgroundColor: [COLORS.success.background, COLORS.failure.background],
                  borderColor: [COLORS.success.border, COLORS.failure.border],
                  borderWidth: 1
                }
              ];
            }
          } else {
            // Fall back to sample data
            const successCount = data.summary?.totalRequests - data.summary?.failures || 980;
            const failureCount = data.summary?.failures || 20;
            
            formattedData.labels = ['Successful', 'Failed'];
            formattedData.datasets = [
              {
                data: [successCount, failureCount],
                backgroundColor: [COLORS.success.background, COLORS.failure.background],
                borderColor: [COLORS.success.border, COLORS.failure.border],
                borderWidth: 1
              }
            ];
          }
        }
      }
      
      setChartData(formattedData);
    } catch (error) {
      console.error('Error processing chart data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data, graphType, dataType, selectedGraph, files, selectedFiles]);
  
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };
  
  const downloadChart = () => {
    const canvas = document.querySelector('#performance-chart');
    if (!canvas) return;
    
    try {
    const link = document.createElement('a');
      link.download = `jmeter-${dataType}-${selectedGraph}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };
  
  const toggleGraphType = () => {
    // Don't allow changing graph type for APDEX (always bar chart)
    // or for specific visualizations with fixed chart types
    if (dataType === 'apdex' || 
        selectedGraph === 'latencyDistribution' || 
        selectedGraph === 'successFailure') return;
        
    setGraphType(prev => prev === 'line' ? 'bar' : 'line');
  };
  
  // Get chart options based on data type and selected graph
  const getChartOptions = () => {
    const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
      animation: {
        duration: 800
      },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        boxWidth: 10,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw.toFixed(2);
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
    };
    
    // Customize options based on data type and selected graph
    if (dataType === 'statistics') {
      if (selectedGraph === 'throughput') {
        // For throughput, setup dual y-axes for requests/sec and KB/sec
        baseOptions.scales.y1 = {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: 'KB/sec'
          }
        };
        
        baseOptions.scales.y.title = {
          display: true,
          text: 'Transactions/sec'
        };
      } else if (selectedGraph === 'responseTime') {
        baseOptions.scales.y.title = {
          display: true,
          text: 'Response Time (ms)'
        };
      } else if (selectedGraph === 'errorRate') {
        baseOptions.scales.y.title = {
          display: true,
          text: 'Error Rate (%)'
        };
        
        // For error rate, add a warning threshold at 5%
        baseOptions.scales.y.grid.color = (context) => {
          if (context.tick.value === 5) {
            return 'rgba(239, 68, 68, 0.5)';
          }
          return 'rgba(0, 0, 0, 0.05)';
        };
      } else if (selectedGraph === 'latencyDistribution') {
        // For latency distribution, customize x-axis label
        baseOptions.scales.x.title = {
          display: true,
          text: 'Response Time Ranges (ms)'
        };
        
        baseOptions.scales.y.title = {
          display: true,
          text: 'Number of Requests'
        };
      } else if (selectedGraph === 'successFailure') {
        // For pie chart, remove scales
        delete baseOptions.scales;
        
        // Customize tooltip for pie chart
        baseOptions.plugins.tooltip.callbacks.label = function(context) {
          const label = context.label || '';
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        };
      }
    } else if (dataType === 'apdex') {
      if (selectedGraph === 'apdexRating') {
        // For APDEX rating distribution (pie chart), remove scales
        delete baseOptions.scales;
        
        // Custom tooltip for APDEX rating pie chart
        baseOptions.plugins.tooltip.callbacks.label = function(context) {
          const label = context.label || '';
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} endpoints (${percentage}%)`;
        };
        
        // Add legend title
        baseOptions.plugins.legend.title = {
          display: true,
          text: 'APDEX Rating Distribution',
          font: {
            size: 14,
            weight: 'bold'
          }
        };
      } else {
        // For APDEX scores (bar chart)
        baseOptions.scales.y.max = 1;
        baseOptions.scales.y.title = {
          display: true,
          text: 'APDEX Score'
        };
        
        // Add horizontal lines for APDEX ratings with labels
        baseOptions.scales.y.grid.color = (context) => {
          if (context.tick.value === 0.5 || context.tick.value === 0.7 || 
              context.tick.value === 0.85 || context.tick.value === 0.94) {
            return 'rgba(0, 0, 0, 0.2)';
          }
          return 'rgba(0, 0, 0, 0.05)';
        };
        
        // Custom tooltip for APDEX to show rating
        baseOptions.plugins.tooltip.callbacks.label = function(context) {
          const value = context.raw.toFixed(3);
          let rating = 'Unacceptable';
          let ratingColor = 'rgba(239, 68, 68, 1)';
          
          if (value >= 0.94) {
            rating = 'Excellent';
            ratingColor = 'rgba(16, 185, 129, 1)';
          } else if (value >= 0.85) {
            rating = 'Good';
            ratingColor = 'rgba(59, 130, 246, 1)';
          } else if (value >= 0.7) {
            rating = 'Fair';
            ratingColor = 'rgba(245, 158, 11, 1)';
          } else if (value >= 0.5) {
            rating = 'Poor';
            ratingColor = 'rgba(249, 115, 22, 1)';
          }
          
          return [
            `APDEX: ${value}`,
            `Rating: ${rating}`
          ];
        };
        
        // Add annotations to show threshold lines with labels
        baseOptions.plugins.annotation = {
          annotations: {
            unacceptableLine: {
              type: 'line',
              yMin: 0.5,
              yMax: 0.5,
              borderColor: 'rgba(249, 115, 22, 0.7)',
              borderWidth: 1,
              borderDash: [5, 5],
              label: {
                content: 'Poor (0.5)',
                display: true,
                position: 'right',
                backgroundColor: 'rgba(249, 115, 22, 0.7)',
                font: {
                  size: 10
                }
              }
            },
            fairLine: {
              type: 'line',
              yMin: 0.7,
              yMax: 0.7,
              borderColor: 'rgba(245, 158, 11, 0.7)',
              borderWidth: 1,
              borderDash: [5, 5],
              label: {
                content: 'Fair (0.7)',
                display: true,
                position: 'right',
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                font: {
                  size: 10
                }
              }
            },
            goodLine: {
              type: 'line',
              yMin: 0.85,
              yMax: 0.85,
              borderColor: 'rgba(59, 130, 246, 0.7)',
              borderWidth: 1,
              borderDash: [5, 5],
              label: {
                content: 'Good (0.85)',
                display: true,
                position: 'right',
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                font: {
                  size: 10
                }
              }
            },
            excellentLine: {
              type: 'line',
              yMin: 0.94,
              yMax: 0.94,
              borderColor: 'rgba(16, 185, 129, 0.7)',
              borderWidth: 1,
              borderDash: [5, 5],
              label: {
                content: 'Excellent (0.94)',
                display: true,
                position: 'right',
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                font: {
                  size: 10
                }
              }
            }
          }
        };
      }
    } else if (dataType === 'jtl') {
      if (selectedGraph === 'responseTime') {
        baseOptions.scales.y.title = {
          display: true,
          text: 'Response Time (ms)'
        };
      } else if (selectedGraph === 'throughput') {
        baseOptions.scales.y.title = {
          display: true,
          text: 'Requests/second'
        };
      } else if (selectedGraph === 'successFailure') {
        // For success/failure pie chart, remove scales
        delete baseOptions.scales;
        
        // Customize tooltip for pie chart
        baseOptions.plugins.tooltip.callbacks.label = function(context) {
          const label = context.label || '';
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        };
      }
    }
    
    return baseOptions;
  };
  
  // Check if graph type is selectable for current data view
  const isGraphTypeSelectable = () => {
    return !(dataType === 'apdex' || 
             selectedGraph === 'latencyDistribution' || 
             selectedGraph === 'successFailure');
  };

  const renderEmptyState = () => (
    <EmptyState>
      <EmptyStateIcon>
        {graphType === 'bar' ? <FaChartBar size={48} /> : 
         graphType === 'pie' ? <FaChartPie size={48} /> : 
         <FaChartLine size={48} />}
      </EmptyStateIcon>
      <EmptyStateTitle>No Data to Visualize</EmptyStateTitle>
      <EmptyStateText>
        Upload JMeter result files to begin analysis
      </EmptyStateText>
    </EmptyState>
  );
  
  // Render tab options for switching between graph types
  const renderGraphTabs = () => {
    // Different tab options based on data type
    if (dataType === 'jtl') {
  return (
        <GraphTabs>
          <GraphTab 
            active={selectedGraph === 'responseTime'} 
            onClick={() => setSelectedGraph('responseTime')}
          >
            <FaChartLine /> Response Time
          </GraphTab>
          <GraphTab 
            active={selectedGraph === 'throughput'} 
            onClick={() => setSelectedGraph('throughput')}
          >
            <FaChartBar /> Throughput
          </GraphTab>
          <GraphTab 
            active={selectedGraph === 'successFailure'} 
            onClick={() => setSelectedGraph('successFailure')}
          >
            <FaChartPie /> Success/Failure
          </GraphTab>
        </GraphTabs>
      );
    } else if (dataType === 'apdex') {
      return (
        <GraphTabs>
          <GraphTab 
            active={selectedGraph === 'apdexScores'} 
            onClick={() => setSelectedGraph('apdexScores')}
          >
            <FaChartBar /> APDEX Scores
          </GraphTab>
          <GraphTab 
            active={selectedGraph === 'apdexRating'} 
            onClick={() => setSelectedGraph('apdexRating')}
          >
            <FaChartPie /> APDEX Rating Distribution
          </GraphTab>
        </GraphTabs>
      );
    } else {
      // Default tabs for statistics view
      return (
        <GraphTabs>
          <GraphTab 
            active={selectedGraph === 'responseTime'} 
            onClick={() => setSelectedGraph('responseTime')}
          >
            <FaChartLine /> Response Time
          </GraphTab>
          <GraphTab 
            active={selectedGraph === 'throughput'} 
            onClick={() => setSelectedGraph('throughput')}
          >
            <FaChartBar /> Throughput
          </GraphTab>
          <GraphTab 
            active={selectedGraph === 'errorRate'} 
            onClick={() => setSelectedGraph('errorRate')}
          >
            <FaExclamationTriangle /> Error Rate
          </GraphTab>
          <GraphTab 
            active={selectedGraph === 'latencyDistribution'} 
            onClick={() => setSelectedGraph('latencyDistribution')}
          >
            <FaChartArea /> Latency Distribution
          </GraphTab>
          <GraphTab 
            active={selectedGraph === 'successFailure'} 
            onClick={() => setSelectedGraph('successFailure')}
          >
            <FaChartPie /> Success/Failure
          </GraphTab>
        </GraphTabs>
      );
    }
  };
  
  // Render the appropriate chart type
  const renderChart = () => {
    if (chartData.datasets.length === 0) {
      return renderEmptyState();
    }
    
    if (graphType === 'bar' || selectedGraph === 'latencyDistribution') {
      return (
        <Bar 
          id="performance-chart"
          data={chartData} 
          options={getChartOptions()} 
        />
      );
    } else if (graphType === 'pie' || selectedGraph === 'successFailure') {
      return (
        <Pie 
          id="performance-chart"
          data={chartData} 
          options={getChartOptions()} 
        />
      );
    } else {
      return (
        <Line 
          id="performance-chart"
          data={chartData} 
          options={getChartOptions()} 
        />
      );
    }
  };
  
  return (
    <GraphContainer 
      isZoomed={isZoomed} 
      ref={chartContainerRef}
    >
      <GraphHeader>
        <GraphTitle>{getGraphTitle()}</GraphTitle>
        
        <GraphControls>
          <RefreshButton 
            onClick={() => setIsLoading(true)}
            title="Refresh Data"
            disabled={isLoading}
          >
            <FaSync className={isLoading ? 'spinner' : ''} />
          </RefreshButton>
          
          {isGraphTypeSelectable() && (
          <GraphTypeToggle>
            <GraphTypeButton 
              active={graphType === 'line'} 
              title="Line Chart"
                onClick={toggleGraphType}
                disabled={graphType === 'line'}
            >
              <FaChartLine />
            </GraphTypeButton>
            <GraphTypeButton 
              active={graphType === 'bar'} 
              title="Bar Chart"
                onClick={toggleGraphType}
                disabled={graphType === 'bar'}
            >
              <FaChartBar />
            </GraphTypeButton>
          </GraphTypeToggle>
          )}
          
          <GraphControlButton 
            title={isZoomed ? 'Exit Fullscreen' : 'Fullscreen'}
            onClick={toggleZoom}
          >
            {isZoomed ? <FaCompress /> : <FaExpand />}
          </GraphControlButton>
          
          <GraphControlButton 
            title="Download Chart" 
            onClick={downloadChart}
            disabled={chartData.datasets.length === 0}
          >
            <FaDownload />
          </GraphControlButton>
        </GraphControls>
      </GraphHeader>
      
      {renderGraphTabs()}
      
      <ChartContainer>
        {renderChart()}
      </ChartContainer>
      
      <TableViewHint>
        Need more details? Switch to <TableViewLink>Table View</TableViewLink> using the toggle in the header.
      </TableViewHint>
    </GraphContainer>
  );
};

// Styled components
const GraphContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
  padding: 1rem;
  margin: 1rem;
  flex: 1;
  overflow: hidden;
  position: ${props => props.isZoomed ? 'fixed' : 'relative'};
  top: ${props => props.isZoomed ? '0' : 'auto'};
  left: ${props => props.isZoomed ? '0' : 'auto'};
  right: ${props => props.isZoomed ? '0' : 'auto'};
  bottom: ${props => props.isZoomed ? '0' : 'auto'};
  z-index: ${props => props.isZoomed ? '9999' : '1'};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    margin: 0.5rem;
    padding: 0.75rem;
  }
`;

const GraphHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const GraphTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
`;

const GraphControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const GraphTypeToggle = styled.div`
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  overflow: hidden;
`;

const GraphTypeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: none;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  opacity: ${props => props.disabled ? '0.7' : '1'};
`;

const GraphControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: var(--text-color);
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? '0.6' : '1'};
  
  &:hover:not(:disabled) {
    background-color: var(--background-color);
  }
`;

const RefreshButton = styled(GraphControlButton)`
  color: var(--primary-color);
  
  &:hover:not(:disabled) {
    color: var(--primary-dark);
  }
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
  min-height: 300px;
`;

const GraphTabs = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  
  @media (max-width: 768px) {
    flex-wrap: nowrap;
    margin: 0 -1rem 1rem;
    padding: 0 1rem;
  }
`;

const GraphTab = styled.button`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  font-size: 0.875rem;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  cursor: pointer;
  white-space: nowrap;
  
  svg {
    margin-right: 0.5rem;
    font-size: 0.875rem;
  }
  
  &:hover {
    color: ${props => props.active ? 'var(--primary-dark)' : 'var(--primary-light)'};
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    
    svg {
      margin-right: 0.25rem;
      font-size: 0.75rem;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-light);
  text-align: center;
  padding: 2rem;
`;

const EmptyStateIcon = styled.div`
  color: var(--border-color);
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
`;

const EmptyStateText = styled.p`
  font-size: 0.875rem;
  max-width: 300px;
  margin: 0;
`;

const TableViewHint = styled.div`
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.75rem;
  color: var(--text-light);
  text-align: center;
`;

const TableViewLink = styled.span`
  color: var(--primary-color);
  font-weight: 500;
`;

export default GraphVisualization; 