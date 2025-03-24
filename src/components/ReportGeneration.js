import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaFileExport, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv, 
  FaFileAlt, 
  FaEye, 
  FaSpinner, 
  FaClock,
  FaTimes,
  FaExpandAlt
} from 'react-icons/fa';

const ReportGeneration = ({ onGenerateReport }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'generate' or 'recent'
  
  const handleFormatChange = (format) => {
    setSelectedFormat(format);
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      onGenerateReport(selectedFormat);
      setIsGenerating(false);
      setActivePanel(null); // Close panel after generation
    }, 2000);
  };
  
  const togglePanel = (panel) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };
  
  const recentReports = [
    { id: 1, name: 'Performance Report - 2023-06-15', format: 'pdf', date: '2023-06-15 14:30' },
    { id: 2, name: 'Error Analysis - 2023-06-14', format: 'excel', date: '2023-06-14 10:25' },
    { id: 3, name: 'Throughput Report - 2023-06-12', format: 'csv', date: '2023-06-12 09:45' }
  ];
  
  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf':
        return <FaFilePdf />;
      case 'excel':
        return <FaFileExcel />;
      case 'csv':
        return <FaFileCsv />;
      case 'html':
        return <FaFileAlt />;
      default:
        return <FaFileExport />;
    }
  };
  
  return (
    <ReportContainer>
      <ReportHeader>Reports</ReportHeader>
      
      <ButtonGroup>
        <ActionButton 
          onClick={() => togglePanel('generate')}
          active={activePanel === 'generate'}
        >
          <FaFileExport /> Generate Report
        </ActionButton>
        
        <ActionButton 
          onClick={() => togglePanel('recent')}
          active={activePanel === 'recent'}
        >
          <FaFilePdf /> Recent Reports
        </ActionButton>
      </ButtonGroup>
      
      {activePanel === 'generate' && (
        <PanelWindow>
          <PanelHeader>
            <PanelTitle>Generate Report</PanelTitle>
            <CloseButton onClick={() => setActivePanel(null)}>
              <FaTimes />
            </CloseButton>
          </PanelHeader>
          
          <PanelContent>
            <section>
              <SectionTitle>Report Format</SectionTitle>
              <FormatOptions>
                <FormatOption
                  active={selectedFormat === 'pdf'}
                  onClick={() => handleFormatChange('pdf')}
                >
                  <FormatIcon>{getFormatIcon('pdf')}</FormatIcon>
                  <FormatName>PDF</FormatName>
                </FormatOption>
                
                <FormatOption
                  active={selectedFormat === 'excel'}
                  onClick={() => handleFormatChange('excel')}
                >
                  <FormatIcon>{getFormatIcon('excel')}</FormatIcon>
                  <FormatName>Excel</FormatName>
                </FormatOption>
                
                <FormatOption
                  active={selectedFormat === 'csv'}
                  onClick={() => handleFormatChange('csv')}
                >
                  <FormatIcon>{getFormatIcon('csv')}</FormatIcon>
                  <FormatName>CSV</FormatName>
                </FormatOption>
                
                <FormatOption
                  active={selectedFormat === 'html'}
                  onClick={() => handleFormatChange('html')}
                >
                  <FormatIcon>{getFormatIcon('html')}</FormatIcon>
                  <FormatName>HTML</FormatName>
                </FormatOption>
              </FormatOptions>
            </section>
            
            <section>
              <SectionTitle>Report Contents</SectionTitle>
              <OptionsList>
                <OptionItem>
                  <OptionCheckbox type="checkbox" id="report-summary" defaultChecked />
                  <OptionLabel htmlFor="report-summary">Executive Summary</OptionLabel>
                </OptionItem>
                
                <OptionItem>
                  <OptionCheckbox type="checkbox" id="report-charts" defaultChecked />
                  <OptionLabel htmlFor="report-charts">Performance Charts</OptionLabel>
                </OptionItem>
                
                <OptionItem>
                  <OptionCheckbox type="checkbox" id="report-tables" defaultChecked />
                  <OptionLabel htmlFor="report-tables">Data Tables</OptionLabel>
                </OptionItem>
                
                <OptionItem>
                  <OptionCheckbox type="checkbox" id="report-errors" />
                  <OptionLabel htmlFor="report-errors">Error Analysis</OptionLabel>
                </OptionItem>
                
                <OptionItem>
                  <OptionCheckbox type="checkbox" id="report-recommendations" />
                  <OptionLabel htmlFor="report-recommendations">Recommendations</OptionLabel>
                </OptionItem>
              </OptionsList>
            </section>
            
            <GenerateButton 
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="spinner" />
                  Generating...
                </>
              ) : (
                <>
                  <FaFileExport />
                  Generate {selectedFormat.toUpperCase()} Report
                </>
              )}
            </GenerateButton>
          </PanelContent>
        </PanelWindow>
      )}
      
      {activePanel === 'recent' && (
        <PanelWindow>
          <PanelHeader>
            <PanelTitle>Recent Reports</PanelTitle>
            <CloseButton onClick={() => setActivePanel(null)}>
              <FaTimes />
            </CloseButton>
          </PanelHeader>
          
          <PanelContent>
            <RecentReportsList>
              {recentReports.map(report => (
                <RecentReportItem key={report.id}>
                  <RecentReportInfo>
                    <RecentReportIcon>
                      {getFormatIcon(report.format)}
                    </RecentReportIcon>
                    <RecentReportDetails>
                      <RecentReportName>{report.name}</RecentReportName>
                      <RecentReportMeta>
                        <FaClock />
                        {report.date}
                      </RecentReportMeta>
                    </RecentReportDetails>
                  </RecentReportInfo>
                  <ReportActions>
                    <ActionIconButton title="View Report">
                      <FaEye />
                    </ActionIconButton>
                    <ActionIconButton title="Open in New Window">
                      <FaExpandAlt />
                    </ActionIconButton>
                  </ReportActions>
                </RecentReportItem>
              ))}
            </RecentReportsList>
          </PanelContent>
        </PanelWindow>
      )}
      
      <ReportHelp>
        Generate reports to analyze and share your test results.
        Select your preferred format and content to create a customized report.
      </ReportHelp>
    </ReportContainer>
  );
};

// Styled components
const ReportContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
`;

const ReportHeader = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: var(--text-color);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-dark)' : 'var(--background-color)'};
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

const PanelWindow = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 1rem;
  background-color: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 155px);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
`;

const PanelTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  
  &:hover {
    background-color: var(--border-color);
    color: var(--text-color);
  }
  
  svg {
    font-size: 0.75rem;
  }
`;

const PanelContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
  
  section {
    margin-bottom: 1.25rem;
  }
`;

const SectionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.75rem;
  color: var(--text-color);
`;

const FormatOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  
  @media (max-width: 330px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormatOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 0.25rem;
  background-color: ${props => props.active ? 'rgba(59, 130, 246, 0.05)' : 'white'};
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary-color);
    background-color: ${props => props.active ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'};
  }
`;

const FormatIcon = styled.div`
  font-size: 1.25rem;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
`;

const FormatName = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
`;

const OptionCheckbox = styled.input`
  margin-right: 0.5rem;
`;

const OptionLabel = styled.label`
  font-size: 0.875rem;
  cursor: pointer;
`;

const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 1rem;
  }
`;

const RecentReportsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RecentReportItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: white;
  
  &:hover {
    background-color: var(--background-color);
  }
`;

const RecentReportInfo = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const RecentReportIcon = styled.div`
  font-size: 1.25rem;
  color: var(--primary-color);
  margin-right: 0.75rem;
  min-width: 1.25rem;
`;

const RecentReportDetails = styled.div`
  overflow: hidden;
`;

const RecentReportName = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RecentReportMeta = styled.div`
  font-size: 0.75rem;
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ReportActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--text-light);
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--background-color);
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

const ReportHelp = styled.p`
  font-size: 0.75rem;
  color: var(--text-light);
  line-height: 1.4;
  margin-top: auto;
  padding-top: 1rem;
`;

export default ReportGeneration; 