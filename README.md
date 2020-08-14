# use-element-size

Track the size of a `react-dom` element (without `ResizeObserver`).

Only **480 bytes** min+gzip!

## Usage

```tsx
import { useElementSize, Size } from 'use-element-size'
import React, { useState } from 'react'

const Example = () => {
  const ref = useElementSize((size, prevSize, elem) => {
    console.log({ size, prevSize, elem })
  })
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '50%',
        height: '50%',
      }}
    />
  )
}
```

## Quirks

- ⚠️ Be sure the tracked element **never** has `position: static`.

- The `size` parameter is `null` when the tracked element is unmounted.

- The `prevSize` parameter is `null` when the tracked element was just mounted.

- Tracking stops when `useElementSize` is passed `false/null/undefined` instead of a function.

- The callback waits until the next `requestAnimationFrame` tick before running.

## Demo

https://codesandbox.io/s/use-element-size-demo-dszk1?file=/src/index.tsx
