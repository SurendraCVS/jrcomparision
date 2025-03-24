# JMeter Comparison Tool

A modern web application for visualizing, analyzing, and comparing JMeter test results.

## Features

- **File Management**: Upload, organize, and manage JMeter (.jtl, .csv) test result files
- **Data Visualization**: View performance metrics in both graph and table formats
- **Test Comparison**: Compare performance metrics between different test runs
- **JMeter Version Detection**: Automatically detect and display JMeter versions used
- **APDEX Calculation**: Calculate Application Performance Index scores with customizable thresholds
- **Data Persistence**: Automatic saving of files in browser local storage
- **Export Functionality**: Export comparison data and reports
- **Customizable Settings**: Configure visualization preferences, comparison thresholds, and more

## Navigation

- **Files History**: Manage all uploaded test files
- **File View**: Visualize individual test file data in graphs or tables
- **Compare Statistics**: Compare performance metrics across different test runs
- **Settings**: Configure application settings and preferences

## Data Views

- **JTL Data**: View raw JMeter test log data
- **Statistics**: Analyze performance statistics (response times, throughput, error rates)
- **APDEX**: View Application Performance Index scores for endpoints

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/SurendraCVS/jrcomparision.git
   cd jrcomparision
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload JMeter test log files (.jtl or .csv) via the Files History section
2. Click on a file to view its data in graph or table format
3. Select two or more files and click "Compare Selected Files" to analyze differences
4. Configure display options using the settings menu

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React and styled-components
- Visualizations powered by Chart.js
- Icons from react-icons
