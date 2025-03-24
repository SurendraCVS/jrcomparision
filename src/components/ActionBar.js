import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaBars, 
  FaFilter, 
  FaQuestion, 
  FaDownload, 
  FaRedo, 
  FaCog, 
  FaChevronLeft, 
  FaChevronRight,
  FaFileAlt,
  FaChartBar
} from 'react-icons/fa';

const ActionBar = ({ 
  onRefresh,
  isConfigVisible, 
  isRightPanelVisible, 
  onTogglePanel, 
  activeRightPanel
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <ActionBarContainer>
      <Logo>JMeter Compare</Logo>
      
      <ToggleButtons>
        <ToggleButton 
          title="Toggle Configuration Panel"
          onClick={() => onTogglePanel('config')}
          active={isConfigVisible}
        >
          {isConfigVisible ? <FaChevronLeft /> : <FaCog />}
        </ToggleButton>
        
        <ToolbarDivider />

        <ToggleButton 
          title="Toggle Filters Panel"
          onClick={() => onTogglePanel('filter')}
          active={isRightPanelVisible && activeRightPanel === 'filter'}
        >
          {isRightPanelVisible && activeRightPanel === 'filter' ? <FaChevronRight /> : <FaFilter />}
        </ToggleButton>
        
        <ToggleButton 
          title="Toggle Reports Panel"
          onClick={() => onTogglePanel('report')}
          active={isRightPanelVisible && activeRightPanel === 'report'}
        >
          {isRightPanelVisible && activeRightPanel === 'report' ? <FaChevronRight /> : <FaFileAlt />}
        </ToggleButton>
      </ToggleButtons>
      
      <ActionBarActions>
        <ActionButton title="Refresh Data" onClick={onRefresh}>
          <FaRedo />
        </ActionButton>

        <ActionButton title="Save Results" onClick={() => console.log('Save clicked')}>
          <FaDownload />
        </ActionButton>
        
        <ActionButton title="Help" onClick={() => console.log('Help clicked')}>
          <FaQuestion />
        </ActionButton>
        
        <DropdownWrapper>
          <SettingsButton 
            title="Settings"
            onClick={toggleDropdown}
            active={dropdownOpen}
          >
            <FaBars />
          </SettingsButton>
          
          {dropdownOpen && (
            <DropdownMenu>
              <DropdownItem onClick={() => console.log('Charts clicked')}>
                <FaChartBar /> Chart Settings
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Export clicked')}>
                <FaDownload /> Export Data
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Help clicked')}>
                <FaQuestion /> Help & FAQ
              </DropdownItem>
            </DropdownMenu>
          )}
        </DropdownWrapper>
      </ActionBarActions>
    </ActionBarContainer>
  );
};

const ActionBarContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--primary-color);
  color: white;
  padding: 1.25rem 2rem;
  box-shadow: var(--shadow-md);
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.75px;
  margin-right: 3rem;
  
  @media (max-width: 992px) {
    margin-right: 2rem;
  }
`;

const ToggleButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  
  @media (max-width: 992px) {
    margin-left: auto;
  }
  
  @media (max-width: 768px) {
    position: static;
    transform: none;
    gap: 1rem;
  }
`;

const ToolbarDivider = styled.div`
  height: 32px;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.35);
  margin: 0 0.75rem;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.25)' : 'transparent'};
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  svg {
    font-size: 1.15rem;
  }
`;

const ActionBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  
  @media (max-width: 576px) {
    gap: 1rem;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  color: white;
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }
  
  svg {
    font-size: 1.15rem;
  }
  
  @media (max-width: 576px) {
    width: 2.5rem;
    height: 2.5rem;
  }
`;

const SettingsButton = styled(ActionButton)`
  margin-left: 0.75rem;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.25)' : 'transparent'};
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.75rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-md);
  min-width: 200px;
  z-index: 100;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.875rem 1.25rem;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  svg {
    margin-right: 0.875rem;
    font-size: 0.875rem;
    color: var(--text-light);
  }
  
  &:hover {
    background-color: var(--background-color);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

export default ActionBar;