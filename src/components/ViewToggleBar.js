import React from 'react';
import styled from 'styled-components';
import { FaChartLine, FaTable, FaFileAlt, FaChartBar, FaChartPie, FaExchangeAlt } from 'react-icons/fa';

const ViewToggleBar = ({ activeView, onToggleView, activeTab, onTabChange }) => {
  // Get the title text based on active tab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'jtl':
        return 'JTL Raw Data';
      case 'statistics':
        return 'Performance Statistics';
      case 'apdex':
        return 'APDEX Scores';
      case 'compare':
        return 'JMeter Comparison';
      default:
        return 'Data View';
    }
  };

  return (
    <ToggleBarContainer>
      <MainNav>
        <MainNavItem 
          active={activeTab === 'jtl'} 
          onClick={() => onTabChange && onTabChange('jtl')}
        >
          <FaFileAlt /> <ItemLabel>JTL Data</ItemLabel>
        </MainNavItem>
        <MainNavItem 
          active={activeTab === 'statistics'} 
          onClick={() => onTabChange && onTabChange('statistics')}
        >
          <FaChartBar /> <ItemLabel>Statistics</ItemLabel>
        </MainNavItem>
        <MainNavItem 
          active={activeTab === 'apdex'} 
          onClick={() => onTabChange && onTabChange('apdex')}
        >
          <FaChartPie /> <ItemLabel>APDEX</ItemLabel>
        </MainNavItem>
      </MainNav>

      <ViewToggleSection>
        <ViewToggleLabel>Select View:</ViewToggleLabel>
        <ViewToggleButtons>
          <ViewToggleButton 
            title="Graph View" 
            onClick={() => onToggleView && onToggleView('graph')}
            active={activeView === 'graph'}
          >
            <FaChartLine /> <ViewButtonLabel>Graph View</ViewButtonLabel>
          </ViewToggleButton>
          
          <ViewToggleButton 
            title="Table View" 
            onClick={() => onToggleView && onToggleView('table')}
            active={activeView === 'table'}
          >
            <FaTable /> <ViewButtonLabel>Table View</ViewButtonLabel>
          </ViewToggleButton>
        </ViewToggleButtons>
      </ViewToggleSection>
    </ToggleBarContainer>
  );
};

const ToggleBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  
  @media (max-width: 992px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.5rem;
  }
`;

const MainNav = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 576px) {
    width: 100%;
    justify-content: space-between;
    gap: 0.5rem;
  }
`;

const MainNavItem = styled.button`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--background-color)'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: none;
  border-radius: 0.375rem;
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.active ? 'var(--shadow-sm)' : 'none'};
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-dark)' : 'rgba(0, 0, 0, 0.05)'};
  }
  
  svg {
    margin-right: 0.75rem;
    font-size: 1.1rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.75rem 1rem;
    flex: 1;
    justify-content: center;
  }
`;

const ItemLabel = styled.span`
  @media (max-width: 576px) {
    display: none;
  }
`;

const ViewToggleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  
  @media (max-width: 992px) {
    width: 100%;
    justify-content: space-between;
    margin-top: 0.5rem;
  }
`;

const ViewToggleLabel = styled.span`
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-color);
`;

const ViewToggleButtons = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--background-color);
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
`;

const ViewToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 8rem;
  font-weight: ${props => props.active ? '500' : 'normal'};
  
  &:first-child {
    border-right: 1px solid var(--border-color);
  }
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-dark)' : 'var(--background-color)'};
  }
  
  svg {
    margin-right: 0.5rem;
    font-size: 0.9375rem;
  }
  
  @media (max-width: 576px) {
    min-width: auto;
    padding: 0.75rem 1rem;
  }
`;

const ViewButtonLabel = styled.span`
  font-size: 0.9375rem;
  
  @media (max-width: 576px) {
    display: none;
  }
`;

export default ViewToggleBar; 