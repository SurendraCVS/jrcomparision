import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
  FaChartLine,
  FaDatabase,
  FaFileAlt
} from 'react-icons/fa';

const Settings = ({ onSaveSettings, defaultSettings }) => {
  const [settings, setSettings] = useState({
    general: {
      darkMode: defaultSettings?.general?.darkMode || false,
      autoSaveFiles: defaultSettings?.general?.autoSaveFiles || true,
      maxHistorySize: defaultSettings?.general?.maxHistorySize || 50,
    },
    comparison: {
      defaultDiffMode: defaultSettings?.comparison?.defaultDiffMode || 'hybrid',
      defaultThreshold: defaultSettings?.comparison?.defaultThreshold || 5,
      expandAllEndpoints: defaultSettings?.comparison?.expandAllEndpoints || false,
    },
    apdex: {
      tolerationThreshold: defaultSettings?.apdex?.tolerationThreshold || 500,
      frustrationThreshold: defaultSettings?.apdex?.frustrationThreshold || 1500,
    },
    visualization: {
      defaultChartType: defaultSettings?.visualization?.defaultChartType || 'line',
      colorScheme: defaultSettings?.visualization?.colorScheme || 'default',
      showGrid: defaultSettings?.visualization?.showGrid || true,
    }
  });

  const [activeSection, setActiveSection] = useState('general');
  const [changesSaved, setChangesSaved] = useState(false);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setChangesSaved(false);
  };

  const saveSettings = () => {
    onSaveSettings(settings);
    setChangesSaved(true);
    setTimeout(() => setChangesSaved(false), 3000);
  };

  const resetToDefaults = () => {
    setSettings({
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
    setChangesSaved(false);
  };

  return (
    <SettingsContainer>
      <SettingsHeader>
        <h2>Application Settings</h2>
        <HeaderActions>
          {changesSaved && (
            <SavedIndicator>
              <FaCheckCircle />
              Settings saved successfully
            </SavedIndicator>
          )}
          <ActionButton secondary onClick={resetToDefaults}>
            <FaUndo />
            Reset Defaults
          </ActionButton>
          <ActionButton primary onClick={saveSettings}>
            <FaSave />
            Save Settings
          </ActionButton>
        </HeaderActions>
      </SettingsHeader>

      <SettingsContent>
        <SettingsSidebar>
          <SidebarItem 
            active={activeSection === 'general'} 
            onClick={() => setActiveSection('general')}
          >
            <FaCog />
            General
          </SidebarItem>
          <SidebarItem 
            active={activeSection === 'comparison'} 
            onClick={() => setActiveSection('comparison')}
          >
            <FaExchangeAlt />
            Comparison
          </SidebarItem>
          <SidebarItem 
            active={activeSection === 'apdex'} 
            onClick={() => setActiveSection('apdex')}
          >
            <FaFileAlt />
            APDEX Thresholds
          </SidebarItem>
          <SidebarItem 
            active={activeSection === 'visualization'} 
            onClick={() => setActiveSection('visualization')}
          >
            <FaChartLine />
            Visualization
          </SidebarItem>
          <SidebarItem 
            active={activeSection === 'data'} 
            onClick={() => setActiveSection('data')}
          >
            <FaDatabase />
            Data Management
          </SidebarItem>
        </SettingsSidebar>

        <SettingsPanel>
          {activeSection === 'general' && (
            <SettingsSection>
              <SectionTitle>General Settings</SectionTitle>
              
              <SettingItem>
                <SettingLabel>Dark Mode</SettingLabel>
                <Toggle 
                  checked={settings.general.darkMode}
                  onChange={() => handleChange('general', 'darkMode', !settings.general.darkMode)}
                >
                  <ToggleSlider />
                </Toggle>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>Auto-save Files</SettingLabel>
                <Toggle 
                  checked={settings.general.autoSaveFiles}
                  onChange={() => handleChange('general', 'autoSaveFiles', !settings.general.autoSaveFiles)}
                >
                  <ToggleSlider />
                </Toggle>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>Max History Size</SettingLabel>
                <RangeControl>
                  <RangeInput 
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={settings.general.maxHistorySize}
                    onChange={(e) => handleChange('general', 'maxHistorySize', parseInt(e.target.value))}
                  />
                  <RangeValue>{settings.general.maxHistorySize} files</RangeValue>
                </RangeControl>
              </SettingItem>
            </SettingsSection>
          )}

          {activeSection === 'comparison' && (
            <SettingsSection>
              <SectionTitle>Comparison Settings</SectionTitle>
              
              <SettingItem>
                <SettingLabel>Default Difference Mode</SettingLabel>
                <SelectControl>
                  <Select
                    value={settings.comparison.defaultDiffMode}
                    onChange={(e) => handleChange('comparison', 'defaultDiffMode', e.target.value)}
                  >
                    <option value="absolute">Absolute</option>
                    <option value="percentage">Percentage</option>
                    <option value="hybrid">Hybrid (Both)</option>
                  </Select>
                </SelectControl>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>Default Threshold (%)</SettingLabel>
                <RangeControl>
                  <RangeInput 
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={settings.comparison.defaultThreshold}
                    onChange={(e) => handleChange('comparison', 'defaultThreshold', parseInt(e.target.value))}
                  />
                  <RangeValue>{settings.comparison.defaultThreshold}%</RangeValue>
                </RangeControl>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>Expand All Endpoints by Default</SettingLabel>
                <Toggle 
                  checked={settings.comparison.expandAllEndpoints}
                  onChange={() => handleChange('comparison', 'expandAllEndpoints', !settings.comparison.expandAllEndpoints)}
                >
                  <ToggleSlider />
                </Toggle>
              </SettingItem>
            </SettingsSection>
          )}

          {activeSection === 'apdex' && (
            <SettingsSection>
              <SectionTitle>APDEX Threshold Settings</SectionTitle>
              
              <SettingItem>
                <SettingLabel>Toleration Threshold (ms)</SettingLabel>
                <NumberInput
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
                  value={settings.apdex.tolerationThreshold}
                  onChange={(e) => handleChange('apdex', 'tolerationThreshold', parseInt(e.target.value))}
                />
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>Frustration Threshold (ms)</SettingLabel>
                <NumberInput
                  type="number"
                  min="500"
                  max="5000"
                  step="100"
                  value={settings.apdex.frustrationThreshold}
                  onChange={(e) => handleChange('apdex', 'frustrationThreshold', parseInt(e.target.value))}
                />
              </SettingItem>

              <SettingDescription>
                APDEX (Application Performance Index) thresholds define the response time targets for the application. 
                Responses faster than the Toleration Threshold are considered satisfactory, 
                responses between Toleration and Frustration are considered tolerable, 
                and responses slower than the Frustration Threshold are considered frustrating.
              </SettingDescription>
            </SettingsSection>
          )}

          {activeSection === 'visualization' && (
            <SettingsSection>
              <SectionTitle>Visualization Settings</SectionTitle>
              
              <SettingItem>
                <SettingLabel>Default Chart Type</SettingLabel>
                <SelectControl>
                  <Select
                    value={settings.visualization.defaultChartType}
                    onChange={(e) => handleChange('visualization', 'defaultChartType', e.target.value)}
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                    <option value="area">Area Chart</option>
                  </Select>
                </SelectControl>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>Color Scheme</SettingLabel>
                <SelectControl>
                  <Select
                    value={settings.visualization.colorScheme}
                    onChange={(e) => handleChange('visualization', 'colorScheme', e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="rainbow">Rainbow</option>
                  </Select>
                </SelectControl>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>Show Grid Lines</SettingLabel>
                <Toggle 
                  checked={settings.visualization.showGrid}
                  onChange={() => handleChange('visualization', 'showGrid', !settings.visualization.showGrid)}
                >
                  <ToggleSlider />
                </Toggle>
              </SettingItem>
            </SettingsSection>
          )}

          {activeSection === 'data' && (
            <SettingsSection>
              <SectionTitle>Data Management</SectionTitle>
              
              <SettingItem>
                <SettingLabel>Local Storage</SettingLabel>
                <StorageIndicator>
                  <StorageValue>
                    <strong>14.3 MB</strong> used
                  </StorageValue>
                  <StorageBar>
                    <StorageUsed width="25%" />
                  </StorageBar>
                </StorageIndicator>
              </SettingItem>
              
              <SettingActions>
                <ActionButton secondary>
                  Clear File History
                </ActionButton>
                <ActionButton secondary>
                  Export All Settings
                </ActionButton>
                <ActionButton danger>
                  <FaTimesCircle />
                  Reset Application
                </ActionButton>
              </SettingActions>
              
              <SettingDescription>
                Warning: Clearing file history or resetting the application will permanently delete stored files and settings.
                Export your settings before performing these actions if you want to restore them later.
              </SettingDescription>
            </SettingsSection>
          )}
        </SettingsPanel>
      </SettingsContent>
    </SettingsContainer>
  );
};

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
`;

const SettingsHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SavedIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--success-color);
  font-size: 0.875rem;
  
  svg {
    font-size: 1rem;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${props => {
    if (props.primary) return 'var(--primary-color)';
    if (props.danger) return '#fee2e2';
    return 'white';
  }};
  color: ${props => {
    if (props.primary) return 'white';
    if (props.danger) return 'var(--error-color)';
    return 'var(--text-color)';
  }};
  border: 1px solid ${props => {
    if (props.primary) return 'var(--primary-color)';
    if (props.danger) return 'var(--error-color)';
    return 'var(--border-color)';
  }};
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => {
      if (props.primary) return 'var(--primary-dark)';
      if (props.danger) return '#fecaca';
      return 'var(--background-color)';
    }};
  }
`;

const SettingsContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const SettingsSidebar = styled.div`
  width: 220px;
  border-right: 1px solid var(--border-color);
  padding: 1rem 0;
  background-color: var(--background-color);
  overflow-y: auto;
`;

const SidebarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  background-color: ${props => props.active ? 'rgba(37, 99, 235, 0.1)' : 'transparent'};
  border-left: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(37, 99, 235, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const SettingsPanel = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

const SettingsSection = styled.div`
  max-width: 720px;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: var(--text-color);
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const SettingLabel = styled.div`
  font-size: 0.9375rem;
  color: var(--text-color);
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  background-color: ${props => props.checked ? 'var(--primary-color)' : '#e2e8f0'};
  border-radius: 24px;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const ToggleSlider = styled.span`
  position: absolute;
  top: 2px;
  left: ${props => props.checked ? '26px' : '2px'};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: left 0.3s;
`;

const RangeControl = styled.div`
  display: flex;
  align-items: center;
  width: 240px;
  gap: 1rem;
`;

const RangeInput = styled.input`
  flex: 1;
`;

const RangeValue = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
  min-width: 80px;
  text-align: right;
`;

const SelectControl = styled.div`
  width: 240px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
  background-color: white;
  color: var(--text-color);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const NumberInput = styled.input`
  width: 240px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
  background-color: white;
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const SettingDescription = styled.div`
  font-size: 0.875rem;
  color: var(--text-light);
  line-height: 1.5;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  max-width: 560px;
`;

const SettingActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const StorageIndicator = styled.div`
  width: 240px;
`;

const StorageValue = styled.div`
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
`;

const StorageBar = styled.div`
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
`;

const StorageUsed = styled.div`
  height: 100%;
  width: ${props => props.width || '0%'};
  background-color: var(--primary-color);
`;

const FaExchangeAlt = styled(FaFileAlt)`
  transform: rotate(90deg);
`;

export default Settings; 