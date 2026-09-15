---
title: ContextMenu
---

# Function ContextMenu

> **ContextMenu**(`__namedParameters`): `Element`

Context menu

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | [`ContextMenuProps`](../interfaces/interface.ContextMenuProps.md) |

## Returns

`Element`

## Example

```ts
import { useState } from 'react';
import { ContextMenu, MenuPosition } from '@sisense/sdk-ui';

const CodeExample = () => {
  const [position, setPosition] = useState<MenuPosition | null>(null);

  return (
    <div
      onContextMenu={(event) => {
        event.preventDefault();
        setPosition({ left: event.clientX, top: event.clientY });
      }}
    >
      Right-click me
      <ContextMenu
        position={position}
        closeContextMenu={() => setPosition(null)}
        itemSections={[
          { items: [{ caption: 'Option 1', onClick: () => console.log('Option 1') }] },
        ]}
      />
    </div>
  );
};

export default CodeExample;
```
