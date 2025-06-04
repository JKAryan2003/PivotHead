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
}

/**
 * PivotHead Web Component
 *
 * A custom HTML element that wraps the PivotEngine to provide pivot table functionality
 * through HTML attributes and DOM events.
 *
 * Supported attributes:
 * - data: JSON string containing the table data
 * - options: JSON string containing pivot table configuration options
 * - filters: JSON string containing filter configurations
 *
 * Usage:
 * <pivot-head
 *   data='[{"name":"John","sales":100}]'
 *   options='{"rows":[{"uniqueName":"name"}]}'
 *   filters='[{"field":"sales","operator":"greaterThan","value":50}]'>
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

  /**
   * Define which attributes should trigger attributeChangedCallback
   * Only the essential attributes for core functionality
   */
  static get observedAttributes() {
    return ['data', 'options', 'filters'];
  }

  constructor() {
    super();
  }

  /**
   * Getter and setter for data property
   * Allows programmatic access: element.data = [...]
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
   * Allows programmatic access: element.options = {...}
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
   * Allows programmatic access: element.filters = [...]
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
   * Called whenever data or options change
   */
  private reinitialize() {
    if (this._data && this._options) {
      const config: PivotTableConfig<any> = {
        data: this._data,
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
   * Parses attribute values and creates the engine instance
   */
  private initialize() {
    // Parse data attribute if present and not already set programmatically
    const rawData = this.getAttribute('data');
    if (rawData && !this._data.length) {
      try {
        this._data = JSON.parse(rawData);
      } catch (error) {
        console.error('Error parsing data attribute:', error);
        return;
      }
    }

    // Parse options attribute if present and not already set programmatically
    const rawOptions = this.getAttribute('options');
    if (rawOptions && Object.keys(this._options).length === 0) {
      try {
        this._options = JSON.parse(rawOptions);
      } catch (error) {
        console.error('Error parsing options attribute:', error);
        return;
      }
    }

    // Parse filters attribute if present
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
   * Prevents partial initialization
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
   * Handles updates to data, options, and filters
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // Only process if value actually changed
    if (oldValue === newValue) return;

    switch (name) {
      case 'data':
      case 'options':
        if (!this.initialized) {
          // Try to initialize if not yet initialized
          this.initializeWhenReady();
        } else {
          // Update configuration if already initialized
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
   * @param filtersJson - JSON string containing filter configurations
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
   * This allows parent components to react to state changes
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
   * @returns Current pivot table state
   */
  public getState(): PivotTableState<any> {
    if (!this.engine) {
      throw new Error('Engine not initialized');
    }
    return this.engine.getState();
  }

  /**
   * Reset the pivot table to its initial state
   * Clears all filters and sorting
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
   * @param field - Field name to sort by
   * @param direction - Sort direction ('asc' or 'desc')
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
   * @param measures - Array of measure configurations
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
   * @param dimensions - Array of dimension configurations
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
   * @param groupConfig - Group configuration or null to disable grouping
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
   * @param type - Aggregation type (sum, avg, count, etc.)
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
   * @param value - Value to format
   * @param field - Field name for formatting context
   * @returns Formatted value as string
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
   * @returns Array of grouped data
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
   * @returns Array of current filter configurations
   */
  public getFilters(): FilterConfig[] {
    return this._filters;
  }

  /**
   * Get the raw data from the pivot table
   * @returns Array of data objects
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
   * @returns Processed data object
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
   * @param fileName - Name for the exported file (without extension)
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
   * @param fileName - Name for the exported file (without extension)
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
   * @param fileName - Name for the exported file (without extension)
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
   * @param file - File object to load data from
   * @returns Promise that resolves when data is loaded
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
   * @param url - URL to fetch data from
   * @returns Promise that resolves when data is loaded
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
}

// Register the web component
customElements.define('pivot-head', PivotHeadElement);
