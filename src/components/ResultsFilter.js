import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaFilter, 
  FaSearch, 
  FaTimes, 
  FaCalendarAlt, 
  FaRegClock,
  FaExclamationTriangle,
  FaChartBar,
  FaServer,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUndoAlt,
  FaCaretDown,
  FaCaretUp
} from 'react-icons/fa';

const ResultsFilter = ({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  testNames = [],
  endpoints = []
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [visibleSection, setVisibleSection] = useState('all');
  
  const toggleAdvancedFilters = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
  };
  
  const toggleSection = (section) => {
    if (visibleSection === section) {
      setVisibleSection('all');
    } else {
      setVisibleSection(section);
    }
  };
  
  const handleFilterChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };
  
  const handleClearSearch = () => {
    onFilterChange({ ...filters, search: '' });
  };
  
  const handleTestSelectionChange = (e) => {
    const value = e.target.value;
    onFilterChange({ ...filters, selectedTest: value === 'all' ? '' : value });
  };
  
  const handleEndpointSelectionChange = (e) => {
    const value = e.target.value;
    onFilterChange({ ...filters, selectedEndpoint: value === 'all' ? '' : value });
  };
  
  // Set default filters on component mount
  useEffect(() => {
    if (!filters) {
      onFilterChange({
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
    }
  }, []);
  
  // Quick filter presets
  const quickFilters = [
    { 
      label: 'High Response Time', 
      icon: <FaRegClock />,
      filter: { responseTime: { min: '1000', max: '' } } 
    },
    { 
      label: 'Error Rate > 1%', 
      icon: <FaExclamationTriangle />,
      filter: { errorRate: { min: '1', max: '' } } 
    },
    { 
      label: 'High Throughput', 
      icon: <FaChartBar />,
      filter: { throughput: { min: '100', max: '' } } 
    }
  ];
  
  const handleQuickFilter = (filterPreset) => {
    // Merge the preset with existing filters
    onFilterChange({ ...filters, ...filterPreset.filter });
  };
  
  const isQuickFilterActive = (filterPreset) => {
    // Check if the quick filter is currently active
    for (const [key, value] of Object.entries(filterPreset.filter)) {
      if (JSON.stringify(filters[key]) !== JSON.stringify(value)) {
        return false;
      }
    }
    return true;
  };
  
  const isSectionVisible = (section) => {
    return visibleSection === 'all' || visibleSection === section;
  };
  
  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>Filters</FilterTitle>
        <FilterDropdown>
          <DropdownButton onClick={toggleAdvancedFilters}>
            {isAdvancedOpen ? <FaCaretUp /> : <FaCaretDown />}
          </DropdownButton>
        </FilterDropdown>
      </FilterHeader>
      
      <SearchContainer>
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search tests, endpoints..."
          value={filters?.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        {filters?.search && (
          <ClearButton onClick={handleClearSearch}>
            <FaTimes />
          </ClearButton>
        )}
      </SearchContainer>
      
      <SelectContainer>
        <FilterLabel>
          <FaServer /> Test
        </FilterLabel>
        <Select
          value={filters?.selectedTest || ''}
          onChange={handleTestSelectionChange}
        >
          <option value="all">All Tests</option>
          {testNames.map((test, index) => (
            <option key={index} value={test}>{test}</option>
          ))}
        </Select>
      </SelectContainer>
      
      <SelectContainer>
        <FilterLabel>
          <FaServer /> Endpoint
        </FilterLabel>
        <Select
          value={filters?.selectedEndpoint || ''}
          onChange={handleEndpointSelectionChange}
        >
          <option value="all">All Endpoints</option>
          {endpoints.map((endpoint, index) => (
            <option key={index} value={endpoint}>{endpoint}</option>
          ))}
        </Select>
      </SelectContainer>
      
      <QuickFiltersContainer>
        <SectionHeader onClick={() => toggleSection('quickFilters')}>
          <SectionTitle>Quick Filters</SectionTitle>
          {visibleSection === 'quickFilters' ? <FaCaretUp /> : <FaCaretDown />}
        </SectionHeader>
        
        {isSectionVisible('quickFilters') && (
          <QuickFiltersGrid>
            {quickFilters.map((filter, index) => (
              <QuickFilterButton
                key={index}
                onClick={() => handleQuickFilter(filter)}
                active={isQuickFilterActive(filter)}
              >
                {filter.icon}
                <span>{filter.label}</span>
              </QuickFilterButton>
            ))}
          </QuickFiltersGrid>
        )}
      </QuickFiltersContainer>
      
      {isAdvancedOpen && (
        <AdvancedFilters>
          <FilterSection>
            <SectionHeader onClick={() => toggleSection('dateRange')}>
              <SectionTitle>Date Range</SectionTitle>
              {visibleSection === 'dateRange' ? <FaCaretUp /> : <FaCaretDown />}
            </SectionHeader>
            
            {isSectionVisible('dateRange') && (
              <SectionContent>
                <FilterRow>
                  <DateInput>
                    <DateLabel>
                      <FaCalendarAlt /> From
                    </DateLabel>
                    <Input
                      type="date"
                      value={filters?.dateRange?.start || ''}
                      onChange={(e) => handleFilterChange('dateRange', { 
                        ...filters.dateRange, 
                        start: e.target.value 
                      })}
                    />
                  </DateInput>
                  
                  <DateInput>
                    <DateLabel>
                      <FaCalendarAlt /> To
                    </DateLabel>
                    <Input
                      type="date"
                      value={filters?.dateRange?.end || ''}
                      onChange={(e) => handleFilterChange('dateRange', { 
                        ...filters.dateRange, 
                        end: e.target.value 
                      })}
                    />
                  </DateInput>
                </FilterRow>
              </SectionContent>
            )}
          </FilterSection>
          
          <FilterSection>
            <SectionHeader onClick={() => toggleSection('responseTime')}>
              <SectionTitle>Response Time (ms)</SectionTitle>
              {visibleSection === 'responseTime' ? <FaCaretUp /> : <FaCaretDown />}
            </SectionHeader>
            
            {isSectionVisible('responseTime') && (
              <SectionContent>
                <FilterRow>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters?.responseTime?.min || ''}
                    onChange={(e) => handleFilterChange('responseTime', { 
                      ...filters.responseTime, 
                      min: e.target.value 
                    })}
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters?.responseTime?.max || ''}
                    onChange={(e) => handleFilterChange('responseTime', { 
                      ...filters.responseTime, 
                      max: e.target.value 
                    })}
                  />
                </FilterRow>
              </SectionContent>
            )}
          </FilterSection>
          
          <FilterSection>
            <SectionHeader onClick={() => toggleSection('errorRate')}>
              <SectionTitle>Error Rate (%)</SectionTitle>
              {visibleSection === 'errorRate' ? <FaCaretUp /> : <FaCaretDown />}
            </SectionHeader>
            
            {isSectionVisible('errorRate') && (
              <SectionContent>
                <FilterRow>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters?.errorRate?.min || ''}
                    onChange={(e) => handleFilterChange('errorRate', { 
                      ...filters.errorRate, 
                      min: e.target.value 
                    })}
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters?.errorRate?.max || ''}
                    onChange={(e) => handleFilterChange('errorRate', { 
                      ...filters.errorRate, 
                      max: e.target.value 
                    })}
                  />
                </FilterRow>
              </SectionContent>
            )}
          </FilterSection>
          
          <FilterSection>
            <SectionHeader onClick={() => toggleSection('throughput')}>
              <SectionTitle>Throughput (req/s)</SectionTitle>
              {visibleSection === 'throughput' ? <FaCaretUp /> : <FaCaretDown />}
            </SectionHeader>
            
            {isSectionVisible('throughput') && (
              <SectionContent>
                <FilterRow>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters?.throughput?.min || ''}
                    onChange={(e) => handleFilterChange('throughput', { 
                      ...filters.throughput, 
                      min: e.target.value 
                    })}
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters?.throughput?.max || ''}
                    onChange={(e) => handleFilterChange('throughput', { 
                      ...filters.throughput, 
                      max: e.target.value 
                    })}
                  />
                </FilterRow>
              </SectionContent>
            )}
          </FilterSection>
          
          <FilterSection>
            <SectionHeader onClick={() => toggleSection('sorting')}>
              <SectionTitle>Sort By</SectionTitle>
              {visibleSection === 'sorting' ? <FaCaretUp /> : <FaCaretDown />}
            </SectionHeader>
            
            {isSectionVisible('sorting') && (
              <SectionContent>
                <FilterRow>
                  <Select
                    value={filters?.sortBy || 'timestamp'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="timestamp">Date</option>
                    <option value="testName">Test Name</option>
                    <option value="responseTime">Response Time</option>
                    <option value="errorRate">Error Rate</option>
                    <option value="throughput">Throughput</option>
                  </Select>
                  
                  <SortDirectionButton
                    active={filters?.sortDirection === 'asc'}
                    onClick={() => handleFilterChange('sortDirection', 'asc')}
                  >
                    <FaSortAmountUp />
                  </SortDirectionButton>
                  
                  <SortDirectionButton
                    active={filters?.sortDirection === 'desc'}
                    onClick={() => handleFilterChange('sortDirection', 'desc')}
                  >
                    <FaSortAmountDown />
                  </SortDirectionButton>
                </FilterRow>
              </SectionContent>
            )}
          </FilterSection>
        </AdvancedFilters>
      )}
      
      <ResetButtonContainer>
        <ResetButton onClick={onResetFilters}>
          <FaUndoAlt />
          Reset Filters
        </ResetButton>
      </ResetButtonContainer>
    </FilterContainer>
  );
};

// Styled components
const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const FilterTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
`;

const FilterDropdown = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 0.25rem;
  border: 1px solid var(--border-color);
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--background-color);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--text-color);
  }
`;

const QuickFiltersContainer = styled.div`
  margin-bottom: 1rem;
`;

const QuickFiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const QuickFilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  background-color: ${props => props.active ? 'rgba(59, 130, 246, 0.1)' : 'white'};
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    border-color: var(--primary-color);
    background-color: rgba(59, 130, 246, 0.05);
  }
  
  svg {
    flex-shrink: 0;
    font-size: 0.875rem;
    color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-light)'};
  }
  
  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const AdvancedFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const FilterSection = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  background-color: var(--background-color);
  cursor: pointer;
  
  &:hover {
    background-color: rgba(59, 130, 246, 0.05);
  }
  
  svg {
    font-size: 0.75rem;
    color: var(--text-light);
  }
`;

const SectionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
`;

const SectionContent = styled.div`
  padding: 0.75rem;
  border-top: 1px solid var(--border-color);
  background-color: white;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    color: var(--text-light);
    font-size: 0.75rem;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 0.875rem;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  
  svg {
    font-size: 0.875rem;
    color: var(--text-light);
  }
`;

const SelectContainer = styled.div`
  margin-bottom: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background-color: white;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const DateInput = styled.div`
  flex: 1;
`;

const DateLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
  
  svg {
    font-size: 0.75rem;
  }
`;

const SortDirectionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-light)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
    color: ${props => !props.active && 'var(--primary-color)'};
  }
`;

const ResetButtonContainer = styled.div`
  margin-top: auto;
  padding-top: 1rem;
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--background-color);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

export default ResultsFilter; 