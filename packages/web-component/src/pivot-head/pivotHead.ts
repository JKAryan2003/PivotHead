import { PivotEngine } from '@mindfiredigital/pivothead';
import type {
  PivotTableConfig,
  FilterConfig,
  PivotTableState,
  Dimension,
  GroupConfig,
  MeasureConfig,
  AggregationType,
  Group,
} from '@mindfiredigital/pivothead';

/**
 * Enhanced interface extending PivotEngine with additional methods
 * This ensures type safety when casting the engine instance
 */
interface EnhancedPivotEngine<T extends Record<string, any>>
  extends PivotEngine<T> {
  applyFilters(filters: FilterConfig[]): void;
  setMeasures(measures: MeasureConfig[]): void;
  setDimensions(dimensions: Dimension[]): void;
  getFilterState(): FilterConfig[];
  reset(): void;
  sort(field: string, direction: 'asc' | 'desc'): void;
  setGroupConfig(config: GroupConfig | null): void;
  setAggregation(type: AggregationType): void;
  formatValue(value: any, field: string): string;
  getGroupedData(): Group[];
  exportToHTML(fileName: string): void;
  exportToPDF(fileName: string): void;
  exportToExcel(fileName: string): void;
  openPrintDialog(): void;
  // Drag methods from core
  dragRow(fromIndex: number, toIndex: number): void;
  dragColumn(fromIndex: number, toIndex: number): void;
  setRowGroups(rowGroups: any): void;
  setColumnGroups(columnGroups: any): void;
  toggleRowExpansion(rowId: string): void;
  isRowExpanded(rowId: string): boolean;
}

/**
 * PivotHead Web Component
 *
 * A custom HTML element that wraps the PivotEngine to provide pivot table functionality
 * through HTML attributes and DOM events with drag and drop support.
 *
 * Supported attributes:
 * - data: JSON string containing the table data
 * - options: JSON string containing pivot table configuration options
 * - filters: JSON string containing filter configurations
 * - enable-drag-rows: Enable row drag and drop (boolean attribute)
 * - enable-drag-columns: Enable column drag and drop (boolean attribute)
 *
 * Usage:
 * <pivot-head
 *   data='[{"name":"John","sales":100}]'
 *   options='{"rows":[{"uniqueName":"name"}]}'
 *   filters='[{"field":"sales","operator":"greaterThan","value":50}]'
 *   enable-drag-rows
 *   enable-drag-columns>
 * </pivot-head>
 */
export class PivotHeadElement extends HTMLElement {
  // Core engine instance that handles all pivot table logic
  private engine!: EnhancedPivotEngine<any>;

  // Track initialization state to prevent multiple initializations
  private initialized = false;

  // Internal data storage
  private _data: any[] = [];
  private _options: any = {};
  private _filters: FilterConfig[] = [];
  private _rowGroups: any[] = [];
  private _columnGroups: any[] = [];

  /**
   * Define which attributes should trigger attributeChangedCallback
   */
  static get observedAttributes() {
    return ['data', 'options', 'filters'];
  }

  constructor() {
    super();
  }

  /**
   * Getter and setter for data property
   */
  set data(value: any[]) {
    this._data = value;
    this.reinitialize();
  }

  get data(): any[] {
    return this._data;
  }

  /**
   * Getter and setter for options property
   */
  set options(value: any) {
    this._options = value;
    this.reinitialize();
  }

  get options(): any {
    return this._options;
  }

  /**
   * Getter and setter for filters property
   */
  set filters(value: FilterConfig[]) {
    this._filters = value;
    this.setAttribute('filters', JSON.stringify(value));
    if (this.engine) {
      this.engine.applyFilters(value);
      this.notifyStateChange();
    }
  }

  get filters(): FilterConfig[] {
    return this._filters;
  }

  /**
   * Reinitializes the engine with current data and options
   */
  private reinitialize() {
    if (this._data && this._options) {
      // const config: PivotTableConfig<any> = {
      //   data: this._data,
      //   ...this._options,
      // };

      const config: PivotTableConfig<any> = {
        data: this._data,
        rowGroups: this._rowGroups,
        columnGroups: this._columnGroups,
        ...this._options,
      };

      this.engine = new PivotEngine(config) as EnhancedPivotEngine<any>;

      // Apply any existing filters after engine initialization
      if (this._filters.length > 0) {
        this.engine.applyFilters(this._filters);
      }

      this.notifyStateChange();
    }
  }

  /**
   * Initialize the component when it's first connected to the DOM
   */
  private initialize() {
    // Parse data attribute
    const rawData = this.getAttribute('data');
    if (rawData && !this._data.length) {
      try {
        this._data = JSON.parse(rawData);
      } catch (error) {
        console.error('Error parsing data attribute:', error);
        return;
      }
    }

    // Parse options attribute
    const rawOptions = this.getAttribute('options');
    if (rawOptions && Object.keys(this._options).length === 0) {
      try {
        this._options = JSON.parse(rawOptions);
      } catch (error) {
        console.error('Error parsing options attribute:', error);
        return;
      }
    }

    // Parse filters attribute
    const rawFilters = this.getAttribute('filters');
    if (rawFilters) {
      try {
        this._filters = JSON.parse(rawFilters);
      } catch (error) {
        console.error('Error parsing filters attribute:', error);
      }
    }

    this.reinitialize();
  }

  /**
   * Initialize only when both required attributes are present
   */
  private initializeWhenReady() {
    const dataAttr = this.getAttribute('data');
    const optionsAttr = this.getAttribute('options');

    if (dataAttr && optionsAttr) {
      this.initialize();
      this.initialized = true;
    }
  }

  /**
   * Called when element is added to the DOM
   */
  connectedCallback() {
    this.initializeWhenReady();
  }

  /**
   * Called when observed attributes change
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log('old value', oldValue, 'newValue', newValue);
    if (oldValue === newValue) return;

    switch (name) {
      case 'data':
      case 'options':
        if (!this.initialized) {
          this.initializeWhenReady();
        } else {
          this.updateConfig();
        }
        break;

      case 'filters':
        this.updateFilters(newValue);
        break;
    }
  }

  /**
   * Updates configuration when data or options attributes change
   */
  private updateConfig() {
    const rawData = this.getAttribute('data');
    if (rawData) {
      try {
        this._data = JSON.parse(rawData);
      } catch (error) {
        console.error('Error parsing updated data attribute:', error);
        return;
      }
    }

    const rawOptions = this.getAttribute('options');
    if (rawOptions) {
      try {
        this._options = JSON.parse(rawOptions);
      } catch (error) {
        console.error('Error parsing updated options attribute:', error);
        return;
      }
    }

    this.reinitialize();
  }

  /**
   * Updates filters when filters attribute changes
   */
  private updateFilters(filtersJson: string) {
    if (!filtersJson) {
      this._filters = [];
    } else {
      try {
        this._filters = JSON.parse(filtersJson);
      } catch (error) {
        console.error('Error updating filters:', error);
        this._filters = [];
      }
    }

    if (this.engine) {
      this.engine.applyFilters(this._filters);
      this.notifyStateChange();
    }
  }

  /**
   * Dispatches a custom event with the current state
   */
  private notifyStateChange() {
    if (!this.engine) return;

    const state = this.engine.getState();

    this.dispatchEvent(
      new CustomEvent('stateChange', {
        detail: state,
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API methods for programmatic control

  /**
   * Get the current state of the pivot table
   */
  public getState(): PivotTableState<any> {
    if (!this.engine) {
      throw new Error('Engine not initialized');
    }
    return this.engine.getState();
  }

  /**
   * Reset the pivot table to its initial state
   */
  public refresh(): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this._filters = [];
    this.engine.applyFilters([]);
    this.engine.reset();
    this.removeAttribute('filters');
    this.notifyStateChange();
  }

  /**
   * Sort the pivot table by a specific field
   */
  public sort(field: string, direction: 'asc' | 'desc'): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.sort(field, direction);
    this.notifyStateChange();
  }

  /**
   * Set measures for the pivot table
   */
  public setMeasures(measures: MeasureConfig[]): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setMeasures(measures);
    this.notifyStateChange();
  }

  /**
   * Set dimensions for the pivot table
   */
  public setDimensions(dimensions: Dimension[]): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setDimensions(dimensions);
    this.notifyStateChange();
  }

  /**
   * Set grouping configuration
   */
  public setGroupConfig(groupConfig: GroupConfig | null): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setGroupConfig(groupConfig);
    this.notifyStateChange();
  }

  /**
   * Set aggregation type for measures
   */
  public setAggregation(type: AggregationType): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setAggregation(type);
    this.notifyStateChange();
  }

  /**
   * Format a value according to field formatting rules
   */
  public formatValue(value: any, field: string): string {
    if (!this.engine) {
      console.error('Engine not initialized');
      return String(value);
    }

    return this.engine.formatValue(value, field);
  }

  /**
   * Get grouped data from the pivot table
   */
  public getGroupedData(): Group[] {
    if (!this.engine) {
      console.error('Engine not initialized');
      return [];
    }

    return this.engine.getGroupedData();
  }

  /**
   * Get current filter state
   */
  public getFilters(): FilterConfig[] {
    return this._filters;
  }

  /**
   * Get the raw data from the pivot table
   */
  public getData(): any[] {
    if (!this.engine) {
      console.error('Engine not initialized');
      return [];
    }

    return this.engine.getState().data;
  }

  /**
   * Get the processed data (headers, rows, totals)
   */
  public getProcessedData(): any {
    if (!this.engine) {
      console.error('Engine not initialized');
      return null;
    }

    return this.engine.getState().processedData;
  }

  // Export methods

  /**
   * Export pivot table to HTML format
   */
  public exportToHTML(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to HTML.');
      return;
    }
    this.engine.exportToHTML(fileName);
  }

  /**
   * Export pivot table to PDF format
   */
  public exportToPDF(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to PDF.');
      return;
    }
    this.engine.exportToPDF(fileName);
  }

  /**
   * Export pivot table to Excel format
   */
  public exportToExcel(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to Excel.');
      return;
    }
    this.engine.exportToExcel(fileName);
  }

  /**
   * Open print dialog for the pivot table
   */
  public openPrintDialog(): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot open print dialog.');
      return;
    }
    this.engine.openPrintDialog();
  }

  // File loading methods

  /**
   * Load data from a file
   */
  public loadFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const data = JSON.parse(event.target?.result as string);
          this.data = data;
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  }

  /**
   * Load data from a URL
   */
  public loadFromUrl(url: string): Promise<void> {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${url}`);
        }
        return response.json();
      })
      .then(data => {
        this.data = data;
      });
  }

  // Public drag API methods

  /**
   * Programmatically drag a row from one position to another
   */
  public dragRow(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    console.log('from Index', fromIndex, 'to Index', toIndex);
    this.engine.dragRow(fromIndex, toIndex);
    this.notifyStateChange();
  }

  /**
   * Programmatically drag a column from one position to another
   */
  public dragColumn(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.dragColumn(fromIndex, toIndex);
    this.notifyStateChange();
  }

  /**
   * Set row groups for the pivot table
   */
  public setRowGroups(rowGroups: any[]): void {
    this._rowGroups = rowGroups;

    // Also update the engine if it's initialized
    if (this.engine && typeof this.engine.setRowGroups === 'function') {
      this.engine.setRowGroups(rowGroups);
      this.notifyStateChange();
    } else {
      // If engine not ready, reinitialize with new row groups
      this.reinitialize();
    }
  }

  /**
   * Set column groups for the pivot table
   */
  public setColumnGroups(columnGroups: any[]): void {
    this._columnGroups = columnGroups;

    // Also update the engine if it's initialized
    if (this.engine && typeof this.engine.setColumnGroups === 'function') {
      this.engine.setColumnGroups(columnGroups);
      this.notifyStateChange();
    } else {
      // If engine not ready, reinitialize with new column groups
      this.reinitialize();
    }
  }

  /**
   * Toggles the expansion state of a row via the engine.
   * @param rowId - The unique ID of the row to toggle.
   */
  public toggleRowExpansion(rowId: string): void {
    if (!this.engine || typeof this.engine.toggleRowExpansion !== 'function') {
      console.error('Engine not initialized or method not available');
      return;
    }
    this.engine.toggleRowExpansion(rowId);
    this.notifyStateChange();
  }

  /**
   * Checks if a row is expanded via the engine.
   * @param rowId - The unique ID of the row.
   * @returns boolean indicating whether the row is expanded.
   */
  public isRowExpanded(rowId: string): boolean {
    if (!this.engine || typeof this.engine.isRowExpanded !== 'function') {
      console.error('Engine not initialized or method not available');
      return false;
    }
    return this.engine.isRowExpanded(rowId);
  }
}

// Register the web component
customElements.define('pivot-head', PivotHeadElement);
