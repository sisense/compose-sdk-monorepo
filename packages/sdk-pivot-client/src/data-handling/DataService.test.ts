/* eslint-disable no-unused-expressions, no-shadow, @typescript-eslint/unbound-method */
import { describe } from 'vitest';

import { createTestJaql, createTypedPanels, delay } from '../__test-helpers__/testUtils.js';
import { MessageType } from '../data-load/constants.js';
import { TestDataLoadService } from '../data-load/index.js';
import { DataLoadServiceI, JaqlPanel, JaqlRequest } from '../data-load/types.js';
import { LoadingCanceledError } from '../errors/index.js';
import { debug } from '../index.js';
import { TreeNode, TreeServiceI } from '../tree-structure/index.js';
import { treeNode } from '../tree-structure/utils/index.js';
import { LoggerI } from '../utils/types.js';
import { PanelType, UserType } from './constants.js';
import {
  DataService,
  DataServiceOptions,
  EVENT_DATA_CHUNK_LOADED,
  EVENT_DATA_FINISH_CHUNK_LOADED,
  EVENT_FINISH_CHUNK_LOADED,
  EVENT_HEADER_CELL_FORMAT,
  EVENT_TOTAL_COLUMNS_COUNT,
  EVENT_TOTAL_ROWS_COUNT,
  NodesChunk,
} from './DataService.js';
import { DataServiceI, PivotTreeNode } from './types.js';

describe('DataService', () => {
  let sut: DataServiceI;
  let loadService: DataLoadServiceI;
  let testOptions: DataServiceOptions;
  let logger: LoggerI;

  const createTreeNode = treeNode.create.bind(treeNode);

  const createTreeWithLength = (length: number, startIndex = 0): TreeNode => {
    const child = Array.from(Array(length)).map((r, index) => {
      const childIndex = startIndex + index;
      return createTreeNode(`ch-${childIndex}`, undefined, undefined, childIndex);
    });
    const res = createTreeNode('parent', child);
    res.size = length;
    return res;
  };

  const getLastChildIndexes = (treeService: TreeServiceI): Array<string> =>
    treeService.getLastLevelNodes().map((node) => node.value || '');

  beforeEach(() => {
    loadService = new TestDataLoadService('http://test');
    testOptions = {
      throttle: () => {},
      throttleTime: 100,
    };
    // NO THROTTLING
    testOptions.throttle = (fn: Function) => {
      const res = (...args: Array<any>) => {
        fn(...args);
      };
      res.cancel = () => {};
      return res;
    };
    logger = debug.Logger.createMock();
    sut = new DataService(loadService, undefined, testOptions, logger);
  });

  it('should be defined', () => {
    expect(DataService).to.be.exist;
  });

  describe('loadData', () => {
    let jaql: JaqlRequest;

    beforeEach(() => {
      jaql = createTestJaql();
    });

    // it('should call "loadService.load" method', () => {
    //   sinon.spy(loadService, 'load');
    //   sut.loadData(data);
    //   expect(loadService.load as sinon.SinonSpy).to.have.been.calledWith(data);
    //   (loadService.load as sinon.SinonStub).restore();
    // });

    it('should return promise', () => {
      const res = sut.loadData(jaql);
      expect(res).toBeInstanceOf(Promise);
    });

    it('should wait for data', async () => {
      const pageSize = 10;
      let loaded = false;

      sut.loadData(jaql, { pageSize }).then(() => {
        loaded = true;
      });

      await delay();
      expect(loaded).toBeFalsy();
      const rows = createTreeWithLength(pageSize);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      // This empty data chunk is to trigger the check and resolve of loadDataPromise
      // see DataService.checkLoadPromise()
      loadService.emit(MessageType.DATA);
      await delay();
      expect(loaded).toBeTruthy();
    });

    // it(`should trigger "${EVENT_DATA_CHUNK_LOADED}" event with total loaded items`, () => {
    //   const pageSize = 10;
    //   const onDataChunkLoadedCb = sinon.spy();
    //
    //   sut.on(EVENT_DATA_CHUNK_LOADED, onDataChunkLoadedCb);
    //   sut.loadData(data, { pageSize });
    //
    //   return delay()
    //     .then(() => {
    //       const rows = createTreeWithLength(pageSize);
    //       loadService.emit(MessageType.DATA, rows);
    //     })
    //     .then(() => delay())
    //     .then(() => {
    //       loadService.emit(MessageType.DATA);
    //     })
    //     .then(() => delay())
    //     .then(() => {
    //       expect(onDataChunkLoadedCb).to.have.been.calledWith(pageSize);
    //     });
    // });
    //
    // it(`should trigger "${EVENT_TOTAL_COLUMNS_COUNT}" event for headers chunk`, () => {
    //   const pageSize = 10;
    //   const onTotalColumnsCountCb = sinon.spy();
    //
    //   sut.on(EVENT_TOTAL_COLUMNS_COUNT, onTotalColumnsCountCb);
    //   sut.loadData(data, { pageSize });
    //
    //   return delay()
    //     .then(() => {
    //       loadService.emit(MessageType.HEADERS, {});
    //     })
    //     .then(() => delay())
    //     .then(() => {
    //       expect(onTotalColumnsCountCb).to.have.been.calledWith({
    //         columnsCount: 0,
    //         totalColumnsCount: 0,
    //       });
    //     });
    // });

    it('should wait for page size data', async () => {
      const pageSize = 10;
      let loaded = false;

      sut.loadData(jaql, { pageSize }).then(() => {
        loaded = true;
      });

      await delay();
      expect(loaded).to.be.false;
      const rows = createTreeWithLength(5);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      expect(loaded).to.be.false;
      const rows_1 = createTreeWithLength(5);
      loadService.emit(MessageType.DATA, rows_1);
      await delay();
      loadService.emit(MessageType.DATA);
      await delay();
      expect(loaded).to.be.true;
    });

    // it(`should trigger "${EVENT_DATA_CHUNK_LOADED}" event with total loaded items`, () => {
    //   const pageSize = 10;
    //   const onDataChunkLoadedCb = sinon.spy();
    //
    //   sut.on(EVENT_DATA_CHUNK_LOADED, onDataChunkLoadedCb);
    //   sut.loadData(data, { pageSize });
    //
    //   return delay()
    //     .then(() => {
    //       const rows = createTreeWithLength(5);
    //       loadService.emit(MessageType.DATA, rows);
    //     })
    //     .then(() => delay())
    //     .then(() => {
    //       const rows = createTreeWithLength(5);
    //       loadService.emit(MessageType.DATA, rows);
    //     })
    //     .then(() => delay())
    //     .then(() => {
    //       loadService.emit(MessageType.DATA);
    //     })
    //     .then(() => delay())
    //     .then(() => {
    //       expect(onDataChunkLoadedCb).to.have.been.calledWith(10);
    //     });
    // });

    it('should be resolved with correct data properties', async () => {
      const pageSize = 10;
      let result: any = null;

      sut.loadData(jaql, { pageSize }).then((res) => {
        result = res;
      });

      await delay();
      const rows = createTreeWithLength(pageSize);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      loadService.emit(MessageType.DATA);
      await delay();
      expect(result).to.be.exist;
      expect(result).to.have.property('rowsTreeService');
      expect(result).to.have.property('columnsTreeService');
      expect(result).to.have.property('cornerTreeService');
      expect(result).to.have.property('isLastPage');
    });

    it('should be resolved with correct "rowsTreeService"', async () => {
      const pageSize = 10;
      let result: any = null;

      sut.loadData(jaql, { pageSize }).then((res) => {
        result = res;
      });

      await delay();
      const rows = createTreeWithLength(pageSize);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      loadService.emit(MessageType.DATA);
      await delay();
      expect(getLastChildIndexes((result || {}).rowsTreeService)).to.be.deep.equal([
        'ch-0',
        'ch-1',
        'ch-2',
        'ch-3',
        'ch-4',
        'ch-5',
        'ch-6',
        'ch-7',
        'ch-8',
        'ch-9',
      ]);
    });

    it('should ignore last request if new called', async () => {
      const pageSize = 10;
      let firstLoaded = false;
      let secondLoaded = false;
      let secondResult: any = null;

      // first request
      sut.loadData(jaql, { pageSize }).then(() => {
        firstLoaded = true;
      });

      await delay();
      expect(firstLoaded).to.be.false;
      // first request partial data
      const rows = createTreeWithLength(5, 5);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      loadService.emit(MessageType.DATA);
      await delay();
      // second request
      sut.loadData(jaql, { pageSize }).then((res) => {
        secondLoaded = true;
        secondResult = res;
      });
      await delay();
      // second request data
      const rows_1 = createTreeWithLength(10, 10);
      loadService.emit(MessageType.DATA, rows_1);
      await delay();
      loadService.emit(MessageType.DATA);
      await delay();
      expect(firstLoaded).to.be.false;
      expect(secondLoaded).to.be.true;
      expect(getLastChildIndexes((secondResult || {}).rowsTreeService)).to.be.deep.equal([
        'ch-10',
        'ch-11',
        'ch-12',
        'ch-13',
        'ch-14',
        'ch-15',
        'ch-16',
        'ch-17',
        'ch-18',
        'ch-19',
      ]);
    });

    it('should return "false" for "isLastPage" if not finish yet', async () => {
      const pageSize = 10;
      let result: any = null;

      sut.loadData(jaql, { pageSize }).then((res) => {
        result = res;
      });

      await delay();
      const rows = createTreeWithLength(pageSize);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      loadService.emit(MessageType.DATA);
      await delay();
      expect(result).to.be.exist;
      expect(result).to.have.property('isLastPage');
      expect((result || {}).isLastPage).to.be.false;
    });

    describe('if finished', () => {
      it('should return "false" for "isLastPage" if not last page', async () => {
        const pageSize = 10;
        let result: any = null;

        sut.loadData(jaql, { pageSize }).then((res) => {
          result = res;
        });

        await delay();
        const rows = createTreeWithLength(30);
        loadService.emit(MessageType.DATA, rows);
        await delay();
        loadService.emit(MessageType.DATA_FINISH);
        await delay();
        expect(result).to.be.exist;
        expect(result).to.have.property('isLastPage');
        expect((result || {}).isLastPage).to.be.false;
      });

      it('should return "true" for "isLastPage" if small init page', async () => {
        const pageSize = 10;
        let result: any = null;

        sut.loadData(jaql, { pageSize }).then((res) => {
          result = res;
        });

        await delay();
        const rows = createTreeWithLength(9);
        loadService.emit(MessageType.DATA, rows);
        await delay();
        loadService.emit(MessageType.DATA_FINISH);
        await delay();
        expect(result).to.be.exist;
        expect(result).to.have.property('isLastPage');
        expect((result || {}).isLastPage).to.be.true;
      });

      // it(`should trigger "${EVENT_TOTAL_ROWS_COUNT}" event for total rows`, () => {
      //   const pageSize = 10;
      //   const onTotalRowsCountCb = sinon.spy();
      //
      //   sut.on(EVENT_TOTAL_ROWS_COUNT, onTotalRowsCountCb);
      //   sut.loadData(data, { pageSize });
      //
      //   return delay()
      //     .then(() => {
      //       loadService.emit(MessageType.HEADERS, {});
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       const rows = createTreeWithLength(9);
      //       loadService.emit(MessageType.DATA, rows);
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       loadService.emit(MessageType.DATA_FINISH, { rowsCount: 20 });
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       loadService.emit(MessageType.TOTAL_ROWS, { rowsCount: 200 });
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       loadService.emit(MessageType.FINISH, {});
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       expect(onTotalRowsCountCb).to.have.been.calledWith({
      //         rowsCount: 200,
      //       });
      //     });
      // });

      // it(`should trigger "${EVENT_FINISH_CHUNK_LOADED}" event with totals`, () => {
      //   const pageSize = 10;
      //   const onFinishChunkLoadedCb = sinon.spy();
      //
      //   sut.on(EVENT_FINISH_CHUNK_LOADED, onFinishChunkLoadedCb);
      //   sut.loadData(data, { pageSize });
      //
      //   return delay()
      //     .then(() => {
      //       const header: HeaderTreeNode = createTreeWithLength(5);
      //       header.columnsCount = 5;
      //       header.totalColumnsCount = 100;
      //       loadService.emit(MessageType.HEADERS, header);
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       const rows = createTreeWithLength(9);
      //       loadService.emit(MessageType.DATA, rows);
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       loadService.emit(MessageType.DATA_FINISH, { rowsCount: 20 });
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       loadService.emit(MessageType.TOTAL_ROWS, { rowsCount: 200 });
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       loadService.emit(MessageType.FINISH, {});
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       expect(onFinishChunkLoadedCb).to.have.been.calledWith({
      //         totalRows: 200,
      //         totalColumns: 100,
      //       });
      //     });
      // });

      // it(`should trigger "${EVENT_DATA_FINISH_CHUNK_LOADED}" event with limits`, () => {
      //   const pageSize = 10;
      //   const onDataFinishChunkLoadedCb = sinon.spy();
      //
      //   sut.on(EVENT_DATA_FINISH_CHUNK_LOADED, onDataFinishChunkLoadedCb);
      //   sut.loadData(data, { pageSize });
      //
      //   return delay()
      //     .then(() => {
      //       const header: HeaderTreeNode = createTreeWithLength(5);
      //       header.columnsCount = 5;
      //       header.totalColumnsCount = 100;
      //       loadService.emit(MessageType.HEADERS, header);
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       const rows = createTreeWithLength(9);
      //       loadService.emit(MessageType.DATA, rows);
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       loadService.emit(MessageType.DATA_FINISH, { rowsCount: 20 });
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       loadService.emit(MessageType.TOTAL_ROWS, { rowsCount: 200 });
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       loadService.emit(MessageType.FINISH, {});
      //     })
      //     .then(() => delay())
      //     .then(() => {
      //       expect(onDataFinishChunkLoadedCb).to.have.been.calledWith({
      //         limitedRows: 20,
      //         limitedColumns: 5,
      //       });
      //     });
      // });
    });

    describe('if loading canceled', () => {
      it('should be rejected with "LoadingCanceledError" error', async () => {
        const pageSize = 10;
        let loaded = false;
        let error: any = null;

        sut
          .loadData(jaql, { pageSize })
          .then(() => {
            loaded = true;
          })
          .catch((err) => {
            error = err;
          });

        sut.cancelLoading();

        await delay();
        const rows = createTreeWithLength(pageSize);
        loadService.emit(MessageType.DATA, rows);
        await delay();
        expect(loaded).to.be.false;
        expect(error).to.be.instanceof(LoadingCanceledError);
      });
    });

    describe('with throttle', () => {
      let sut: DataServiceI;
      let data: JaqlRequest;

      beforeEach(() => {
        loadService = new TestDataLoadService('http://test');
        testOptions = {
          throttleTime: 10,
        };
        sut = new DataService(loadService, undefined, testOptions, logger);
        data = createTestJaql();
      });

      it('should wait for page size data if couple chunks', async () => {
        const pageSize = 10;
        let loaded = false;
        let result: any = {};

        sut.loadData(data, { pageSize }).then((res) => {
          result = res;
          loaded = true;
        });

        await delay();
        expect(loaded).to.be.false;
        const rows = createTreeWithLength(7);
        const rows2 = createTreeWithLength(7);
        loadService.emit(MessageType.DATA, [rows, rows2]);
        await delay();
        loadService.emit(MessageType.DATA_FINISH);
        await delay(100);
        const { rowsTreeService } = result;
        const loadedCount = rowsTreeService ? rowsTreeService.getTreeChildLength() : 0;
        expect(loaded).to.be.true;
        expect(loadedCount).to.be.equal(10);
      });
    });

    describe('if only rows data', () => {
      let jaql: JaqlRequest;

      beforeEach(() => {
        jaql = createTestJaql(createTypedPanels(PanelType.ROWS, 3, 1));
      });

      it('should return correct response object', async () => {
        const pageSize = 10;
        let result: any = {};

        sut.loadData(jaql, { pageSize }).then((res) => {
          result = res;
        });

        await delay();
        loadService.emit(MessageType.HEADERS, {});
        await delay();
        const rows = createTreeWithLength(pageSize);
        loadService.emit(MessageType.DATA, rows);
        await delay();
        loadService.emit(MessageType.DATA_FINISH);
        await delay();
        expect(result.cornerTreeService).to.be.exist;
        expect(result.rowsTreeService).to.be.exist;
        expect(result.columnsTreeService).not.to.be.exist;
      });
    });

    describe('if only columns data', () => {
      let jaql: JaqlRequest;

      beforeEach(() => {
        jaql = createTestJaql(createTypedPanels(PanelType.COLUMNS, 3, 1));
      });

      it('should return correct response object', async () => {
        const pageSize = 10;
        let result: any = {};

        sut.loadData(jaql, { pageSize }).then((res) => {
          result = res;
        });

        await delay();
        const rows = createTreeWithLength(pageSize);
        loadService.emit(MessageType.HEADERS, rows);
        await delay();
        loadService.emit(MessageType.DATA);
        await delay();
        loadService.emit(MessageType.DATA_FINISH);
        await delay();
        expect(result.cornerTreeService).not.to.be.exist;
        expect(result.rowsTreeService).not.to.be.exist;
        expect(result.columnsTreeService).to.be.exist;
      });
    });

    describe('if only rows & measures data', () => {
      let jaql: JaqlRequest;

      beforeEach(() => {
        jaql = createTestJaql(
          createTypedPanels(PanelType.ROWS, 3, 1),
          createTypedPanels(PanelType.MEASURES, 5, 3),
        );
      });

      it('should return correct response object', async () => {
        const pageSize = 10;
        let result: any = {};

        sut.loadData(jaql, { pageSize }).then((res) => {
          result = res;
        });

        await delay();
        loadService.emit(MessageType.HEADERS, {});
        await delay();
        const rows = createTreeWithLength(pageSize);
        loadService.emit(MessageType.DATA, rows);
        await delay();
        loadService.emit(MessageType.DATA_FINISH);
        await delay();
        expect(result.cornerTreeService).to.be.exist;
        expect(result.rowsTreeService).to.be.exist;
        expect(result.columnsTreeService).to.be.exist;
      });
    });

    describe('if only columns & measures data', () => {
      let jaql: JaqlRequest;

      beforeEach(() => {
        jaql = createTestJaql(
          createTypedPanels(PanelType.COLUMNS, 3, 1),
          createTypedPanels(PanelType.MEASURES, 5, 3),
        );
      });

      it('should return correct response object', async () => {
        const pageSize = 10;
        let result: any = {};

        sut.loadData(jaql, { pageSize }).then((res) => {
          result = res;
        });

        await delay();
        loadService.emit(MessageType.HEADERS, {});
        await delay();
        const rows = createTreeWithLength(pageSize);
        loadService.emit(MessageType.DATA, rows);
        await delay();
        loadService.emit(MessageType.DATA_FINISH);
        await delay();
        expect(result.cornerTreeService).not.to.be.exist;
        expect(result.rowsTreeService).to.be.exist;
        expect(result.columnsTreeService).to.be.exist;
      });
    });

    describe('if called with "cacheResult"', () => {
      it('should be resolved with cached object next time', async () => {
        const pageSize = 10;
        let result: any = null;

        sut.loadData(jaql, { pageSize, cacheResult: true }).then((res) => {
          result = res;
        });

        await delay();
        const rows = createTreeWithLength(pageSize);
        loadService.emit(MessageType.DATA, rows);
        await delay();
        loadService.emit(MessageType.DATA);
        await delay();
        expect(getLastChildIndexes((result || {}).rowsTreeService)).to.be.deep.equal([
          'ch-0',
          'ch-1',
          'ch-2',
          'ch-3',
          'ch-4',
          'ch-5',
          'ch-6',
          'ch-7',
          'ch-8',
          'ch-9',
        ]);
        await delay();
        const res_1 = await sut.loadData(jaql, { pageSize });
        expect(res_1).to.be.equal(result);
      });
    });
  });

  describe('loadAllData', () => {
    let data: JaqlRequest;

    beforeEach(() => {
      data = createTestJaql();
    });

    it('should return promise', () => {
      const res = sut.loadAllData();
      expect(res).to.be.instanceof(Promise);
    });

    it('should not be resolved until data load finished', async () => {
      let loaded = false;

      void sut.loadData(data, { isPaginated: true });
      sut.loadAllData().then(() => {
        loaded = true;
      });

      await delay();
      expect(loaded).to.be.false;
      const rows = createTreeWithLength(12);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      expect(loaded).to.be.false;
      loadService.emit(MessageType.DATA_FINISH);
      await delay();
      expect(loaded).to.be.true;
    });

    it('should return correct loaded count after all data received', async () => {
      let loadedCount = 0;
      const toLoad = 12;
      void sut.loadData(data, { isPaginated: true });
      sut.loadAllData().then((loaded) => {
        loadedCount = loaded.loadedRowsCount;
      });

      await delay();
      const rows = createTreeWithLength(toLoad);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      expect(loadedCount).to.be.equal(0);
      loadService.emit(MessageType.DATA_FINISH);
      await delay();
      expect(loadedCount).to.be.equal(toLoad);
    });

    it('should NOT clear loadAllDataPromise if "loadData" method called in between', async () => {
      let resolved = false;
      let rejected = false;
      const pageSize = 10;
      void sut.loadData(data, { pageSize, isPaginated: true });
      sut
        .loadAllData()
        .then(() => {
          resolved = true;
        })
        .catch(() => {
          rejected = true;
        });
      void sut.loadData(data, { pageSize });
      await delay();
      const rows = createTreeWithLength(12);
      loadService.emit(MessageType.DATA, rows);
      loadService.emit(MessageType.DATA_FINISH);
      await delay();
      expect(resolved).to.be.false;
      expect(rejected).to.be.false;
    });

    it('should return Promise.resolve if whole data loaded', async () => {
      let resolved = false;
      const pageSize = 10;
      void sut.loadData(data, { pageSize, isPaginated: true });
      await delay();
      const rows = createTreeWithLength(12);
      loadService.emit(MessageType.DATA, rows);
      loadService.emit(MessageType.DATA_FINISH);
      sut.loadAllData().then(() => {
        resolved = true;
      });
      await delay();
      expect(resolved).to.be.true;
    });

    it('should not return new Promise if loadAllData called multiple', () => {
      const pageSize = 10;
      void sut.loadData(data, { pageSize, isPaginated: true });
      const firstCall = sut.loadAllData();
      const secondCall = sut.loadAllData();
      expect(firstCall).to.be.equal(secondCall);
    });

    describe('with Throttle', () => {
      let data: JaqlRequest;

      beforeEach(() => {
        loadService = new TestDataLoadService('http://test');
        testOptions = {
          throttleTime: 10,
        };
        sut = new DataService(loadService, undefined, testOptions, logger);
        data = createTestJaql();
      });

      it('should not be resolved until data load finished', async () => {
        let loaded = false;

        void sut.loadData(data, { isPaginated: true });
        sut.loadAllData().then(() => {
          loaded = true;
        });

        await delay();
        expect(loaded).to.be.false;
        const rows = createTreeWithLength(12);
        loadService.emit(MessageType.DATA, rows);
        await delay();
        expect(loaded).to.be.false;
        loadService.emit(MessageType.DATA_FINISH);
        // need to delay because throttling is in place
        await delay(50);
        expect(loaded).to.be.true;
      });
    });
  });

  describe('getSelectedPageData', () => {
    it('should throw an Error if loadedCount = 0', () => {
      expect(() => {
        sut.getSelectedPageData(0);
      }).to.throw(Error, /of elements range/);
    });

    it('should throw an Error if loadedCount < selected * pageSize', async () => {
      // For example, selected = 2 and pageSize = 10
      // loadedCount needs to be >= 2 * 10 = 20
      const jaql = createTestJaql();
      void sut.loadData(jaql, { pageSize: 42, isPaginated: true });
      await delay();
      const rows = createTreeWithLength(40);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      loadService.emit(MessageType.DATA);
      await delay();
      expect(() => {
        sut.getSelectedPageData(1);
      }).to.throw(Error, /of elements range/);
    });

    it('should throw an Error if selected < 0', () => {
      expect(() => {
        sut.getSelectedPageData(-1);
      }).to.throw(Error, /Selected page must be >= 0/);
    });

    it('should return new rowsTreeService if data is enough', async () => {
      let firstRowsTreeService: TreeServiceI | undefined;
      let secondRowsTreeService: TreeServiceI | undefined;

      await delay();
      const rows = createTreeWithLength(7);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      loadService.emit(MessageType.DATA);
      await delay();
      sut.getSelectedPageData(0).then(({ rowsTreeService }) => {
        firstRowsTreeService = rowsTreeService;
      });
      sut.getSelectedPageData(0).then(({ rowsTreeService }) => {
        secondRowsTreeService = rowsTreeService;
      });
      await delay();
      expect(firstRowsTreeService).toBeDefined();
      expect(secondRowsTreeService).toBeDefined();
      expect(firstRowsTreeService).not.to.be.equal(secondRowsTreeService);
    });

    it('should set new pageSize', async () => {
      const newPageSize = 20;
      let rowsTreeServiceChildLength = 0;
      await delay();
      const rows = createTreeWithLength(40);
      loadService.emit(MessageType.DATA, rows);
      await delay();
      loadService.emit(MessageType.DATA);
      await delay();
      sut.getSelectedPageData(0, newPageSize).then(({ rowsTreeService }) => {
        if (rowsTreeService) {
          rowsTreeServiceChildLength = rowsTreeService.getTreeChildLength();
        }
      });
      await delay();
      expect(rowsTreeServiceChildLength).to.be.equal(newPageSize);
    });
  });

  describe('preProcessTree', () => {
    let jaql: JaqlRequest;

    beforeEach(() => {
      jaql = createTestJaql(
        createTypedPanels(PanelType.ROWS, 3, 1),
        createTypedPanels(PanelType.COLUMNS, 5, 3),
        createTypedPanels(PanelType.MEASURES, 7, 5),
      );

      sut.loadData(jaql);
    });

    it('should return array', () => {
      const item1 = createTreeNode('child-1');
      const item2 = createTreeNode('child-2');
      const items = [item1, item2];
      const res = sut.preProcessTree(items, PanelType.ROWS);

      expect(res).to.be.an('array');
    });

    it('should return new array for list of items', () => {
      const item1 = createTreeNode('child-1');
      const item2 = createTreeNode('child-2');
      const items = [item1, item2];
      const res = sut.preProcessTree(items, PanelType.ROWS);

      expect(res).not.to.be.equal(items);
      expect(res[0]).to.be.equal(item1);
      expect(res[1]).to.be.equal(item2);
    });

    it('should return new children array for single item', () => {
      const item1 = createTreeNode('child-1');
      const item2 = createTreeNode('child-2');
      const item = createTreeNode('parent', [item1, item2]);
      const res = sut.preProcessTree(item, PanelType.ROWS);

      expect(res).not.to.be.equal(treeNode.getChildren(item));
      expect(res[0]).to.be.equal(item1);
      expect(res[1]).to.be.equal(item2);
    });

    it('should fill "metadataType" according to panel type', () => {
      const item11: PivotTreeNode = createTreeNode('child-1-1');
      const item1: PivotTreeNode = createTreeNode('child-1', [item11]);
      const item21: PivotTreeNode = createTreeNode('child-2-1');
      const item2: PivotTreeNode = createTreeNode('child-2', [item21]);
      const items = [item1, item2];
      sut.preProcessTree(items, PanelType.ROWS);

      expect(item1.metadataType).to.be.equal(PanelType.ROWS);
      expect(item2.metadataType).to.be.equal(PanelType.ROWS);
      expect(item11.metadataType).to.be.equal(PanelType.ROWS);
      expect(item21.metadataType).to.be.equal(PanelType.ROWS);

      sut.preProcessTree(items, PanelType.COLUMNS);

      expect(item1.metadataType).to.be.equal(PanelType.COLUMNS);
      expect(item2.metadataType).to.be.equal(PanelType.COLUMNS);
      expect(item11.metadataType).to.be.equal(PanelType.COLUMNS);
      expect(item21.metadataType).to.be.equal(PanelType.COLUMNS);
    });

    it('should fill "jaqlIndex" according to panel type and level', () => {
      const item11: PivotTreeNode = createTreeNode('child-1-1');
      const item1: PivotTreeNode = createTreeNode('child-1', [item11]);
      const item21: PivotTreeNode = createTreeNode('child-2-1');
      const item2: PivotTreeNode = createTreeNode('child-2', [item21]);
      const items = [item1, item2];
      sut.preProcessTree(items, PanelType.ROWS);

      expect(item1.jaqlIndex).to.be.equal(1);
      expect(item2.jaqlIndex).to.be.equal(1);
      expect(item11.jaqlIndex).to.be.equal(2);
      expect(item21.jaqlIndex).to.be.equal(2);

      sut.preProcessTree(items, PanelType.COLUMNS);

      expect(item1.jaqlIndex).to.be.equal(3);
      expect(item2.jaqlIndex).to.be.equal(3);
      expect(item11.jaqlIndex).to.be.equal(4);
      expect(item21.jaqlIndex).to.be.equal(4);
    });

    it('should fill "measurePath" according to item value, panel type and level', () => {
      const item11: PivotTreeNode = createTreeNode('child-1-1');
      const item1: PivotTreeNode = createTreeNode('child-1', [item11]);
      const item21: PivotTreeNode = createTreeNode('child-2-1');
      const item2: PivotTreeNode = createTreeNode('child-2', [item21]);
      const items = [item1, item2];
      sut.preProcessTree(items, PanelType.ROWS);

      expect(item1.measurePath).to.be.deep.equal({
        1: 'child-1',
      });
      expect(item2.measurePath).to.be.deep.equal({
        1: 'child-2',
      });
      expect(item11.measurePath).to.be.deep.equal({
        1: 'child-1',
        2: 'child-1-1',
      });
      expect(item21.measurePath).to.be.deep.equal({
        1: 'child-2',
        2: 'child-2-1',
      });

      sut.preProcessTree(items, PanelType.COLUMNS);

      expect(item1.measurePath).to.be.deep.equal({
        3: 'child-1',
      });
      expect(item2.measurePath).to.be.deep.equal({
        3: 'child-2',
      });
      expect(item11.measurePath).to.be.deep.equal({
        3: 'child-1',
        4: 'child-1-1',
      });
      expect(item21.measurePath).to.be.deep.equal({
        3: 'child-2',
        4: 'child-2-1',
      });
    });
  });

  describe('postProcessTree', () => {
    let rowsPanels: Array<JaqlPanel>;
    let columnsPanels: Array<JaqlPanel>;
    let measuresPanels: Array<JaqlPanel>;
    let jaql: JaqlRequest;
    let item11: PivotTreeNode;
    let item1: PivotTreeNode;
    let item21: PivotTreeNode;
    let item2: PivotTreeNode;
    let items: Array<PivotTreeNode>;

    beforeEach(() => {
      rowsPanels = createTypedPanels(PanelType.ROWS, 3, 1);
      columnsPanels = createTypedPanels(PanelType.COLUMNS, 5, 3);
      measuresPanels = createTypedPanels(PanelType.MEASURES, 7, 5);

      jaql = createTestJaql(rowsPanels, columnsPanels, measuresPanels);

      item11 = createTreeNode('child-1-1');
      item1 = createTreeNode('child-1', [item11]);
      item21 = createTreeNode('child-2-1');
      item2 = createTreeNode('child-2', [item21]);
      items = [item1, item2];

      sut.loadData(jaql);
    });

    it(`should trigger "${EVENT_HEADER_CELL_FORMAT}" event for each item`, () => {
      const res: Array<PivotTreeNode> = [];
      sut.on(EVENT_HEADER_CELL_FORMAT, (item: PivotTreeNode) => {
        res.push(item);
      });
      sut.postProcessTree(items);
      expect(res.length).to.be.equal(4);
      expect(res[0]).to.be.equal(item1);
      expect(res[1]).to.be.equal(item11);
      expect(res[2]).to.be.equal(item2);
      expect(res[3]).to.be.equal(item21);
    });

    it(`should trigger "${EVENT_HEADER_CELL_FORMAT}" event with panel info`, () => {
      const res: Array<Array<PivotTreeNode | JaqlPanel>> = [];
      const preProcessedItems = sut.preProcessTree(items, PanelType.ROWS);
      sut.on(EVENT_HEADER_CELL_FORMAT, (item: PivotTreeNode, panel: JaqlPanel) => {
        res.push([item, panel]);
      });
      sut.postProcessTree(preProcessedItems);
      expect(res.length).to.be.equal(4);
      expect(res[0][1]).to.be.equal(rowsPanels[0]);
      expect(res[1][1]).to.be.equal(rowsPanels[1]);
      expect(res[2][1]).to.be.equal(rowsPanels[0]);
      expect(res[3][1]).to.be.equal(rowsPanels[1]);
    });

    it(`should trigger "${EVENT_HEADER_CELL_FORMAT}" event with panel info also`, () => {
      const res: Array<Array<PivotTreeNode | JaqlPanel>> = [];
      const preProcessedItems = sut.preProcessTree(items, PanelType.COLUMNS);
      sut.on(EVENT_HEADER_CELL_FORMAT, (item: PivotTreeNode, panel: JaqlPanel) => {
        res.push([item, panel]);
      });
      sut.postProcessTree(preProcessedItems);
      expect(res.length).to.be.equal(4);
      expect(res[0][1]).to.be.equal(columnsPanels[0]);
      expect(res[1][1]).to.be.equal(columnsPanels[1]);
      expect(res[2][1]).to.be.equal(columnsPanels[0]);
      expect(res[3][1]).to.be.equal(columnsPanels[1]);
    });
  });

  describe('modifyTree', () => {
    let rowsPanels: Array<JaqlPanel>;
    let columnsPanels: Array<JaqlPanel>;
    let measuresPanels: Array<JaqlPanel>;
    let jaql: JaqlRequest;

    describe('single case', () => {
      beforeEach(() => {
        rowsPanels = createTypedPanels(PanelType.ROWS, 3, 1); // 3
        columnsPanels = createTypedPanels(PanelType.COLUMNS, 5, 3); // 2
        measuresPanels = createTypedPanels(PanelType.MEASURES, 7, 5); // 2

        jaql = createTestJaql(rowsPanels, columnsPanels, measuresPanels);

        sut.loadData(jaql);
      });

      it('should set "parent reference for each node"', () => {
        const item11: PivotTreeNode = createTreeNode('child-1-1');
        const item1: PivotTreeNode = createTreeNode('child-1', [item11]);
        const item21: PivotTreeNode = createTreeNode('child-2-1');
        const item2: PivotTreeNode = createTreeNode('child-2', [item21]);
        const items = [item1, item2];
        const parentItem = createTreeNode('parent', items);

        sut.modifyTree(items, PanelType.ROWS, parentItem);
        expect(item1.parent).to.be.undefined;
        expect(item11.parent).to.be.equal(item1);
        expect(item2.parent).to.be.undefined;
        expect(item21.parent).to.be.equal(item2);
      });
    });

    describe('with subtotals', () => {
      beforeEach(() => {
        rowsPanels = createTypedPanels(PanelType.ROWS, 3, 1); // 3
        columnsPanels = createTypedPanels(PanelType.COLUMNS, 5, 3); // 2
        measuresPanels = createTypedPanels(PanelType.MEASURES, 7, 5); // 2

        jaql = createTestJaql(rowsPanels, columnsPanels, measuresPanels);

        sut.loadData(jaql);
      });

      it('should insert subtotal items', () => {
        const item11: PivotTreeNode = createTreeNode('child-1-1');
        const item1: PivotTreeNode = createTreeNode('child-1', [item11], undefined, 1);
        const item21: PivotTreeNode = createTreeNode('child-2-1');
        const item22: PivotTreeNode = createTreeNode('child-2-2');
        const item2: PivotTreeNode = createTreeNode('child-2', [item21, item22], undefined, 2);
        const items = [item1, item2];
        const parentItem = createTreeNode('parent', items);

        const res = sut.modifyTree(items, PanelType.COLUMNS, parentItem);
        expect(res).to.be.length(3);
        expect(res[2]).to.have.property('userType', UserType.SUB_TOTAL);
        expect(res[2].master).to.equal(item2);
      });

      it('should insert subtotal items for cut item', () => {
        const item11: PivotTreeNode = createTreeNode('child-1-1');
        const item1: PivotTreeNode = createTreeNode('child-1', [item11], undefined, 1);
        item1.isPart = true;
        const item21: PivotTreeNode = createTreeNode('child-2-1');
        const item22: PivotTreeNode = createTreeNode('child-2-2');
        const item2: PivotTreeNode = createTreeNode('child-2', [item21, item22], undefined, 2);
        const items = [item1, item2];
        const parentItem = createTreeNode('parent', items);

        const res = sut.modifyTree(items, PanelType.COLUMNS, parentItem);
        expect(res).to.be.length(4);
        expect(res[1]).to.have.property('userType', UserType.SUB_TOTAL);
        expect(res[1].master).to.equal(item1);
        expect(res[3]).to.have.property('userType', UserType.SUB_TOTAL);
        expect(res[3].master).to.equal(item2);
      });
    });

    describe('for several measures', () => {
      beforeEach(() => {
        rowsPanels = createTypedPanels(PanelType.ROWS, 3, 1); // 3
        columnsPanels = createTypedPanels(PanelType.COLUMNS, 5, 3); // 2
        measuresPanels = createTypedPanels(PanelType.MEASURES, 7, 5); // 2

        jaql = createTestJaql(rowsPanels, columnsPanels, measuresPanels);

        sut.loadData(jaql);
      });

      it('should insert measure items', () => {
        const item11: PivotTreeNode = createTreeNode('child-1-1');
        const item1: PivotTreeNode = createTreeNode('child-1', [item11]);
        const item21: PivotTreeNode = createTreeNode('child-2-1');
        const item22: PivotTreeNode = createTreeNode('child-2-2');
        const item2: PivotTreeNode = createTreeNode('child-2', [item21, item22]);
        const items = [item1, item2];
        const parentItem = createTreeNode('parent', items);

        sut.modifyTree(items, PanelType.COLUMNS, parentItem);
        expect(item11.children).to.be.length(2);
      });

      it('should insert limited measure items', () => {
        const item11: PivotTreeNode = createTreeNode('child-1-1');
        item11.maxChilds = 1;
        const item1: PivotTreeNode = createTreeNode('child-1', [item11]);
        const item21: PivotTreeNode = createTreeNode('child-2-1');
        const item22: PivotTreeNode = createTreeNode('child-2-2');
        const item2: PivotTreeNode = createTreeNode('child-2', [item21, item22]);
        const items = [item1, item2];
        const parentItem = createTreeNode('parent', items);

        sut.modifyTree(items, PanelType.COLUMNS, parentItem);
        expect(item11.children).to.be.length(1);
      });

      it('should insert measure items into subtotals', () => {
        const item11: PivotTreeNode = createTreeNode('child-1-1');
        const item1: PivotTreeNode = createTreeNode('child-1', [item11], undefined, 1);
        const item21: PivotTreeNode = createTreeNode('child-2-1');
        const item22: PivotTreeNode = createTreeNode('child-2-2');
        const item2: PivotTreeNode = createTreeNode('child-2', [item21, item22], undefined, 2);
        const items = [item1, item2];
        const parentItem = createTreeNode('parent', items);

        const res = sut.modifyTree(items, PanelType.COLUMNS, parentItem);
        expect(res[2]).to.have.property('userType', UserType.SUB_TOTAL);
        expect(res[2].children).to.be.length(2);
      });
    });
  });

  describe('DataService.fillDataChunks', () => {
    let maxSize: number;

    function createDataNode(value?: string, size = 1, children: Array<TreeNode> = []) {
      const res = createTreeNode(value, children);
      res.size = size;
      return res;
    }

    function fillDataChunks(list: Array<NodesChunk>, node: TreeNode, maxFistSize = maxSize) {
      return DataService.fillDataChunks(list, node, maxFistSize, maxSize);
    }

    beforeEach(() => {
      maxSize = 5;
    });

    it('should exist', () => {
      expect(DataService.fillDataChunks).to.be.exist;
    });

    it('should ignore empty chunk', () => {
      const res: Array<NodesChunk> = [];
      const data = createDataNode('', 1);
      data.data = [];
      delete data.value;
      delete data.children;

      fillDataChunks(res, data);

      expect(res.length).to.be.equal(0);
    });

    it('should not ignore no data chunk', () => {
      const res: Array<NodesChunk> = [];
      const data = createDataNode('', 1);
      data.data = [];
      delete data.children;

      fillDataChunks(res, data);

      expect(res.length).to.be.equal(1);
    });

    it('should leave last chunk as not ready', () => {
      const res: Array<NodesChunk> = [];
      const data1 = createDataNode('test-1', 2);
      const data2 = createDataNode('test-2', 2);
      const data3 = createDataNode('test-3', 2);
      const data4 = createDataNode('test-4', 2);

      fillDataChunks(res, data1);
      fillDataChunks(res, data2);
      fillDataChunks(res, data3);
      fillDataChunks(res, data4);

      expect(res[0].ready).to.be.true;
      expect(res[1].ready).to.be.false;
    });

    it('should merge small data nodes in chunks', () => {
      const res: Array<NodesChunk> = [];
      const data1 = createDataNode('test-1');
      const data2 = createDataNode('test-2');
      const data3 = createDataNode('test-3');
      const data4 = createDataNode('test-4');

      fillDataChunks(res, data1);
      fillDataChunks(res, data2);
      fillDataChunks(res, data3);
      fillDataChunks(res, data4);

      expect(res).to.be.deep.equal([
        {
          list: [data1, data2, data3, data4],
          size: 4,
          handled: false,
          ready: false,
        },
      ]);
    });

    it('should put big data nodes to separate chunks', () => {
      const res: Array<NodesChunk> = [];
      const data1 = createDataNode('test-1', 10);
      const data2 = createDataNode('test-2', 10);

      fillDataChunks(res, data1);
      fillDataChunks(res, data2);

      expect(res).to.be.deep.equal([
        {
          list: [data1],
          size: 10,
          handled: false,
          ready: true,
        },
        {
          list: [data2],
          size: 10,
          handled: false,
          ready: false,
        },
      ]);
    });

    it('should mix small and big data nodes to chunks', () => {
      const res: Array<NodesChunk> = [];
      const data1 = createDataNode('test-1', 1);
      const data2 = createDataNode('test-2', 10);
      const data3 = createDataNode('test-3', 1);
      const data4 = createDataNode('test-4', 1);
      const data5 = createDataNode('test-5', 10);

      fillDataChunks(res, data1);
      fillDataChunks(res, data2);
      fillDataChunks(res, data3);
      fillDataChunks(res, data4);
      fillDataChunks(res, data5);

      expect(res).to.be.deep.equal([
        {
          list: [data1],
          size: 1,
          handled: false,
          ready: true,
        },
        {
          list: [data2],
          size: 10,
          handled: false,
          ready: true,
        },
        {
          list: [data3, data4],
          size: 2,
          handled: false,
          ready: true,
        },
        {
          list: [data5],
          size: 10,
          handled: false,
          ready: false,
        },
      ]);
    });

    it('should return first chunk as small as possible', () => {
      const res: Array<NodesChunk> = [];
      const data1 = createDataNode('test-1');
      const data2 = createDataNode('test-2');
      const data3 = createDataNode('test-3');
      const data4 = createDataNode('test-4');
      const data5 = createDataNode('test-5');
      const data6 = createDataNode('test-6');
      const data7 = createDataNode('test-7');
      const data8 = createDataNode('test-8');
      const data9 = createDataNode('test-9');

      fillDataChunks(res, data1, 3);
      fillDataChunks(res, data2, 3);
      fillDataChunks(res, data3, 3);
      fillDataChunks(res, data4, 3);
      fillDataChunks(res, data5, 3);
      fillDataChunks(res, data6, 3);
      fillDataChunks(res, data7, 3);
      fillDataChunks(res, data8, 3);
      fillDataChunks(res, data9, 3);

      expect(res).to.be.deep.equal([
        {
          list: [data1, data2, data3],
          size: 3,
          handled: false,
          ready: true,
        },
        {
          list: [data4, data5, data6, data7, data8],
          size: 5,
          handled: false,
          ready: true,
        },
        {
          list: [data9],
          size: 1,
          handled: false,
          ready: false,
        },
      ]);
    });

    describe('for split nodes', () => {
      it('should put partial nodes to single data chunk', () => {
        const res: Array<NodesChunk> = [];
        const data1 = createDataNode('test-1', 2, [createTreeNode('1.1'), createTreeNode('1.2')]);
        data1.isPart = true;
        const data2 = createDataNode('test-1', 2, [createTreeNode('1.3'), createTreeNode('1.4')]);
        data2.isPart = true;

        fillDataChunks(res, data1);
        fillDataChunks(res, data2);

        expect(res).to.be.deep.equal([
          {
            list: [data1],
            size: 4,
            handled: false,
            ready: false,
          },
        ]);
      });

      it('should put different partial nodes to separate single data chunk', () => {
        const res: Array<NodesChunk> = [];
        const data1 = createDataNode('test-1', 2, [createTreeNode('1.1'), createTreeNode('1.2')]);
        data1.isPart = true;
        const data2 = createDataNode('test-1', 2, [createTreeNode('1.3'), createTreeNode('1.4')]);
        data2.isPart = true;

        const data3 = createDataNode('test-2', 2, [createTreeNode('2.1'), createTreeNode('2.2')]);
        data3.isPart = true;
        const data4 = createDataNode('test-2', 2, [createTreeNode('2.3'), createTreeNode('2.4')]);
        data4.isPart = true;

        fillDataChunks(res, data1);
        fillDataChunks(res, data2);
        fillDataChunks(res, data3);
        fillDataChunks(res, data4);

        expect(res).to.be.deep.equal([
          {
            list: [data1],
            size: 4,
            handled: false,
            ready: true,
          },
          {
            list: [data3],
            size: 4,
            handled: false,
            ready: false,
          },
        ]);
      });

      it('should put partial nodes to one data chunk', () => {
        const res: Array<NodesChunk> = [];
        const data1 = createDataNode('test-1', 2, [createTreeNode('1.1'), createTreeNode('1.2')]);
        const data2 = createDataNode('test-2', 2, [createTreeNode('2.1'), createTreeNode('2.2')]);
        data2.isPart = true;
        const data3 = createDataNode('test-2', 2, [createTreeNode('2.3'), createTreeNode('2.4')]);
        data3.isPart = true;
        const data4 = createDataNode('test-3', 2, [createTreeNode('3.1'), createTreeNode('3.2')]);

        const data2Merged = createDataNode('test-2', 2, [
          createTreeNode('2.1'),
          createTreeNode('2.2'),
          createTreeNode('2.3'),
          createTreeNode('2.4'),
        ]);
        data2Merged.isPart = true;
        data2Merged.level = 0;
        fillDataChunks(res, data1);
        fillDataChunks(res, data2);
        fillDataChunks(res, data3);
        fillDataChunks(res, data4);

        expect(res).to.be.deep.equal([
          {
            list: [data1],
            size: 2,
            handled: false,
            ready: true,
          },
          {
            list: [data2Merged],
            size: 4,
            handled: false,
            ready: true,
          },
          {
            list: [data4],
            size: 2,
            handled: false,
            ready: false,
          },
        ]);
      });
    });
  });

  describe('DataService.cloneTreeNode', () => {
    it('should return cloned instance', () => {
      const test = createTreeNode('aaa');
      const res = DataService.cloneTreeNode(test);
      expect(res).to.not.equal(test);
    });

    it('should return cloned instance with cloned children', () => {
      const test = createTreeNode('aaa', [
        createTreeNode('bbb'),
        createTreeNode('ccc', [createTreeNode('ddd')]),
      ]);
      const res = DataService.cloneTreeNode(test);
      expect(res.value).to.be.equal('aaa');
      expect(res.children).to.not.equal(test.children);
      // @ts-ignore
      expect(res.children[1].value).to.be.equal('ccc');
      // @ts-ignore
      expect(res.children[1]).to.not.equal(test.children[1]);
      // @ts-ignore
      expect(res.children[1].children).to.not.equal(test.children[1].children);
      // @ts-ignore
      expect(res.children[1].children[0].value).to.be.equal('ddd');
      // @ts-ignore
      expect(res.children[1].children[0]).to.not.equal(test.children[1].children[0]);
    });

    it('should not clone some props', () => {
      const ddd = createTreeNode('ddd');
      const ccc = createTreeNode('ccc', [ddd]);
      const bbb = createTreeNode('bbb');
      const test = createTreeNode('aaa', [bbb, ccc]);

      // @ts-ignore
      bbb.master = test;

      const res = DataService.cloneTreeNode(test);
      // @ts-ignore
      expect(res.children[0].value).to.be.equal('bbb');
      // @ts-ignore
      expect(res.children[0].master).to.be.exist;
      // @ts-ignore
      expect(res.children[0].master).to.be.equal(test);
      // @ts-ignore
      expect(res.children[1].children).to.not.equal(test.children[1].children);
      // @ts-ignore
      expect(res.children[1].children[0].value).to.be.equal('ddd');
      // @ts-ignore
      expect(res.children[1].children[0].parent).to.be.exist;
      // @ts-ignore
      expect(res.children[1].children[0].parent).to.be.equal(res.children[1]);
    });

    it('should deep clone some props', () => {
      const ddd = createTreeNode('ddd');
      const ccc = createTreeNode('ccc', [ddd]);
      const bbb = createTreeNode('bbb');
      const test = createTreeNode('aaa', [bbb, ccc]);

      // @ts-ignore
      bbb.data = { data: true };
      // @ts-ignore
      bbb.state = { state: true };
      // @ts-ignore
      ddd.style = { style: true };
      // @ts-ignore
      ddd.store = { store: true };

      const res = DataService.cloneTreeNode(test);
      // @ts-ignore
      expect(res.children[0].value).to.be.equal('bbb');
      // @ts-ignore
      expect(res.children[0].data).to.not.equal(bbb.data);
      // @ts-ignore
      expect(res.children[0].data).to.be.deep.equal({ data: true });
      // @ts-ignore
      expect(res.children[0].state).to.not.equal(bbb.state);
      // @ts-ignore
      expect(res.children[0].state).to.be.deep.equal({ state: true });
      // @ts-ignore
      expect(res.children[1].children[0].value).to.be.equal('ddd');
      // @ts-ignore
      expect(res.children[1].children[0].style).to.not.equal(bbb.style);
      // @ts-ignore
      expect(res.children[1].children[0].style).to.be.deep.equal({ style: true });
      // @ts-ignore
      expect(res.children[1].children[0].store).to.not.equal(bbb.store);
      // @ts-ignore
      expect(res.children[1].children[0].store).to.be.deep.equal({ store: true });
    });

    it('should reset several internal props', () => {
      const ddd = createTreeNode('ddd');
      const ccc = createTreeNode('ccc', [ddd]);
      const bbb = createTreeNode('bbb');
      const test = createTreeNode('aaa', [bbb, ccc]);

      bbb.isMapped = true;
      bbb.minLevel = 0;
      ddd.childCount = 10;
      ddd.childDeep = 0;

      const res = DataService.cloneTreeNode(test);
      // @ts-ignore
      expect(res.children[0].value).to.be.equal('bbb');
      // @ts-ignore
      expect(res.children[0].isMapped).not.to.be.exist;
      // @ts-ignore
      expect(res.children[0].minLevel).not.to.be.exist;
      // @ts-ignore
      expect(res.children[1].children[0].value).to.be.equal('ddd');
      // @ts-ignore
      expect(res.children[1].children[0].childCount).not.to.be.exist;
      // @ts-ignore
      expect(res.children[1].children[0].childDeep).not.to.be.exist;
    });

    it('should skip children props form clone', () => {
      const ddd = createTreeNode('ddd');
      const ccc = createTreeNode('ccc', [ddd]);
      const bbb = createTreeNode('bbb');
      const test = createTreeNode('aaa', [bbb, ccc]);

      const res = DataService.cloneTreeNode(test, true);
      // @ts-ignore
      expect(res.value).to.be.equal('aaa');
      // @ts-ignore
      expect(res.childrend).not.to.be.exist;

      const res2 = DataService.cloneTreeNode(ccc, true);
      // @ts-ignore
      expect(res2.value).to.be.equal('ccc');
      // @ts-ignore
      expect(res2.childrend).not.to.be.exist;
    });

    it('should save child-parent circular connection after cloning', () => {
      const test = createTreeNode('aaa', [
        createTreeNode('bbb'),
        createTreeNode('ccc', [createTreeNode('ddd')]),
      ]);

      const res = DataService.cloneTreeNode(test);
      // @ts-ignore
      expect(res.children[0].parent).to.be.equal(res);
      // @ts-ignore
      expect(res.children[1].children[0].parent).to.be.equal(res.children[1]);
    });
  });
});
