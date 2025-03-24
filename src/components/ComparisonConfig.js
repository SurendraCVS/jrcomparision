import React, { useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const ComparisonConfig = ({
  selectedMetrics,
  timeRange,
  graphType,
  thresholds,
  onMetricSelection,
  onTimeRangeChange,
  onGraphTypeChange,
  onThresholdChange,
  onApplyConfiguration
}) => {
  const [sections, setSections] = useState({
    metrics: true,
    timeRange: true,
    visualization: true,
    thresholds: true
  });
  
  const toggleSection = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleMetricChange = (e) => {
    const { value, checked } = e.target;
    const updatedMetrics = checked
      ? [...selectedMetrics, value]
      : selectedMetrics.filter(m => m !== value);
    onMetricSelection(updatedMetrics);
  };
  
  const handleTimeRangeChange = (e) => {
    const { name, value } = e.target;
    onTimeRangeChange({
      ...timeRange,
      [name]: value
    });
  };
  
  const handleGraphTypeChange = (e) => {
    onGraphTypeChange(e.target.value);
  };
  
  const handleThresholdChange = (metric, value) => {
    onThresholdChange({
      ...thresholds,
      [metric]: value
    });
  };
  
  const metrics = [
    { id: 'responseTime', label: 'Response Time (ms)' },
    { id: 'throughput', label: 'Throughput (req/sec)' },
    { id: 'errorRate', label: 'Error Rate (%)' },
    { id: 'latency', label: 'Latency (ms)' },
    { id: 'bandwidth', label: 'Bandwidth (KB/sec)' }
  ];
  
  const timeRangeOptions = [
    { id: 'all', label: 'All Data' },
    { id: 'last10min', label: 'Last 10 Minutes' },
    { id: 'last1hour', label: 'Last 1 Hour' },
    { id: 'custom', label: 'Custom Range' }
  ];
  
  return (
    <ConfigContainer>
      <ConfigHeader>Comparison Configuration</ConfigHeader>
      
      <ConfigSection>
        <SectionHeader onClick={() => toggleSection('metrics')}>
          <SectionIcon>
            {sections.metrics ? <FaChevronDown /> : <FaChevronRight />}
          </SectionIcon>
          <SectionTitle>Metrics Selection</SectionTitle>
        </SectionHeader>
        
        {sections.metrics && (
          <SectionContent>
            {metrics.map(metric => (
              <CheckboxItem key={metric.id}>
                <CheckboxInput
                  type="checkbox"
                  id={`metric-${metric.id}`}
                  value={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onChange={handleMetricChange}
                />
                <CheckboxLabel htmlFor={`metric-${metric.id}`}>
                  {metric.label}
                </CheckboxLabel>
              </CheckboxItem>
            ))}
          </SectionContent>
        )}
      </ConfigSection>
      
      <ConfigSection>
        <SectionHeader onClick={() => toggleSection('timeRange')}>
          <SectionIcon>
            {sections.timeRange ? <FaChevronDown /> : <FaChevronRight />}
          </SectionIcon>
          <SectionTitle>Time Range</SectionTitle>
        </SectionHeader>
        
        {sections.timeRange && (
          <SectionContent>
            <SelectInput
              value={timeRange.preset || 'all'}
              onChange={(e) => handleTimeRangeChange({ target: { name: 'preset', value: e.target.value }})}
            >
              {timeRangeOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
            
            {(timeRange.preset === 'custom' || !timeRange.preset) && (
              <>
                <FormGroup>
                  <FormLabel>Start Time</FormLabel>
                  <FormInput
                    type="datetime-local"
                    name="start"
                    value={timeRange.start || ''}
                    onChange={handleTimeRangeChange}
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>End Time</FormLabel>
                  <FormInput
                    type="datetime-local"
                    name="end"
                    value={timeRange.end || ''}
                    onChange={handleTimeRangeChange}
                  />
                </FormGroup>
              </>
            )}
          </SectionContent>
        )}
      </ConfigSection>
      
      <ConfigSection>
        <SectionHeader onClick={() => toggleSection('visualization')}>
          <SectionIcon>
            {sections.visualization ? <FaChevronDown /> : <FaChevronRight />}
          </SectionIcon>
          <SectionTitle>Visualization Options</SectionTitle>
        </SectionHeader>
        
        {sections.visualization && (
          <SectionContent>
            <FormGroup>
              <FormLabel>Graph Type</FormLabel>
              <RadioGroup>
                <RadioItem>
                  <RadioInput
                    type="radio"
                    id="graph-line"
                    name="graphType"
                    value="line"
                    checked={graphType === 'line'}
                    onChange={handleGraphTypeChange}
                  />
                  <RadioLabel htmlFor="graph-line">Line Chart</RadioLabel>
                </RadioItem>
                
                <RadioItem>
                  <RadioInput
                    type="radio"
                    id="graph-bar"
                    name="graphType"
                    value="bar"
                    checked={graphType === 'bar'}
                    onChange={handleGraphTypeChange}
                  />
                  <RadioLabel htmlFor="graph-bar">Bar Chart</RadioLabel>
                </RadioItem>
                
                <RadioItem>
                  <RadioInput
                    type="radio"
                    id="graph-area"
                    name="graphType"
                    value="area"
                    checked={graphType === 'area'}
                    onChange={handleGraphTypeChange}
                  />
                  <RadioLabel htmlFor="graph-area">Area Chart</RadioLabel>
                </RadioItem>
              </RadioGroup>
            </FormGroup>
          </SectionContent>
        )}
      </ConfigSection>
      
      <ConfigSection>
        <SectionHeader onClick={() => toggleSection('thresholds')}>
          <SectionIcon>
            {sections.thresholds ? <FaChevronDown /> : <FaChevronRight />}
          </SectionIcon>
          <SectionTitle>Thresholds</SectionTitle>
        </SectionHeader>
        
        {sections.thresholds && (
          <SectionContent>
            {metrics.filter(m => selectedMetrics.includes(m.id)).map(metric => (
              <FormGroup key={`threshold-${metric.id}`}>
                <FormLabel>{metric.label} Threshold</FormLabel>
                <FormInput
                  type="number"
                  value={thresholds[metric.id] || ''}
                  onChange={(e) => handleThresholdChange(metric.id, e.target.value)}
                  placeholder="Enter threshold value"
                />
              </FormGroup>
            ))}
            
            {selectedMetrics.length === 0 && (
              <EmptyMessage>Select metrics to set thresholds</EmptyMessage>
            )}
          </SectionContent>
        )}
      </ConfigSection>
      
      <ApplyButton onClick={onApplyConfiguration}>
        Apply Configuration
      </ApplyButton>
    </ConfigContainer>
  );
};

const ConfigContainer = styled.div`
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ConfigHeader = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-color);
`;

const ConfigSection = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--background-color);
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

const SectionIcon = styled.span`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  margin-right: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
`;

const SectionContent = styled.div`
  padding: 1rem;
  background-color: white;
  border-top: 1px solid var(--border-color);
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CheckboxInput = styled.input`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  user-select: none;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-light);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  }
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-light);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const RadioItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RadioInput = styled.input`
  margin-right: 0.5rem;
`;

const RadioLabel = styled.label`
  font-size: 0.875rem;
  user-select: none;
`;

const EmptyMessage = styled.p`
  font-size: 0.875rem;
  color: var(--text-light);
  font-style: italic;
  text-align: center;
`;

const ApplyButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 0.25rem;
  font-weight: 500;
  margin-top: auto;
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

export default ComparisonConfig; 