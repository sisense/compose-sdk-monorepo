import { NgModule } from '@angular/core';

import { SisenseContextService } from '../services/sisense-context.service';

@NgModule({
  declarations: [],
  exports: [],
})
export class DecoratorsModule {
  static sisenseContextService: SisenseContextService;

  constructor(sisenseContextService: SisenseContextService) {
    DecoratorsModule.sisenseContextService = sisenseContextService;
  }
}
