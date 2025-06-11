import '@mindfiredigital/pivothead-web-component';
import { originalData, options } from './config';

// declared pivot head globally
let pivot;

//starting of the event
window.addEventListener('DOMContentLoaded', () => {
  customElements.whenDefined('pivot-head').then(() => {
    // Assign to the global 'pivot' variable
    pivot = document.querySelector('pivot-head');
    if (!pivot) {
      console.error('Could not find the <pivot-head> element!');
      return;
    }
    console.log('Found pivot element:', pivot);

    console.log('Setting options...', options);
    pivot.data = originalData;

    console.log('Setting options...', options);
    pivot.options = options;

    pivot.addEventListener('stateChange', e => {
      const updatedState = e.detail;
      console.log('State changed:', updatedState);
      renderTable(updatedState);
    });

    setRowColumnGroups();
  });
});

function setRowColumnGroups() {
  const productGroups = [
    ...new Set(originalData.map(item => item.product)),
  ].map(product => ({
    key: product,
    items: originalData.filter(item => item.product === product),
    aggregates: {},
    level: 0,
  }));
  pivot.setRowGroups(productGroups);

  const regionGroups = [...new Set(originalData.map(item => item.region))].map(
    region => ({
      key: region,
      items: originalData.filter(item => item.region === region),
      aggregates: {},
      level: 0,
    })
  );
  pivot.setColumnGroups(regionGroups);
}

//render Table
// function renderTable(state) {
//   if (!state || !state.processedData || !state.rows || !state.columns) {
//     console.error("State object is incomplete or invalid.");
//     return;
//   }

//   const tableContainer = document.getElementById("myTable");
//   tableContainer.innerHTML = "";

//   const rowDimension = state.rows[0];
//   const colDimension = state.columns[0];
//   const measures = state.measures;
//   const rowGroups = state.rowGroups;
//   const columnGroups = state.columnGroups;
//   const grandTotals = state.processedData.totals;
//   const formattingRules = state.formatting;

//   // const formatValue = (value, measureUniqueName) => {
//   //   if (value === null || value === undefined) return "";
//   //   const rule = state.formatting[measureUniqueName];
//   //   if (!rule) return value.toLocaleString();

//   //   try {
//   //     // --- ⬇️ FINAL CORRECTED LOGIC ⬇️ ---
//   //     const options = {
//   //       minimumFractionDigits: rule.decimals,
//   //       maximumFractionDigits: rule.decimals,
//   //     };

//   //     // Map your custom type to the valid Intl.NumberFormat style
//   //     if (rule.type === 'currency') {
//   //       options.style = 'currency';
//   //       options.currency = rule.currency || 'USD';
//   //     } else if (rule.type === 'percentage') {
//   //       options.style = 'percent';
//   //     } else {
//   //       // Default to a plain number format
//   //       options.style = 'decimal';
//   //     }

//   //     return new Intl.NumberFormat(rule.locale || 'en-US', options).format(value);

//   //   } catch (e) {
//   //     console.error(`Error formatting value for ${measureUniqueName}:`, e);
//   //     return value.toLocaleString(); // Fallback to a simple string
//   //   }
//   // };

//   const dataMap = new Map(state.groups.map((g) => [g.key, g.aggregates]));

//   const table = document.createElement("table");
//   table.className = "pivot-table";
//   const thead = table.createTHead();
//   const tbody = table.createTBody();
//   const tfoot = table.createTFoot();

//   const headerRow1 = thead.insertRow();
//   const headerRow2 = thead.insertRow();
//   const cornerCell = document.createElement("th");
//   cornerCell.textContent = `${rowDimension.caption} / ${colDimension.caption}`;
//   headerRow1.appendChild(cornerCell);

//   // Build Column Headers and make them draggable
//   columnGroups.forEach((cGroup, index) => {
//     const th = document.createElement("th");
//     th.textContent = cGroup.key;
//     th.colSpan = measures.length;
//     // ✅ MAKE THE COLUMN HEADER DRAGGABLE AND ADD INDEX
//     th.draggable = true;
//     th.dataset.columnIndex = index;
//     headerRow1.appendChild(th);
//   });

//   const grandTotalHeader1 = document.createElement("th");
//   grandTotalHeader1.textContent = "Grand Total";
//   grandTotalHeader1.colSpan = measures.length;
//   headerRow1.appendChild(grandTotalHeader1);

//   const cornerCell2 = document.createElement("th");
//   headerRow2.appendChild(cornerCell2);

//   const addMeasureHeaders = () => {
//     measures.forEach((measure) => {
//       const th = document.createElement("th");
//       th.textContent = measure.caption;
//       headerRow2.appendChild(th);
//     });
//   };
//   columnGroups.forEach(addMeasureHeaders);
//   addMeasureHeaders();

//   // Build Table Body rows and make them draggable
//   rowGroups.forEach((rGroup, index) => {
//     const row = tbody.insertRow();
//     // ✅ MAKE THE ENTIRE ROW DRAGGABLE AND ADD INDEX
//     row.draggable = true;
//     row.dataset.rowIndex = index;

//     const rowHeaderCell = row.insertCell();
//     rowHeaderCell.textContent = rGroup.key;
//     rowHeaderCell.className = "row-header";

//     console.log("row Groups", rowGroups)

//     let rowTotals = {};
//     // columnGroups.forEach((cGroup) => {
//     //   const key = `${rGroup.key} - ${cGroup.key}`;
//     //   const aggregateData = dataMap.get(key);
//     //   measures.forEach((measure) => {
//     //     const value = aggregateData ? aggregateData[`sum_${measure.uniqueName}`] : null;
//     //     const cell = row.insertCell();
//     //     cell.textContent = formatValue(value, measure.uniqueName);
//     //     if (value !== null) {
//     //       rowTotals[measure.uniqueName] = (rowTotals[measure.uniqueName] || 0) + value;
//     //     }
//     //   });
//     // });
//     // measures.forEach((measure) => {
//     //   const cell = row.insertCell();
//     //   cell.className = "grand-total-col";
//     //   cell.textContent = formatValue(rowTotals[measure.uniqueName], measure.uniqueName);
//     // });

//     measures.forEach(m => { rowTotals[m.uniqueName] = 0; });

//     columnGroups.forEach((cGroup) => {
//       const key = `${rGroup.key} - ${cGroup.key}`;
//       const aggregateData = dataMap.get(key);
//       measures.forEach((measure) => {
//         const value = aggregateData ? aggregateData[`sum_${measure.uniqueName}`] : 0;
//         const cell = row.insertCell();
//         // ✅ CHANGED: Use the component's formatValue method.
//         cell.textContent = pivot.formatValue(value, measure.uniqueName);
//         rowTotals[measure.uniqueName] += value || 0;
//       });
//     });

//     measures.forEach((measure) => {
//       const cell = row.insertCell();
//       cell.className = "grand-total-col";
//       // ✅ CHANGED: Use the component's formatValue method.
//       cell.textContent = pivot.formatValue(rowTotals[measure.uniqueName], measure.uniqueName);
//     });
//   });

//   const footerRow = tfoot.insertRow();
//   footerRow.className = "grand-total-row";
//   const footerHeader = document.createElement("td");
//   footerHeader.textContent = "Grand Total";
//   footerHeader.className = "row-header";
//   footerRow.appendChild(footerHeader);

//   // columnGroups.forEach((cGroup) => {
//   //   measures.forEach((measure) => {
//   //     const colTotal = cGroup.items.reduce((sum, item) => sum + (item[measure.uniqueName] || 0), 0);
//   //     const cell = footerRow.insertCell();
//   //     cell.textContent = formatValue(colTotal, measure.uniqueName);
//   //   });
//   // });
//   // measures.forEach(measure => {
//   //   const grandTotalValue = grandTotals[measure.uniqueName];
//   //   const cell = footerRow.insertCell();
//   //   cell.textContent = formatValue(grandTotalValue, measure.uniqueName);
//   // });

//   columnGroups.forEach((cGroup) => {
//     measures.forEach((measure) => {
//       const colTotal = cGroup.items.reduce((sum, item) => sum + (item[measure.uniqueName] || 0), 0);
//       const cell = footerRow.insertCell();
//       // ✅ CHANGED: Use the component's formatValue method.
//       cell.textContent = pivot.formatValue(colTotal, measure.uniqueName);
//     });
//   });

//   measures.forEach(measure => {
//     const grandTotalValue = grandTotals[`sum_${measure.uniqueName}`];
//     const cell = footerRow.insertCell();
//     // ✅ CHANGED: Use the component's formatValue method.
//     cell.textContent = pivot.formatValue(grandTotalValue, measure.uniqueName);
//   });

//   tableContainer.appendChild(table);

//   // ✅ CALL THE SETUP FUNCTION AFTER THE TABLE IS IN THE DOM
//   setupDragAndDrop();
// }

/**
 * Renders the entire pivot table based on the component's state.
 */
function renderTable(state) {
  if (!state || !state.processedData) {
    console.error('State object is incomplete or invalid.');
    return;
  }

  const tableContainer = document.getElementById('myTable');
  tableContainer.innerHTML = '';

  const {
    rows: rowConfigs,
    columns: colConfigs,
    measures,
    rowGroups,
    columnGroups,
    processedData,
  } = state;
  const grandTotals = processedData.totals;
  const rowDimension = rowConfigs[0];
  const colDimension = colConfigs[0];

  const dataMap = new Map(state.groups.map(g => [g.key, g.aggregates]));

  const table = document.createElement('table');
  table.className = 'pivot-table';
  const thead = table.createTHead();
  const tbody = table.createTBody();
  const tfoot = table.createTFoot();

  // Header Row 1 (Column Group Names)
  const headerRow1 = thead.insertRow();
  const cornerCell = document.createElement('th');
  cornerCell.rowSpan = 2;
  cornerCell.textContent = `${rowDimension.caption} / ${colDimension.caption}`;
  headerRow1.appendChild(cornerCell);

  columnGroups.forEach((cGroup, index) => {
    const th = document.createElement('th');
    th.textContent = cGroup.key;
    th.colSpan = measures.length;
    th.draggable = true;
    th.dataset.columnIndex = index;
    headerRow1.appendChild(th);
  });

  const grandTotalHeader1 = document.createElement('th');
  grandTotalHeader1.textContent = 'Grand Total';
  grandTotalHeader1.colSpan = measures.length;
  headerRow1.appendChild(grandTotalHeader1);

  // Header Row 2 (Measure Names)
  const headerRow2 = thead.insertRow();
  const addMeasureHeaders = () => {
    measures.forEach(measure => {
      const th = document.createElement('th');
      th.textContent = measure.caption;
      headerRow2.appendChild(th);
    });
  };
  columnGroups.forEach(addMeasureHeaders);
  addMeasureHeaders(); // For Grand Total

  // Table Body (Data Rows)
  rowGroups.forEach((rGroup, index) => {
    const row = tbody.insertRow();
    row.draggable = true;
    row.dataset.rowIndex = index;

    const rowHeaderCell = row.insertCell();
    rowHeaderCell.textContent = rGroup.key;
    rowHeaderCell.className = 'row-header';

    let rowTotals = {};
    measures.forEach(m => {
      rowTotals[m.uniqueName] = 0;
    });

    columnGroups.forEach(cGroup => {
      const key = `${rGroup.key} - ${cGroup.key}`;
      const aggregateData = dataMap.get(key);
      measures.forEach(measure => {
        const value = aggregateData
          ? aggregateData[`sum_${measure.uniqueName}`]
          : 0;
        const cell = row.insertCell();
        cell.textContent = pivot.formatValue(value, measure.uniqueName);
        rowTotals[measure.uniqueName] += value || 0;
      });
    });

    measures.forEach(measure => {
      const cell = row.insertCell();
      cell.className = 'grand-total-col';
      cell.textContent = pivot.formatValue(
        rowTotals[measure.uniqueName],
        measure.uniqueName
      );
    });
  });

  // Table Footer (Grand Totals)
  const footerRow = tfoot.insertRow();
  footerRow.className = 'grand-total-row';
  const footerHeader = document.createElement('td');
  footerHeader.textContent = 'Grand Total';
  footerHeader.className = 'row-header';
  footerRow.appendChild(footerHeader);

  columnGroups.forEach(cGroup => {
    measures.forEach(measure => {
      const colTotal = cGroup.items.reduce(
        (sum, item) => sum + (item[measure.uniqueName] || 0),
        0
      );
      const cell = footerRow.insertCell();
      cell.textContent = pivot.formatValue(colTotal, measure.uniqueName);
    });
  });

  measures.forEach(measure => {
    // ✅ THIS IS THE FIX: Use the direct measure name as the key.
    const grandTotalValue = grandTotals[measure.uniqueName];
    const cell = footerRow.insertCell();
    cell.textContent = pivot.formatValue(grandTotalValue, measure.uniqueName);
  });

  tableContainer.appendChild(table);
  setupDragAndDrop();
}
//set up drag and drop
function setupDragAndDrop() {
  // --- DRAG COLUMNS ---
  // ✅ SELECTS THE DRAGGABLE HEADERS WE CREATED IN renderTable
  const headers = document.querySelectorAll('th[data-column-index]');
  let draggedColumnIndex = null;

  headers.forEach(header => {
    header.addEventListener('dragstart', e => {
      draggedColumnIndex = parseInt(header.dataset.columnIndex, 10);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'column'); // setData is required for Firefox
      setTimeout(() => header.classList.add('dragging'), 0);
    });

    header.addEventListener('dragend', () =>
      header.classList.remove('dragging')
    );
    header.addEventListener('dragover', e => e.preventDefault());
    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (
        draggedColumnIndex !== null &&
        draggedColumnIndex !== parseInt(header.dataset.columnIndex, 10)
      ) {
        header.classList.add('drag-over');
      }
    });
    header.addEventListener('dragleave', () =>
      header.classList.remove('drag-over')
    );
    header.addEventListener('drop', e => {
      e.preventDefault();
      const dropIndex = parseInt(header.dataset.columnIndex, 10);
      header.classList.remove('drag-over');

      if (draggedColumnIndex !== null && draggedColumnIndex !== dropIndex) {
        console.log(
          `Dragging column from ${draggedColumnIndex} to ${dropIndex}`
        );
        // ✅ Assumes 'pivot' is the global variable for your component
        pivot.dragColumn(draggedColumnIndex, dropIndex);
      }
      draggedColumnIndex = null;
    });
  });

  // --- DRAG ROWS ---
  // ✅ SELECTS THE DRAGGABLE ROWS WE CREATED IN renderTable
  const rows = document.querySelectorAll('tbody tr[data-row-index]');
  let draggedRowIndex = null;

  rows.forEach(row => {
    row.addEventListener('dragstart', e => {
      draggedRowIndex = parseInt(row.dataset.rowIndex, 10);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'row');
      setTimeout(() => row.classList.add('dragging'), 0);
    });

    row.addEventListener('dragend', () => row.classList.remove('dragging'));
    row.addEventListener('dragover', e => e.preventDefault());
    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (
        draggedRowIndex !== null &&
        draggedRowIndex !== parseInt(row.dataset.rowIndex, 10)
      ) {
        row.classList.add('drag-over');
      }
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      const dropIndex = parseInt(row.dataset.rowIndex, 10);
      row.classList.remove('drag-over');

      if (draggedRowIndex !== null && draggedRowIndex !== dropIndex) {
        console.log(`Dragging row from ${draggedRowIndex} to ${dropIndex}`);
        // ✅ Assumes 'pivot' is the global variable for your component
        pivot.dragRow(draggedRowIndex, dropIndex);
      }
      draggedRowIndex = null;
    });
  });
}

//Format Tools
window.openModal = function (id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  // ✅ ADD THIS LINE: Populate the form *before* showing the modal.
  updateModalForm();

  modal.style.display = 'flex';
};

window.closeModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
};

/**
 * Reads the current component state and updates the modal's form fields.
 */
function updateModalForm() {
  if (!pivot) return; // 'pivot' is your global component variable
  const state = pivot.getState();
  const fieldName = document.getElementById('field-select').value;
  const currentFormat = state.formatting[fieldName] || {};

  document.getElementById('format-type').value = currentFormat.type || 'number';
  document.getElementById('decimal-places').value =
    currentFormat.decimals !== undefined ? currentFormat.decimals : 2;
  document.getElementById('currency-code').value =
    currentFormat.currency || 'USD';
  document.getElementById('locale-input').value =
    currentFormat.locale || 'en-US';

  // Also, make sure the currency input is visible if needed
  toggleCurrencyInput();
}

/**
 * Toggles the visibility of the currency input based on the selected format type.
 */
function toggleCurrencyInput() {
  const formatType = document.getElementById('format-type').value;
  const currencyGroup = document.getElementById('currency-symbol-group');
  currencyGroup.style.display = formatType === 'currency' ? 'block' : 'none';
}

/**
 * Reads values from the modal and calls the component's public setFormatting method.
 */
window.applyFormatting = function () {
  if (!pivot) return;

  const fieldName = document.getElementById('field-select').value;
  const formatType = document.getElementById('format-type').value;
  const decimals = parseInt(
    document.getElementById('decimal-places').value,
    10
  );
  const locale = document.getElementById('locale-input').value || 'en-US';
  const currency =
    document.getElementById('currency-code').value.toUpperCase() || 'USD';

  const newFormat = { type: formatType, decimals, locale };
  if (formatType === 'currency') {
    newFormat.currency = currency;
  }

  // ✅ This calls the public method you added to the PivotHeadElement class
  pivot.setFormatting(fieldName, newFormat);
  closeModal('modal1');
  setRowColumnGroups();
};

document.addEventListener('DOMContentLoaded', () => {
  // Hook up cancel button
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').style.display = 'none';
    });
  });

  // Close modal on background click
  window.addEventListener('click', e => {
    document.querySelectorAll('.modal').forEach(modal => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // ✅ Add new listeners for the modal form fields
  const fieldSelect = document.getElementById('field-select');
  const formatTypeSelect = document.getElementById('format-type');

  if (fieldSelect) {
    // When the user chooses a different field, update the form to match
    fieldSelect.addEventListener('change', updateModalForm);
  }
  if (formatTypeSelect) {
    // When the user changes format type, show/hide the currency input
    formatTypeSelect.addEventListener('change', toggleCurrencyInput);
  }
});
