# JMeter Compare Tool

A modern web application for comparing and analyzing JMeter performance test results.

## Features

- **File Upload**: Drag-and-drop interface for uploading JMeter result files (.jtl, .csv, .xml)
- **Interactive Visualization**: Dynamic charts for comparing performance metrics
- **Flexible Configuration**: Customizable comparison parameters and thresholds
- **Filtering**: Advanced filtering options for focused analysis
- **Report Generation**: Export capabilities in multiple formats

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/jmeter-compare.git
   cd jmeter-compare
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. **Upload Test Results**:
   - Drag and drop your JMeter result files into the upload area
   - Alternatively, click to browse and select files

2. **Configure Comparison**:
   - Select metrics to compare from the left sidebar
   - Set time ranges and thresholds

3. **Analyze Results**:
   - Interact with the visualization area to explore data
   - Use filters in the right sidebar to focus on specific aspects

4. **Generate Reports**:
   - Choose report format and content from the bottom panel
   - Click "Generate Report" to export

## Technical Details

The application is built using:
- React.js for the frontend UI
- Chart.js and D3.js for data visualization
- Node.js for the backend server

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- JMeter community for excellent performance testing tools
- Open source visualization libraries that make this tool possible 