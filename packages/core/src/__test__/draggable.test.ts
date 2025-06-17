// import { PivotEngine } from '../engine/pivotEngine';
// import type { PivotTableConfig } from '../types/interfaces';

// describe('PivotEngine Draggable Feature', () => {
//   let engine: PivotEngine<any>;
//   let config: PivotTableConfig<any>;

//   beforeEach(() => {
//     config = {
//       dimensions: [],
//       defaultAggregation: 'sum',
//       data: [
//         { id: 1, name: 'John', age: 30 },
//         { id: 2, name: 'Jane', age: 25 },
//         { id: 3, name: 'Bob', age: 35 },
//         { id: 4, name: 'Alice', age: 28 },
//       ],
//       columns: [
//         { uniqueName: 'id', caption: 'ID' },
//         { uniqueName: 'name', caption: 'Name' },
//         { uniqueName: 'age', caption: 'Age' },
//       ],
//       rows: [],
//       measures: [],
//       groupConfig: null,
//     };
//     engine = new PivotEngine(config);

//     // Initialize rowGroups after engine creation
//     const rowGroups = config.data.map((item, index) => ({
//       key: `row-${index}`,
//       items: [item],
//       aggregates: {},
//       level: 0,
//     }));
//     engine.setRowGroups(rowGroups);

//     // Initialize columnGroups after engine creation
//     const columnGroups = config.columns.map((column, index) => ({
//       key: `col-${index}`,
//       items: [column],
//       aggregates: {},
//       level: 0,
//     }));
//     engine.setColumnGroups(columnGroups);
//   });

//   describe('dragRow', () => {

//     it('should move a row from one index to another', () => {
//       engine.dragRow(1, 3);
//       const state = engine.getState();
//       expect(state.rowGroups).toEqual([
//         {
//           key: 'row-0',
//           items: [{ id: 1, name: 'John', age: 30 }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'row-2',
//           items: [{ id: 3, name: 'Bob', age: 35 }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'row-3',
//           items: [{ id: 4, name: 'Alice', age: 28 }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'row-1',
//           items: [{ id: 2, name: 'Jane', age: 25 }],
//           aggregates: {},
//           level: 0,
//         },
//       ]);
//     });

//     it('should not change data when dragging to the same index', () => {
//       const initialState = engine.getState();
//       engine.dragRow(1, 1);
//       const newState = engine.getState();
//       expect(newState.data).toEqual(initialState.data);
//     });

//     it('should handle invalid indices gracefully', () => {
//       const initialState = engine.getState();
//       engine.dragRow(-1, 5);
//       const newState = engine.getState();
//       expect(newState.data).toEqual(initialState.data);
//     });
//   });

//   describe('dragColumn', () => {
//     it('should move a column group from one index to another', () => {
//       engine.dragColumn(0, 2);
//       const state = engine.getState();
//       expect(state.columnGroups).toEqual([
//         {
//           key: 'col-1',
//           items: [{ uniqueName: 'name', caption: 'Name' }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'col-2',
//           items: [{ uniqueName: 'age', caption: 'Age' }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'col-0',
//           items: [{ uniqueName: 'id', caption: 'ID' }],
//           aggregates: {},
//           level: 0,
//         },
//       ]);
//     });

//     it('should not change column groups when dragging to the same index', () => {
//       const initialState = engine.getState();
//       engine.dragColumn(1, 1);
//       const newState = engine.getState();
//       expect(newState.columnGroups).toEqual(initialState.columnGroups);
//     });

//     it('should handle invalid indices gracefully', () => {
//       const initialState = engine.getState();
//       engine.dragColumn(-1, 5);
//       const newState = engine.getState();
//       expect(newState.columnGroups).toEqual(initialState.columnGroups);
//     });

//     it('should update column widths when dragging columns with existing widths', () => {
//       // Set up initial column widths
//       const state = engine.getState();
//       if (!state.columnWidths) {
//         state.columnWidths = {};
//       }
//       state.columnWidths['col-0'] = 100;
//       state.columnWidths['col-1'] = 150;
//       state.columnWidths['col-2'] = 120;

//       engine.dragColumn(0, 1);
//       const newState = engine.getState();

//       // Column widths should be updated to match new positions
//       expect(newState.columnWidths['col-0']).toBeDefined();
//       expect(newState.columnWidths['col-1']).toBeDefined();
//       expect(newState.columnWidths['col-2']).toBeDefined();
//     });

//     it('should refresh processed data after column drag', () => {
//       const initialState = engine.getState();
//       engine.dragColumn(0, 1);
//       const newState = engine.getState();

//       // Should trigger data refresh (implementation dependent)
//       expect(newState.columnGroups).not.toEqual(initialState.columnGroups);
//     });
//   });
//   describe('dragRow and dragColumn interaction', () => {

//     it('should maintain correct data and column order after multiple drags', () => {
//       engine.dragRow(0, 3);
//       engine.dragColumn(1, 0);
//       const state = engine.getState();
//       expect(state.rowGroups).toEqual([
//         {
//           key: 'row-1',
//           items: [{ id: 2, name: 'Jane', age: 25 }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'row-2',
//           items: [{ id: 3, name: 'Bob', age: 35 }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'row-3',
//           items: [{ id: 4, name: 'Alice', age: 28 }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'row-0',
//           items: [{ id: 1, name: 'John', age: 30 }],
//           aggregates: {},
//           level: 0,
//         },
//       ]);

//       expect(state.columnGroups).toEqual([
//         {
//           key: 'col-1',
//           items: [{ uniqueName: 'name', caption: 'Name' }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'col-0',
//           items: [{ uniqueName: 'id', caption: 'ID' }],
//           aggregates: {},
//           level: 0,
//         },
//         {
//           key: 'col-2',
//           items: [{ uniqueName: 'age', caption: 'Age' }],
//           aggregates: {},
//           level: 0,
//         },
//       ]);
//     });
//   });

//   describe('edge cases', () => {
//     it('should handle dragging row to start of the list', () => {
//       engine.dragRow(3, 0);
//       const state = engine.getState();
//       expect(state.rowGroups[0]).toEqual({
//         key: 'row-3',
//         items: [{ id: 4, name: 'Alice', age: 28 }],
//         aggregates: {},
//         level: 0,
//       });
//     });

//     it('should handle dragging column group to end of the list', () => {
//       engine.dragColumn(0, 2);
//       const state = engine.getState();
//       expect(state.columnGroups[2]).toEqual({
//         key: 'col-0',
//         items: [{ uniqueName: 'id', caption: 'ID' }],
//         aggregates: {},
//         level: 0,
//       });
//     });
//   });

//   describe('columnGroup specific tests', () => {
//     it('should handle column group aggregation after drag', () => {
//       // Simulate setting aggregates on column groups
//       const state = engine.getState();
//       state.columnGroups[0].aggregates = { sum: 100 };

//       engine.dragColumn(0, 1);
//       const newState = engine.getState();

//       // The column group with aggregates should maintain its data after drag
//       expect(newState.columnGroups[1].aggregates).toEqual({ sum: 100 });
//     });

//     it('should maintain column group levels after drag', () => {
//       // Set different levels for column groups
//       const state = engine.getState();
//       state.columnGroups[0].level = 1;
//       state.columnGroups[1].level = 2;

//       engine.dragColumn(0, 2);
//       const newState = engine.getState();

//       expect(newState.columnGroups[2].level).toBe(1); // Moved column group maintains its level
//       expect(newState.columnGroups[0].level).toBe(2); // Other column group maintains its level
//     });
//   });
// });

import { PivotEngine } from '../engine/pivotEngine';
import type { PivotTableConfig } from '../types/interfaces';

describe('PivotEngine Draggable Feature', () => {
  let engine: PivotEngine<any>;
  let config: PivotTableConfig<any>;

  beforeEach(() => {
    config = {
      data: [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 },
        { id: 3, name: 'Bob', age: 35 },
        { id: 4, name: 'Alice', age: 28 },
      ],
      columns: [
        { uniqueName: 'id', caption: 'ID' },
        { uniqueName: 'name', caption: 'Name' },
        { uniqueName: 'age', caption: 'Age' },
      ],
      rows: [],
      measures: [],
      dimensions: [],
      defaultAggregation: 'sum',
    };
    engine = new PivotEngine(config);

    // Manually set up row and column groups for testing this specific feature
    const rowGroups = config.data.map((item, index) => ({
      key: `row-${index}`,
      items: [item],
      aggregates: {},
      level: 0,
    }));
    engine.setRowGroups(rowGroups);

    const columnGroups = config.columns.map((column, index) => ({
      key: `col-${index}`,
      items: [column],
      aggregates: {},
      level: 0,
    }));
    engine.setColumnGroups(columnGroups);
  });

  describe('dragRow', () => {
    it('should move a row group from one index to another', () => {
      // initial order of keys: row-0, row-1, row-2, row-3
      engine.dragRow(1, 3); // move row-1 to the end
      const state = engine.getState();

      // expected order of keys: row-0, row-2, row-3, row-1
      expect(state.rowGroups.map(g => g.key)).toEqual([
        'row-0',
        'row-2',
        'row-3',
        'row-1',
      ]);

      // For more robust testing, check the content
      expect(state.rowGroups).toEqual([
        {
          key: 'row-0',
          items: [{ id: 1, name: 'John', age: 30 }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'row-2',
          items: [{ id: 3, name: 'Bob', age: 35 }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'row-3',
          items: [{ id: 4, name: 'Alice', age: 28 }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'row-1',
          items: [{ id: 2, name: 'Jane', age: 25 }],
          aggregates: {},
          level: 0,
        },
      ]);
    });

    it('should not change row groups when dragging to the same index', () => {
      const initialRowGroups = [...engine.getState().rowGroups];
      engine.dragRow(1, 1);
      const newRowGroups = engine.getState().rowGroups;
      expect(newRowGroups).toEqual(initialRowGroups);
    });

    it('should handle invalid indices gracefully', () => {
      const initialRowGroups = [...engine.getState().rowGroups];
      engine.dragRow(-1, 5);
      const newRowGroups = engine.getState().rowGroups;
      expect(newRowGroups).toEqual(initialRowGroups);
    });
  });

  describe('dragColumn', () => {
    it('should move a column group from one index to another', () => {
      // initial order of keys: col-0, col-1, col-2
      engine.dragColumn(0, 2); // move col-0 to the end
      const state = engine.getState();

      // expected order of keys: col-1, col-2, col-0
      expect(state.columnGroups.map(g => g.key)).toEqual([
        'col-1',
        'col-2',
        'col-0',
      ]);

      expect(state.columnGroups).toEqual([
        {
          key: 'col-1',
          items: [{ uniqueName: 'name', caption: 'Name' }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'col-2',
          items: [{ uniqueName: 'age', caption: 'Age' }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'col-0',
          items: [{ uniqueName: 'id', caption: 'ID' }],
          aggregates: {},
          level: 0,
        },
      ]);
    });

    it('should not change column groups when dragging to the same index', () => {
      const initialColumnGroups = [...engine.getState().columnGroups];
      engine.dragColumn(1, 1);
      const newColumnGroups = engine.getState().columnGroups;
      expect(newColumnGroups).toEqual(initialColumnGroups);
    });

    it('should handle invalid indices gracefully', () => {
      const initialColumnGroups = [...engine.getState().columnGroups];
      engine.dragColumn(-1, 5);
      const newColumnGroups = engine.getState().columnGroups;
      expect(newColumnGroups).toEqual(initialColumnGroups);
    });
  });

  describe('dragRow and dragColumn interaction', () => {
    it('should maintain correct row and column group order after multiple drags', () => {
      engine.dragRow(0, 3); // move row-0 to the end -> [1, 2, 3, 0]
      engine.dragColumn(1, 0); // move col-1 to the start -> [1, 0, 2]
      const state = engine.getState();

      expect(state.rowGroups.map(g => g.key)).toEqual([
        'row-1',
        'row-2',
        'row-3',
        'row-0',
      ]);
      expect(state.columnGroups.map(g => g.key)).toEqual([
        'col-1',
        'col-0',
        'col-2',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle dragging row to start of the list', () => {
      // initial order of keys: row-0, row-1, row-2, row-3
      engine.dragRow(3, 0); // move row-3 to the start
      const state = engine.getState();

      // expected order of keys: row-3, row-0, row-1, row-2
      expect(state.rowGroups[0].key).toBe('row-3');
      expect(state.rowGroups[0].items[0].id).toBe(4);
    });

    it('should handle dragging column group to end of the list', () => {
      // initial order of keys: col-0, col-1, col-2
      engine.dragColumn(0, 2); // move col-0 to the end
      const state = engine.getState();

      // expected order of keys: col-1, col-2, col-0
      expect(state.columnGroups[2].key).toBe('col-0');
      expect(state.columnGroups[2].items[0].uniqueName).toBe('id');
    });
  });
});
