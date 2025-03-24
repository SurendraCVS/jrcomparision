import React from 'react';
import styled from 'styled-components';
import { 
  FaHistory, 
  FaExchangeAlt, 
  FaCog,
  FaChevronRight,
  FaFileAlt
} from 'react-icons/fa';

const LeftNavigation = ({ activeSection, onSectionChange }) => {
  const navigationItems = [
    { id: 'history', label: 'Files History', icon: <FaHistory /> },
    { id: 'fileView', label: 'File View', icon: <FaFileAlt /> },
    { id: 'compare', label: 'Compare Statistics', icon: <FaExchangeAlt /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ];

  return (
    <NavContainer>
      <NavHeader>
        <Logo>JMeter Compare</Logo>
      </NavHeader>
      
      <NavMenu>
        {navigationItems.map(item => (
          <NavItem 
            key={item.id}
            active={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          >
            <NavItemIcon>{item.icon}</NavItemIcon>
            <NavItemLabel>{item.label}</NavItemLabel>
            {activeSection === item.id && <FaChevronRight className="active-indicator" />}
          </NavItem>
        ))}
      </NavMenu>
      
      <NavFooter>
        <Version>v1.0.0</Version>
      </NavFooter>
    </NavContainer>
  );
};

const NavContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 250px;
  background-color: #1e293b;
  color: #e2e8f0;
  overflow: hidden;
`;

const NavHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const NavMenu = styled.div`
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  position: relative;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .active-indicator {
    position: absolute;
    right: 1.5rem;
    font-size: 0.75rem;
    opacity: 0.7;
  }
`;

const NavItemIcon = styled.div`
  margin-right: 1rem;
  opacity: 0.8;
  width: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavItemLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
`;

const NavFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const Version = styled.div`
  font-size: 0.75rem;
  opacity: 0.6;
`;

export default LeftNavigation; 