import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useElementSize } from 'use-element-size'

/**
 * In this demo, there are two elements, the parent and the child.
 *
 * The child's height is a CSS percentage of its parent's height.
 *
 * The child sets its width in a `useElementSize` callback by
 * looking at its own measured height.
 *
 * The parent sets its height in a `useElementSize` callback by
 * looking at its own measured width.
 *
 * By updating the `style` directly (instead of updating local
 * React state), the child has access to the parent's updated
 * height immediately. This avoids janky updates that take
 * multiple frames to propagate.
 */
export const ResizeDemo = () => {
  // const [height, setHeight] = useState<any>('auto')
  const sizeRef = useElementSize((size, _, elem) => {
    console.log('Parent.size:', size)
    if (size) {
      elem!.style.height = size.width * 0.2 + 'px'
      // setHeight(size.width * 0.2)
    }
  })
  console.log('Parent.render')
  return (
    <div
      id="Parent"
      ref={sizeRef}
      style={{
        position: 'relative',
        width: '100%',
        // height,
        background: 'blue',
      }}>
      <Child />
    </div>
  )
}

const Child = () => {
  // const [width, setWidth] = useState<any>(0)
  const sizeRef = useElementSize((size, _, elem) => {
    console.log('Child.size:', size)
    if (size) {
      elem!.style.width = size.height * 0.5 + 'px'
      // setWidth(size.height * 0.5)
    }
  })
  console.log('Child.render')
  return (
    <div
      id="Child"
      ref={sizeRef}
      style={{
        position: 'relative',
        // width,
        height: '100%',
        background: 'red',
      }}
    />
  )
}

requestAnimationFrame(function loop() {
  requestAnimationFrame(loop)
  console.log('------ FRAME ------')
})

ReactDOM.render(<ResizeDemo />, document.getElementById('root'))
