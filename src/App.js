import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSpinner } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionBar from './components/ActionBar';
import ViewToggleBar from './components/ViewToggleBar';
import FileUpload from './components/FileUpload';
import GraphVisualization from './components/GraphVisualization';
import TableComparison from './components/TableComparison';
import StatusBar from './components/StatusBar';
import ResultsFilter from './components/ResultsFilter';
import ReportGeneration from './components/ReportGeneration';
import JMeterCompare from './components/JMeterCompare';
import LeftNavigation from './components/LeftNavigation';
import FileHistory from './components/FileHistory';
import Settings from './components/Settings';
import { processJTLFile } from './utils/JTLProcessor';
import './App.css';

const STORAGE_KEY = 'jmeter_compare_data';
const SETTINGS_KEY = 'jmeter_compare_settings';

const App = () => {
  // Main navigation section
  const [activeSection, setActiveSection] = useState('history');

  const [files, setFiles] = useState([]);
  const [processedData, setProcessedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: { start: null, end: null },
    responseTime: { min: '', max: '' },
    errorRate: { min: '', max: '' },
    throughput: { min: '', max: '' },
    sortBy: 'timestamp',
    sortDirection: 'desc',
    selectedTest: '',
    selectedEndpoint: ''
  });
  
  // Main data tab - 'jtl', 'statistics', or 'apdex'
  const [activeTab, setActiveTab] = useState('statistics');
  
  // View toggle - 'graph' or 'table'
  const [activeView, setActiveView] = useState('graph');
  
  // Config panel state
  const [isConfigVisible, setIsConfigVisible] = useState(true);
  // Right panel state
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  // Active right panel content: 'filter' or 'report'
  const [activeRightPanel, setActiveRightPanel] = useState('filter');
  
  // Settings state
  const [appSettings, setAppSettings] = useState({
    general: {
      darkMode: false,
      autoSaveFiles: true,
      maxHistorySize: 50,
    },
    comparison: {
      defaultDiffMode: 'hybrid',
      defaultThreshold: 5,
      expandAllEndpoints: false,
    },
    apdex: {
      tolerationThreshold: 500,
      frustrationThreshold: 1500,
    },
    visualization: {
      defaultChartType: 'line',
      colorScheme: 'default',
      showGrid: true,
    }
  });

  // Load files from localStorage on mount
  useEffect(() => {
    const loadFilesFromStorage = () => {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData)) {
            setFiles(parsedData);
            if (parsedData.length > 0 && parsedData[0].processedData) {
              setProcessedData(parsedData[0].processedData.visualizationData);
            }
          }
        }
      } catch (error) {
        console.error('Error loading files from storage:', error);
      }
    };

    const loadSettingsFromStorage = () => {
      try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setAppSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error loading settings from storage:', error);
      }
    };

    loadFilesFromStorage();
    loadSettingsFromStorage();
  }, []);

  // Save files to localStorage whenever files change
  useEffect(() => {
    if (appSettings.general.autoSaveFiles && files.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
      } catch (error) {
        console.error('Error saving files to storage:', error);
        toast.error('Failed to save files to local storage');
      }
    }
  }, [files, appSettings.general.autoSaveFiles]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
    } catch (error) {
      console.error('Error saving settings to storage:', error);
    }
  }, [appSettings]);
  
  // Handle toggling panels
  const togglePanel = (panel) => {
    if (panel === 'config') {
      setIsConfigVisible(!isConfigVisible);
    } else if (panel === 'filter') {
      if (!isRightPanelVisible) {
        setIsRightPanelVisible(true);
        setActiveRightPanel('filter');
      } else if (activeRightPanel !== 'filter') {
        setActiveRightPanel('filter');
      } else {
        setIsRightPanelVisible(false);
      }
    } else if (panel === 'report') {
      if (!isRightPanelVisible) {
        setIsRightPanelVisible(true);
        setActiveRightPanel('report');
      } else if (activeRightPanel !== 'report') {
        setActiveRightPanel('report');
      } else {
        setIsRightPanelVisible(false);
      }
    }
  };
  
  // Toggle between graph and table views
  const toggleView = (view) => {
    if (view) {
      setActiveView(view);
    } else {
      setActiveView(activeView === 'graph' ? 'table' : 'graph');
    }
  };
  
  // Handle main tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Mock data for demonstration
  const testNames = ['Login Test', 'Homepage Load', 'Search Function', 'Payment Process'];
  const endpoints = ['/api/login', '/api/products', '/api/search', '/api/checkout'];
  
  // Prepare mock data for table view
  const tableData = {
    files: files.map((file, index) => ({
      id: index,
      name: file.name,
      size: file.size,
      timestamp: new Date().toISOString()
    })),
    metrics: ['responseTime', 'throughput', 'errorRate']
  };
  
  const handleFileUpload = (uploadedFiles) => {
    // The uploaded files already have processedData from FileUpload component
    setFiles(prevFiles => {
      // Enforce max history size
      const newFiles = [...prevFiles, ...uploadedFiles];
      if (newFiles.length > appSettings.general.maxHistorySize) {
        return newFiles.slice(newFiles.length - appSettings.general.maxHistorySize);
      }
      return newFiles;
    });
    
    // Set processing state
    setIsLoading(true);
    setStatus('processing');
    
    setTimeout(() => {
      setIsLoading(false);
      setStatus('success');
      
      // Get the first uploaded file's processedData for visualization
      if (uploadedFiles.length > 0 && uploadedFiles[0].processedData) {
        setProcessedData(uploadedFiles[0].processedData.visualizationData);
      } else {
        // Fallback to dummy data if no processed data available
        setProcessedData({
          summary: {
            totalRequests: 1200,
            avgResponseTime: 320,
            errorRate: 2.5,
            throughput: 56
          },
          datasets: [
            { label: 'Test 1', values: [120, 130, 80, 90, 150, 200, 180] },
            { label: 'Test 2', values: [220, 230, 180, 190, 250, 300, 280] }
          ]
        });
      }
      
      toast.success('Files processed successfully!');
    }, 2000);
  };

  const handleUploadFiles = async (fileList) => {
    setIsLoading(true);
    setStatus('processing');

    try {
      const validFiles = Array.from(fileList).filter(file => {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        return ['jtl', 'csv'].includes(fileExtension);
      });

      if (validFiles.length === 0) {
        toast.error('No valid JTL or CSV files found');
        setIsLoading(false);
        setStatus('idle');
        return;
      }

      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          try {
            const processedData = await processJTLFile(file, (progress, message) => {
              // Progress callback
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
            toast.error(`Failed to process ${file.name}`);
            return null;
          }
        })
      );

      const successfulFiles = processedFiles.filter(file => file !== null);
      
      if (successfulFiles.length > 0) {
        handleFileUpload(successfulFiles);
      } else {
        toast.error('Failed to process any files');
        setIsLoading(false);
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('An error occurred while processing files');
      setIsLoading(false);
      setStatus('error');
    }
  };
  
  const handleDeleteFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    toast.info('File removed from history');
  };

  const handleSelectFilesForComparison = (selectedFileIds) => {
    // Verify we have at least 2 files selected
    if (selectedFileIds.length >= 2) {
      // Switch to compare view
      setActiveSection('compare');
      // Set active tab to statistics by default
      setActiveTab('statistics');
    } else {
      toast.warn('Please select at least 2 files for comparison');
    }
  };

  const handleSaveSettings = (newSettings) => {
    setAppSettings(newSettings);
    toast.success('Settings saved successfully');
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const resetFilters = () => {
    setFilters({
      search: '',
      dateRange: { start: null, end: null },
      responseTime: { min: '', max: '' },
      errorRate: { min: '', max: '' },
      throughput: { min: '', max: '' },
      sortBy: 'timestamp',
      sortDirection: 'desc',
      selectedTest: '',
      selectedEndpoint: ''
    });
  };
  
  const handleGenerateReport = (format) => {
    toast.info(`Generating ${format.toUpperCase()} report...`);
    // Simulate report generation
    setTimeout(() => {
      toast.success(`${format.toUpperCase()} report generated successfully!`);
    }, 1500);
  };
  
  const handleRefresh = () => {
    if (files.length === 0) {
      toast.warn('No files to refresh!');
      return;
    }
    
    setIsLoading(true);
    setStatus('processing');
    
    setTimeout(() => {
      setIsLoading(false);
      setStatus('success');
      toast.success('Data refreshed successfully!');
    }, 1500);
  };

  // Render content based on active section and tab
  const renderContent = () => {
    if (activeSection === 'history') {
      return (
        <FileHistory 
          files={files}
          onSelectFiles={handleSelectFilesForComparison}
          onDeleteFile={handleDeleteFile}
          onUploadFiles={handleUploadFiles}
          onOpenFile={handleOpenFile}
        />
      );
    }

    if (activeSection === 'settings') {
      return (
        <Settings 
          onSaveSettings={handleSaveSettings}
          defaultSettings={appSettings}
        />
      );
    }

    if (activeSection === 'compare') {
      return (
        <>
          <ViewToggleBar 
            activeView={activeView}
            onToggleView={toggleView}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <JMeterCompare 
            files={files}
            activeView={activeView}
            onUploadFiles={handleUploadFiles}
            onViewFile={handleOpenFile}
            onRedirectToHistory={() => setActiveSection('history')}
          />
        </>
      );
    }

    if (activeSection === 'fileView') {
      if (!processedData) {
        return (
          <EmptyState>
            <EmptyStateText>
              No data available. Select a file from File History to view.
            </EmptyStateText>
          </EmptyState>
        );
      }

      return (
        <>
          <ViewToggleBar 
            activeView={activeView}
            onToggleView={toggleView}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          {activeView === 'graph' ? (
            <GraphVisualization 
              data={processedData} 
              dataType={activeTab}
              files={files}
            />
          ) : (
            <TableComparison 
              data={processedData} 
              files={files}
              activeTab={activeTab}
            />
          )}
        </>
      );
    }

    // Default file view section
    if (files.length === 0) {
      return (
        <EmptyState>
          <EmptyStateText>
            Upload JMeter test files to get started.
          </EmptyStateText>
          <FileUpload 
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            files={files}
          />
        </EmptyState>
      );
    }

    if (!processedData) {
      return (
        <EmptyState>
          <EmptyStateText>
            No data available. Select a file to view.
          </EmptyStateText>
        </EmptyState>
      );
    }

    return (
      <>
        <ViewToggleBar 
          activeView={activeView}
          onToggleView={toggleView}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {activeView === 'graph' ? (
          <GraphVisualization 
            data={processedData} 
            dataType={activeTab}
            files={files}
          />
        ) : (
          <TableComparison 
            data={processedData} 
            files={files}
            activeTab={activeTab}
          />
        )}
      </>
    );
  };

  // Add a function to handle opening a single file
  const handleOpenFile = (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (file && file.processedData) {
      setProcessedData(file.processedData.visualizationData);
      setActiveSection('fileView'); // New section for viewing a file
      setActiveTab('statistics'); // Default tab
      setActiveView('graph'); // Default view
    }
  };
  
  return (
    <AppContainer>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ActionBar 
        onRefresh={handleRefresh}
        isConfigVisible={isConfigVisible}
        isRightPanelVisible={isRightPanelVisible}
        activeRightPanel={activeRightPanel}
        onTogglePanel={togglePanel}
      />
      
      <MainContainer>
        <LeftNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        <ContentArea>
          {renderContent()}
        </ContentArea>
      </MainContainer>
      
      <StatusBar 
        status={status} 
        error={error}
        processedFiles={files.length}
      />
    </AppContainer>
  );
};

// Styled components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background-color);
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
`;

const EmptyStateText = styled.p`
  color: var(--text-light);
  font-size: 1.125rem;
  max-width: 500px;
  line-height: 1.5;
`;

export default App; 