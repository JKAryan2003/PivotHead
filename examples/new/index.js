import '@mindfiredigital/pivothead-web-component';
import { originalData, options } from './config';

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
  renderTable(state);
  updateDebugView(state);
});

// Initialize
customElements.whenDefined('pivot-head').then(() => {
  const state = pivotTable.getState();
  renderTable(state);

  console.log('Pivot table drag functionality initialized');
});

//Refresh Data
window.handleReset = () => {
  pivotTable.refresh();
};

//Handle filters
window.handleFilter = () => {
  const field = document.getElementById('filterField').value;
  const operator = document.getElementById('filterOperator').value;
  const value = document.getElementById('filterValue').value;

  const filters = [{ field: field, operator: operator, value: value }];
  pivotTable.filters = filters;
};

// Add drag event listeners
pivotTable.addEventListener('dragStart', e => {
  console.log('Drag started:', e.detail);
});

pivotTable.addEventListener('dragEnd', e => {
  console.log('Drag ended:', e.detail);
});

pivotTable.addEventListener('rowDragEnd', e => {
  console.log('Row drag completed:', e.detail);
  const { fromIndex, toIndex, newData } = e.detail;
  console.log(`Row moved from ${fromIndex} to ${toIndex}`);
});

pivotTable.addEventListener('columnDragEnd', e => {
  console.log('Column drag completed:', e.detail);
  const { fromIndex, toIndex, newColumns } = e.detail;
  console.log(`Column moved from ${fromIndex} to ${toIndex}`);
});

// Basic Operations
window.handleSort = () => {
  pivotTable.sort('sales', 'desc');
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

// Pagination
window.setPagination = () => {
  const pageSize = parseInt(document.getElementById('pageSize').value);
  const currentPage = parseInt(document.getElementById('currentPage').value);
  const paginationConfig = { pageSize, currentPage };
  pivotTable.setAttribute('pagination', JSON.stringify(paginationConfig));
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

function renderTable(state) {
  try {
    console.log('Current Engine State:', state);

    if (!state.processedData) {
      console.error('No processed data available');
      return;
    }

    console.log('Processed Data Headers:', state.processedData.headers);
    console.log('Processed Data Rows:', state.processedData.rows);

    const tableContainer = document.getElementById('myTable');

    // Clear previous content
    tableContainer.innerHTML = '';

    // Create table element
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    table.style.border = '1px solid #dee2e6';

    // Create table header
    const thead = document.createElement('thead');

    // First header row for regions
    const regionHeaderRow = document.createElement('tr');

    // Add empty cell for top-left corner (Product/Region)
    const cornerCell = document.createElement('th');
    cornerCell.style.padding = '12px';
    cornerCell.style.backgroundColor = '#f8f9fa';
    cornerCell.style.borderBottom = '2px solid #dee2e6';
    cornerCell.style.borderRight = '1px solid #dee2e6';
    cornerCell.textContent = 'Product / Region';
    regionHeaderRow.appendChild(cornerCell);

    // Get unique regions
    const uniqueRegions = [...new Set(state.data.map(item => item.region))];

    // Add region headers with colspan for measures
    uniqueRegions.forEach((region, index) => {
      const th = document.createElement('th');
      th.textContent = region;
      th.colSpan = state.selectedMeasures.length; // Span across all measures
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';
      th.style.textAlign = 'center';
      th.dataset.index = index + 1; // +1 because first cell is corner

      // Make headers draggable
      th.setAttribute('draggable', 'true');
      th.style.cursor = 'move';

      regionHeaderRow.appendChild(th);
    });

    thead.appendChild(regionHeaderRow);

    // Second header row for measures
    const measureHeaderRow = document.createElement('tr');

    // Get current sort configuration
    const currentSortConfig = state.sortConfig?.[0];

    // Add product header with sort icon
    const productHeader = document.createElement('th');
    productHeader.style.padding = '12px';
    productHeader.style.backgroundColor = '#f8f9fa';
    productHeader.style.borderBottom = '2px solid #dee2e6';
    productHeader.style.borderRight = '1px solid #dee2e6';
    productHeader.style.cursor = 'pointer';

    // Create a container for the header content to align text and icon
    const productHeaderContent = document.createElement('div');
    productHeaderContent.style.display = 'flex';
    productHeaderContent.style.alignItems = 'center';

    const productText = document.createElement('span');
    productText.textContent = 'Product';
    productHeaderContent.appendChild(productText);

    // Add sort icon for product
    const productSortIcon = createSortIcon('product', currentSortConfig);
    productHeaderContent.appendChild(productSortIcon);

    productHeader.appendChild(productHeaderContent);

    // Add sort functionality to product header
    productHeader.addEventListener('click', () => {
      const direction =
        currentSortConfig?.field === 'product' &&
        currentSortConfig?.direction === 'asc'
          ? 'desc'
          : 'asc';
      pivotTable.sort('product', direction);
      renderTable();
    });

    measureHeaderRow.appendChild(productHeader);

    // Add measure headers for each region
    uniqueRegions.forEach(region => {
      state.selectedMeasures.forEach(measure => {
        const th = document.createElement('th');
        th.style.padding = '12px';
        th.style.backgroundColor = '#f8f9fa';
        th.style.borderBottom = '2px solid #dee2e6';
        th.style.borderRight = '1px solid #dee2e6';
        th.style.cursor = 'pointer';

        // Create a container for the header content to align text and icon
        const headerContent = document.createElement('div');
        headerContent.style.display = 'flex';
        headerContent.style.alignItems = 'center';
        headerContent.style.justifyContent = 'space-between';

        const measureText = document.createElement('span');
        measureText.textContent = measure.caption;
        headerContent.appendChild(measureText);

        // Add sort icon for measure
        const sortIcon = createSortIcon(measure.uniqueName, currentSortConfig);
        headerContent.appendChild(sortIcon);

        th.appendChild(headerContent);

        // Add sort functionality
        th.addEventListener('click', () => {
          const direction =
            currentSortConfig?.field === measure.uniqueName &&
            currentSortConfig?.direction === 'asc'
              ? 'desc'
              : 'asc';
          pivotTable.sort(measure.uniqueName, direction);
          renderTable();
        });

        measureHeaderRow.appendChild(th);
      });
    });

    thead.appendChild(measureHeaderRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    // Get unique products
    const uniqueProducts = [...new Set(state.data.map(item => item.product))];

    // Add rows for each product
    uniqueProducts.forEach((product, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIndex;
      tr.setAttribute('draggable', 'true');
      tr.style.cursor = 'move';

      const productCell = document.createElement('td');
      productCell.style.fontWeight = 'bold';
      productCell.style.padding = '8px';
      productCell.style.borderBottom = '1px solid #dee2e6';
      productCell.style.display = 'flex';
      productCell.style.alignItems = 'center';
      productCell.style.gap = '8px';

      const rowId = `product-${product}`;
      const isExpanded = pivotTable.isRowExpanded(rowId);

      const toggleIcon = document.createElement('span');
      toggleIcon.textContent = isExpanded ? '▼' : '▶';
      toggleIcon.style.cursor = 'pointer';

      toggleIcon.addEventListener('click', () => {
        pivotTable.toggleRowExpansion(rowId);
        renderTable(pivotTable.getState());
      });

      productCell.appendChild(toggleIcon);

      const productLabel = document.createElement('span');
      productLabel.textContent = product;
      productCell.appendChild(productLabel);

      tr.appendChild(productCell);

      if (!isExpanded) {
        tbody.appendChild(tr);
        return;
      }

      // Add data cells for each region and measure
      uniqueRegions.forEach(region => {
        // Filter data for this product and region
        const filteredData = state.data.filter(
          item => item.product === product && item.region === region
        );

        // Add cells for each measure
        state.selectedMeasures.forEach(measure => {
          const td = document.createElement('td');
          td.style.padding = '8px';
          td.style.borderBottom = '1px solid #dee2e6';
          td.style.borderRight = '1px solid #dee2e6';
          td.style.textAlign = 'right';

          // Calculate the value based on aggregation
          let value = 0;
          if (filteredData.length > 0) {
            switch (measure.aggregation) {
              case 'sum':
                value = filteredData.reduce(
                  (sum, item) => sum + (item[measure.uniqueName] || 0),
                  0
                );
                break;
              case 'avg':
                if (measure.formula) {
                  // Use formula if provided
                  value =
                    filteredData.reduce(
                      (sum, item) => sum + measure.formula(item),
                      0
                    ) / filteredData.length;
                } else {
                  value =
                    filteredData.reduce(
                      (sum, item) => sum + (item[measure.uniqueName] || 0),
                      0
                    ) / filteredData.length;
                }
                break;
              case 'max':
                value = Math.max(
                  ...filteredData.map(item => item[measure.uniqueName] || 0)
                );
                break;
              case 'min':
                value = Math.min(
                  ...filteredData.map(item => item[measure.uniqueName] || 0)
                );
                break;
              default:
                value = 0;
            }
          }

          // Format the value
          let formattedValue = value;
          if (measure.format) {
            if (measure.format.type === 'currency') {
              formattedValue = new Intl.NumberFormat(measure.format.locale, {
                style: 'currency',
                currency: measure.format.currency,
                minimumFractionDigits: measure.format.decimals,
                maximumFractionDigits: measure.format.decimals,
              }).format(value);
            } else if (measure.format.type === 'number') {
              formattedValue = new Intl.NumberFormat(measure.format.locale, {
                minimumFractionDigits: measure.format.decimals,
                maximumFractionDigits: measure.format.decimals,
              }).format(value);
            }
          }

          td.textContent = formattedValue;

          // Apply conditional formatting
          if (
            options.conditionalFormatting &&
            Array.isArray(options.conditionalFormatting)
          ) {
            options.conditionalFormatting.forEach(rule => {
              if (rule.value.type === 'Number' && !isNaN(value)) {
                let applyFormat = false;

                switch (rule.value.operator) {
                  case 'Greater than':
                    applyFormat = value > parseFloat(rule.value.value1);
                    break;
                  case 'Less than':
                    applyFormat = value < parseFloat(rule.value.value1);
                    break;
                  case 'Equal to':
                    applyFormat = value === parseFloat(rule.value.value1);
                    break;
                  case 'Between':
                    applyFormat =
                      value >= parseFloat(rule.value.value1) &&
                      value <= parseFloat(rule.value.value2);
                    break;
                }

                if (applyFormat) {
                  if (rule.format.font) td.style.fontFamily = rule.format.font;
                  if (rule.format.size) td.style.fontSize = rule.format.size;
                  if (rule.format.color) td.style.color = rule.format.color;
                  if (rule.format.backgroundColor)
                    td.style.backgroundColor = rule.format.backgroundColor;
                }
              }
            });
          }

          tr.appendChild(td);
        });
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Update pagination info
    // const paginationState = pivotTable.getPaginationState();
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
      pageInfo.textContent = `Page ${paginationState.currentPage} of ${paginationState.totalPages}`;

      // Update button states
      document.getElementById('prevPage').disabled =
        paginationState.currentPage <= 1;
      document.getElementById('nextPage').disabled =
        paginationState.currentPage >= paginationState.totalPages;
    }

    // Set up drag and drop after rendering
    setupDragAndDrop(state);
  } catch (error) {
    console.error('Error rendering table:', error);

    // Display error message to user
    const tableContainer = document.getElementById('myTable');
    tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error rendering table: ${error.message}</div>`;
  }
}

// Helper function to create sort icons
function createSortIcon(field, currentSortConfig) {
  const sortIcon = document.createElement('span');
  sortIcon.style.marginLeft = '5px';
  sortIcon.style.display = 'inline-block';

  // Check if this field is currently being sorted
  const isCurrentlySorted =
    currentSortConfig && currentSortConfig.field === field;

  if (isCurrentlySorted) {
    // Show the appropriate icon based on sort direction
    if (currentSortConfig.direction === 'asc') {
      sortIcon.innerHTML = '&#9650;'; // Up arrow
      sortIcon.title = 'Sorted ascending';
    } else {
      sortIcon.innerHTML = '&#9660;'; // Down arrow
      sortIcon.title = 'Sorted descending';
    }
    sortIcon.style.color = '#007bff'; // Highlight the active sort
  } else {
    // Show a neutral icon for unsorted fields
    sortIcon.innerHTML = '&#8693;'; // Up/down arrow
    sortIcon.title = 'Click to sort';
    sortIcon.style.color = '#6c757d';
    sortIcon.style.opacity = '0.5';
  }

  return sortIcon;
}

// Add this function to set up drag and drop functionality
function setupDragAndDrop(state) {
  // DRAG COLUMNS
  const headers = document.querySelectorAll('th[draggable="true"]');
  let draggedColumnIndex = null;

  headers.forEach((header, index) => {
    header.dataset.index = index;

    header.addEventListener('dragstart', e => {
      draggedColumnIndex = parseInt(header.dataset.index);
      e.dataTransfer.setData('type', 'column');
      setTimeout(() => header.classList.add('dragging'), 0);
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
    });

    header.addEventListener('dragover', e => e.preventDefault());

    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedColumnIndex !== null) header.classList.add('drag-over');
    });

    header.addEventListener('dragleave', () => {
      header.classList.remove('drag-over');
    });

    header.addEventListener('drop', e => {
      e.preventDefault();
      const dropIndex = parseInt(header.dataset.index);
      header.classList.remove('drag-over');

      const dragType = e.dataTransfer.getData('type');
      if (
        dragType === 'column' &&
        draggedColumnIndex !== null &&
        dropIndex !== null &&
        draggedColumnIndex !== dropIndex
      ) {
        console.log(
          `Dragging column from ${draggedColumnIndex} to ${dropIndex}`
        );
        pivotTable.dragColumn(draggedColumnIndex, dropIndex);
        renderTable(pivotTable.getState());
      }

      draggedColumnIndex = null;
    });
  });

  // DRAG ROWS
  const rows = document.querySelectorAll('tbody tr');
  let draggedRowIndex = null;

  rows.forEach((row, index) => {
    row.dataset.rowIndex = index;

    row.addEventListener('dragstart', e => {
      draggedRowIndex = index;
      e.dataTransfer.setData('type', 'row');
      setTimeout(() => row.classList.add('dragging'), 0);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
    });

    row.addEventListener('dragover', e => e.preventDefault());

    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedRowIndex !== null && draggedRowIndex !== index) {
        row.classList.add('drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });

    row.addEventListener('drop', e => {
      e.preventDefault();
      const dropIndex = index;
      row.classList.remove('drag-over');

      const dragType = e.dataTransfer.getData('type');
      if (
        dragType === 'row' &&
        draggedRowIndex !== null &&
        dropIndex !== null &&
        draggedRowIndex !== dropIndex
      ) {
        console.log(`Dragging row from ${draggedRowIndex} to ${dropIndex}`);
        pivotTable.dragRow(draggedRowIndex, dropIndex);
        renderTable(pivotTable.getState());
      }

      draggedRowIndex = null;
    });
  });
}

function updateDebugView(state) {
  const debugElement = document.getElementById('stateDebug');
  const debugInfo = {
    ...state,
    dynamicConfig: dynamicConfig,
  };
  debugElement.textContent = JSON.stringify(debugInfo, null, 2);
}
