import '@mindfiredigital/pivothead-web-component';

const originalData = [
  {
    date: '2024-01-01',
    product: 'Widget A',
    region: 'North',
    sales: 1000,
    quantity: 50,
  },
  {
    date: '2024-01-02',
    product: 'Widget B',
    region: 'South',
    sales: 1500,
    quantity: 75,
  },
  {
    date: '2024-01-03',
    product: 'Widget A',
    region: 'East',
    sales: 900,
    quantity: 45,
  },
  {
    date: '2024-01-04',
    product: 'Widget C',
    region: 'West',
    sales: 2000,
    quantity: 80,
  },
  {
    date: '2024-01-05',
    product: 'Widget B',
    region: 'North',
    sales: 1100,
    quantity: 55,
  },
  {
    date: '2024-01-06',
    product: 'Widget C',
    region: 'South',
    sales: 1700,
    quantity: 65,
  },
  {
    date: '2024-01-07',
    product: 'Widget A',
    region: 'West',
    sales: 1200,
    quantity: 60,
  },
  {
    date: '2024-01-08',
    product: 'Widget B',
    region: 'East',
    sales: 1300,
    quantity: 70,
  },
  {
    date: '2024-01-09',
    product: 'Widget C',
    region: 'North',
    sales: 1400,
    quantity: 72,
  },
  {
    date: '2024-01-10',
    product: 'Widget A',
    region: 'South',
    sales: 1600,
    quantity: 85,
  },
  {
    date: '2024-01-11',
    product: 'Widget D',
    region: 'North',
    sales: 1800,
    quantity: 90,
  },
  {
    date: '2024-01-12',
    product: 'Widget D',
    region: 'East',
    sales: 1900,
    quantity: 95,
  },
  {
    date: '2024-01-13',
    product: 'Widget B',
    region: 'West',
    sales: 1700,
    quantity: 60,
  },
  {
    date: '2024-01-14',
    product: 'Widget A',
    region: 'North',
    sales: 1100,
    quantity: 50,
  },
  {
    date: '2024-01-15',
    product: 'Widget C',
    region: 'South',
    sales: 2100,
    quantity: 100,
  },
  {
    date: '2024-01-16',
    product: 'Widget D',
    region: 'West',
    sales: 2200,
    quantity: 110,
  },
  {
    date: '2024-01-17',
    product: 'Widget A',
    region: 'East',
    sales: 1300,
    quantity: 70,
  },
  {
    date: '2024-01-18',
    product: 'Widget B',
    region: 'North',
    sales: 1400,
    quantity: 75,
  },
  {
    date: '2024-01-19',
    product: 'Widget C',
    region: 'East',
    sales: 1600,
    quantity: 80,
  },
  {
    date: '2024-01-20',
    product: 'Widget D',
    region: 'South',
    sales: 2000,
    quantity: 90,
  },
];

const options = {
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: {
        type: 'number',
        decimals: 2,
        locale: 'en-US',
      },
    },
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string' },
    { field: 'region', label: 'Region', type: 'string' },
    { field: 'date', label: 'Date', type: 'date' },
    { field: 'sales', label: 'Sales', type: 'number' },
    { field: 'quantity', label: 'Quantity', type: 'number' },
  ],
  defaultAggregation: 'sum',
  isResponsive: true,
  groupConfig: {
    rowFields: ['product'],
    columnFields: ['region'],
    grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
  },
  formatting: {
    sales: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
    quantity: {
      type: 'number',
      decimals: 2,
      locale: 'en-US',
    },
  },
};

// Dynamic configuration storage
let dynamicConfig = {
  rowHeight: 40,
  columnWidths: {},
  currentRowDimension: 'product',
  currentColumnDimension: 'region',
  responsive: true,
};

const pivotTable = document.getElementById('pivotTable');
pivotTable.data = originalData;
pivotTable.options = options;

pivotTable.addEventListener('stateChange', e => {
  const state = e.detail;
  updateCustomView(state);
  updateDebugView(state);
});

// Basic Operations
window.handleSort = () => {
  pivotTable.sort('sales', 'desc');
};

window.handleFilter = () => {
  const filters = [{ field: 'product', operator: 'equals', value: 'Widget A' }];
  pivotTable.setAttribute('filters', JSON.stringify(filters));
};

window.handleReset = () => {
  pivotTable.refresh();
};

window.toggleToolbar = () => {
  pivotTable.toggleToolbar();
};

window.toggleResponsive = () => {
  dynamicConfig.responsive = !dynamicConfig.responsive;
  pivotTable.responsive = dynamicConfig.responsive;
};

// Measures & Dimensions
window.changeMeasure = () => {
  const selectedMeasure = document.getElementById('measureSelect').value;
  const measures = [
    {
      uniqueName: selectedMeasure,
      caption: selectedMeasure === 'sales' ? 'Total Sales' : 'Total Quantity',
      aggregation: 'sum',
      format:
        selectedMeasure === 'sales'
          ? { type: 'currency', currency: 'USD', locale: 'en-US', decimals: 2 }
          : { type: 'number', decimals: 2, locale: 'en-US' },
    },
  ];
  pivotTable.setMeasures(measures);
};

window.changeDimension = () => {
  const selectedDimension = document.getElementById('dimensionSelect').value;
  dynamicConfig.currentRowDimension = selectedDimension;
  const dimensions = [
    { field: selectedDimension, label: selectedDimension, type: 'string' },
  ];
  pivotTable.setDimensions(dimensions);
};

window.changeAggregation = () => {
  const selectedAggregation =
    document.getElementById('aggregationSelect').value;
  pivotTable.setAggregation(selectedAggregation);
};

// Row Operations
window.expandAllRows = () => {
  pivotTable.expandAllRows();
};

window.collapseAllRows = () => {
  pivotTable.collapseAllRows();
};

window.toggleRowExpansion = () => {
  pivotTable.toggleRowExpansion('row-0');
};

window.resizeRow = () => {
  const height = parseInt(document.getElementById('rowHeight').value);
  dynamicConfig.rowHeight = height;
  pivotTable.resizeRow(0, height);
  // Force refresh custom view to apply new row height
  const state = pivotTable.getState();
  if (state) updateCustomView(state);
};

// Column Operations
window.setColumnWidth = () => {
  const columnName = document.getElementById('columnName').value;
  const width = parseInt(document.getElementById('columnWidth').value);
  dynamicConfig.columnWidths[columnName] = width;
  pivotTable.setColumnWidth(columnName, width);
  // Force refresh custom view to apply new column width
  const state = pivotTable.getState();
  if (state) updateCustomView(state);
};

window.dragColumns = () => {
  pivotTable.dragColumn(0, 1);
};

// Pagination
window.setPagination = () => {
  const pageSize = parseInt(document.getElementById('pageSize').value);
  const currentPage = parseInt(document.getElementById('currentPage').value);
  const paginationConfig = { pageSize, currentPage };
  pivotTable.setAttribute('pagination', JSON.stringify(paginationConfig));
};

// Data Operations
window.loadSampleData = () => {
  pivotTable.data = originalData;
};

window.addRandomData = () => {
  const newData = [...originalData];
  const products = ['Widget E', 'Widget F'];
  const regions = ['Central', 'Northeast'];

  for (let i = 0; i < 5; i++) {
    newData.push({
      date: `2024-02-${String(i + 1).padStart(2, '0')}`,
      product: products[Math.floor(Math.random() * products.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      sales: Math.floor(Math.random() * 2000) + 500,
      quantity: Math.floor(Math.random() * 100) + 10,
    });
  }
  pivotTable.data = newData;
};

window.loadFromFile = () => {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (file) {
    pivotTable
      .loadFromFile(file)
      .then(() => {
        console.log('File loaded successfully');
      })
      .catch(error => {
        console.error('Error loading file:', error);
      });
  }
};

// Export Operations
window.handleExportHTML = () => {
  pivotTable.exportToHTML('pivot-demo');
};

window.handleExportPDF = () => {
  pivotTable.exportToPDF('pivot-demo');
};

window.handleExportExcel = () => {
  pivotTable.exportToExcel('pivot-demo');
};

window.handlePrint = () => {
  pivotTable.openPrintDialog();
};

// Initialize
customElements.whenDefined('pivot-head').then(() => {
  const state = pivotTable.getState();
  updateCustomView(state);
});

function updateCustomView(state) {
  if (
    !state?.data ||
    !state?.rows ||
    !state?.columns ||
    !state?.selectedMeasures
  )
    return;
  console.log(state);
  const { data, rows, columns, selectedMeasures, formatting, groups } = state;
  const customTable = document.getElementById('customTable');

  if (data.length === 0 || !rows.length || !columns.length) {
    customTable.innerHTML = '<div>No data to display</div>';
    return;
  }

  // Dynamic dimension extraction
  const rowField = rows[0]?.uniqueName || dynamicConfig.currentRowDimension;
  const columnField =
    columns[0]?.uniqueName || dynamicConfig.currentColumnDimension;

  const uniqueColumns = [...new Set(data.map(item => item[columnField]))];
  const uniqueRows = [...new Set(data.map(item => item[rowField]))];

  const formatValue = (value, formatConfig) => {
    if (value === 0) return '$0.00';
    if (!value && value !== 0) return '';

    if (formatConfig && formatConfig.type === 'currency') {
      return new Intl.NumberFormat(formatConfig.locale, {
        style: 'currency',
        currency: formatConfig.currency,
        minimumFractionDigits: formatConfig.decimals,
        maximumFractionDigits: formatConfig.decimals,
      }).format(value);
    } else if (formatConfig && formatConfig.type === 'number') {
      return new Intl.NumberFormat(formatConfig.locale, {
        minimumFractionDigits: formatConfig.decimals,
        maximumFractionDigits: formatConfig.decimals,
      }).format(value);
    }

    return String(value);
  };

  const table = document.createElement('table');
  // Dynamic table styling based on configuration
  const tableWidth = dynamicConfig.responsive ? '100%' : 'auto';
  table.style.cssText = `
    border-collapse: collapse;
    width: ${tableWidth};
    font-family: Arial, sans-serif;
  `;

  const thead = document.createElement('thead');
  const firstHeaderRow = document.createElement('tr');
  // Dynamic row height application
  firstHeaderRow.style.height = `${dynamicConfig.rowHeight}px`;

  const cornerHeader = document.createElement('th');
  cornerHeader.setAttribute('rowspan', '2');
  // Dynamic corner header width
  const cornerWidth = dynamicConfig.columnWidths[rowField] || 'auto';
  cornerHeader.style.cssText = `
    background-color: #f2f2f2;
    border: 1px solid #ddd;
    padding: 8px;
    font-weight: bold;
    text-align: center;
    width: ${cornerWidth}px;
    height: ${dynamicConfig.rowHeight * 2}px;
  `;
  // Dynamic corner header content
  const rowCaption = rows[0]?.caption || rowField;
  const columnCaption = columns[0]?.caption || columnField;
  cornerHeader.innerHTML = `${rowCaption} /<br>${columnCaption}`;
  firstHeaderRow.appendChild(cornerHeader);

  uniqueColumns.forEach(column => {
    const regionHeader = document.createElement('th');
    regionHeader.setAttribute('colspan', selectedMeasures.length.toString());
    // Dynamic column width
    const columnWidth = dynamicConfig.columnWidths[column] || 'auto';
    regionHeader.style.cssText = `
      background-color: #f2f2f2;
      border: 1px solid #ddd;
      padding: 8px;
      font-weight: bold;
      text-align: center;
      border-bottom: none;
      width: ${columnWidth}px;
      height: ${dynamicConfig.rowHeight}px;
    `;
    regionHeader.textContent = column;
    firstHeaderRow.appendChild(regionHeader);
  });

  thead.appendChild(firstHeaderRow);

  const secondHeaderRow = document.createElement('tr');
  secondHeaderRow.style.height = `${dynamicConfig.rowHeight}px`;
  uniqueColumns.forEach(column => {
    selectedMeasures.forEach(measure => {
      const measureHeader = document.createElement('th');
      // Dynamic measure header width
      const measureWidth =
        dynamicConfig.columnWidths[measure.uniqueName] || 'auto';
      measureHeader.style.cssText = `
        background-color: #f2f2f2;
        border: 1px solid #ddd;
        padding: 8px;
        font-weight: bold;
        text-align: center;
        border-top: none;
        position: relative;
        width: ${measureWidth}px;
        height: ${dynamicConfig.rowHeight}px;
      `;
      measureHeader.innerHTML = `${measure.caption || measure.uniqueName}<span style="position: absolute; right: 4px; opacity: 0.5;">↕</span>`;
      secondHeaderRow.appendChild(measureHeader);
    });
  });

  thead.appendChild(secondHeaderRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  uniqueRows.forEach(row => {
    const tr = document.createElement('tr');
    tr.style.height = `${dynamicConfig.rowHeight}px`;

    const rowHeader = document.createElement('td');
    // Dynamic row header width
    const rowHeaderWidth = dynamicConfig.columnWidths[rowField] || 'auto';
    rowHeader.style.cssText = `
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      font-weight: bold;
      background-color: #f9f9f9;
      width: ${rowHeaderWidth}px;
      height: ${dynamicConfig.rowHeight}px;
    `;
    rowHeader.textContent = row;
    tr.appendChild(rowHeader);

    uniqueColumns.forEach(column => {
      const group = groups
        ? groups.find(g => g.key === `${row} - ${column}`)
        : null;

      selectedMeasures.forEach(measure => {
        const measureKey = `sum_${measure.uniqueName}`;
        let value = group ? group.aggregates[measureKey] : 0;

        const td = document.createElement('td');
        // Dynamic cell width
        const cellWidth =
          dynamicConfig.columnWidths[measure.uniqueName] || 'auto';
        td.style.cssText = `
          border: 1px solid #ddd;
          padding: 8px;
          text-align: right;
          width: ${cellWidth}px;
          height: ${dynamicConfig.rowHeight}px;
        `;

        const formattedValue = formatValue(
          value,
          formatting ? formatting[measure.uniqueName] : null
        );
        td.textContent = formattedValue;
        tr.appendChild(td);
      });
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  customTable.innerHTML = '';
  customTable.appendChild(table);
}

function updateDebugView(state) {
  const debugElement = document.getElementById('stateDebug');
  const debugInfo = {
    ...state,
    dynamicConfig: dynamicConfig,
  };
  debugElement.textContent = JSON.stringify(debugInfo, null, 2);
}
