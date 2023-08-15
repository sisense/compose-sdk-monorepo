import { Component, Input, OnInit } from '@angular/core';
import type { QueryResultData } from '@sisense/sdk-data';
import { ClientApplication, executeQuery, ExecuteQueryProps } from '@sisense/sdk-ui-preact';
import { SisenseContextService } from './sisense-context.service';

/**
 * Execute Query Component
 */
@Component({
  selector: 'lib-execute-query',
  template: '<div>{{ data | async | json }}</div>',
})
export class ExecuteQueryComponent implements OnInit {
  @Input('dataSource')
  dataSource!: ExecuteQueryProps['dataSource'];

  @Input('dimensions')
  dimensions!: ExecuteQueryProps['dimensions'];

  @Input('measures')
  measures!: ExecuteQueryProps['measures'];

  @Input('filters')
  filters!: ExecuteQueryProps['filters'];

  @Input('highlights')
  highlights!: ExecuteQueryProps['highlights'];

  app: ClientApplication | undefined;

  data: Promise<QueryResultData | undefined>;

  constructor(private context: SisenseContextService) {}

  ngOnInit(): void {
    void this.context.appPromise.then((app) => {
      this.app = app;
      this.wrappedExecuteQuery();
    });
  }

  ngOnChanges() {
    this.wrappedExecuteQuery();
  }

  wrappedExecuteQuery() {
    if (!this.app) {
      return;
    }

    const { dataSource, dimensions, measures, filters, highlights } = this;

    this.data = executeQuery(dataSource, dimensions, measures, filters, highlights, this.app);
  }
}
