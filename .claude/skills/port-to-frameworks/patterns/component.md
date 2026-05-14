# Pattern: Component port

Reference implementations: `Chart`, `Dashboard`.

## Angular shape

File: `packages/sdk-ui-angular/src/lib/components/<domain>/<kebab-name>.component.ts`

```typescript
import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input,
  OnChanges, OnDestroy, Output, ViewChild,
} from '@angular/core';
import {
  ComponentAdapter,
  <SymbolName> as <SymbolName>Preact,
  type <SymbolName>Props as <SymbolName>PropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
  createPluginContextConnector,
} from '../../component-wrapper-helpers/context-connectors';
import { template, rootId, styles } from '../../component-wrapper-helpers/template';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';

/**
 * <Adapted TSDoc — see patterns/tsdoc.md>
 *
 * @group <from React source>
 */
@Component({
  selector: 'csdk-<kebab-name>',
  template,
  styles,
})
export class <SymbolName>Component implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild(rootId) preactRef!: ElementRef<HTMLDivElement>;

  /** <TSDoc for prop — short> */
  @Input() <propName>!: <SymbolName>Props['<propName>'];
  // …one @Input per prop. Use `?:` for optional, `!:` for required.

  /** <TSDoc for event — short> */
  @Output() <eventName> = new EventEmitter<<EventType>>();

  private componentAdapter: ComponentAdapter<typeof <SymbolName>Preact>;

  constructor(
    public sisenseContextService: SisenseContextService,
    public themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(<SymbolName>Preact, [
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
      createPluginContextConnector(this.sisenseContextService),
    ]);
  }

  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
  }

  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
    }
  }

  ngOnDestroy() {
    this.componentAdapter.destroy();
  }

  private getPreactComponentProps(): <SymbolName>PropsPreact {
    return {
      <propName>: this.<propName>,
      // Map event callbacks — React calls the fn, Angular must emit:
      on<Event>: (arg) => this.<eventName>.emit(arg),
    };
  }
}
```

**Type re-exports**:

- `<SymbolName>Props` — re-export from **the component file itself**, right next to the component export. This keeps the props type colocated with the component, matching neighbor components.

  ```typescript
  export type { <SymbolName>Props } from '@sisense/sdk-ui-preact';
  ```

- Any **other** referenced types (events, enums, helper shapes, related domain types) — add to `src/lib/sdk-ui-core-exports.ts` if not already there.

  ```typescript
  export type { <OtherType>, <OtherType2> } from '@sisense/sdk-ui-preact';
  ```

All re-exports must come from `@sisense/sdk-ui-preact` — never from `@sisense/sdk-ui` directly.

**Module registration**: Add to `src/lib/sdk-ui.module.ts`:

```typescript
declarations: [..., <SymbolName>Component],
exports:      [..., <SymbolName>Component],
```

And to `src/lib/components/index.ts` (follow neighbor style):

```typescript
export { <SymbolName>Component } from './<domain>/<kebab-name>.component';
```

## Vue shape

File: `packages/sdk-ui-vue/src/components/<domain>/<kebab-name>.ts`

```typescript
import { defineComponent, type PropType } from 'vue';
import {
  <SymbolName> as <SymbolName>Preact,
  type <SymbolName>Props,
} from '@sisense/sdk-ui-preact';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * <Adapted TSDoc — see patterns/tsdoc.md>
 *
 * @group <from React source>
 */
export const <SymbolName> = defineComponent({
  props: {
    <propName>: {
      type: <JS ctor or [Ctor1, Ctor2]> as PropType<<SymbolName>Props['<propName>']>,
      required: <bool>,
    },
    // …
  },
  setup: (props) => setupHelper(<SymbolName>Preact as any, props),
});
```

Prop `type` mapping quick reference:

- `string | undefined` → `String`
- `number` → `Number`
- `boolean` → `Boolean`
- object types → `Object`
- arrays → `Array`
- unions like `string | DataSource` → `[String, Object]`
- functions → `Function`

Register in `packages/sdk-ui-vue/src/components/<domain>/index.ts` (create barrel if it's a new domain) and ensure `src/lib.ts` re-exports it (most domains are re-exported via `export * from './components/<domain>'`).

## Props-translator helpers

If the React props need transformation before reaching preact (e.g. callback-to-observable, shape flattening), add/extend a translator in:

- Angular: `packages/sdk-ui-angular/src/lib/helpers/<name>-props-preact-translator.ts`
- Vue: inline inside `setupHelper` call or adjacent helper

Reference: `chart-props-preact-translator.ts`.

## Pitfalls

- **Selector collisions** — `csdk-*` is the convention. Check no neighbor already owns the selector.
- **Required vs optional** — Angular `@Input()` is always assignable; encode "required" in the TS type (`!:` non-null assertion) and in the TSDoc remark, not a runtime check.
- **Default values** — assign on the property (`@Input() foo = 'default';`), not in the constructor.
- **Change detection** — `ngOnChanges` with a guard on `this.preactRef` — the first change fires _before_ `ngAfterViewInit`, so guard or the render will null-crash.
