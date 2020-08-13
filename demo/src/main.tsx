import { a, useSpring } from 'react-spring'
import { useElementSize, Size } from 'use-element-size'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'

/**
 * The red box is being tracked via the `useElementSize` ref.
 * The pink box is its parent, whose size affects the red box.
 * The black box is a child of the red box.
 */
const App = () => {
  // When `mounted` is false, the tracked element is unmounted.
  const [mounted, setMounted] = useState(true)

  // When `tracking` is false, the size handler is disabled.
  const [tracking, setTracking] = useState(true)

  // The `text` value lets us print the tracked size in an animated
  // container without needing to re-render the entire `App` component.
  const [{ text }] = useSpring({ text: '' }, [])

  // Update the `text` value when the tracked element is resized.
  const onSizeChange = (size: Size | null) =>
    text.set(`width: ${size?.width ?? null}, height: ${size?.height ?? null}`)

  // The returned `ref` must be used by the tracked element.
  const ref = useElementSize(tracking && onSizeChange)

  // The tracked element can resize at any time.
  const tracked = mounted && (
    <div ref={ref} style={styles.tracked}>
      <div style={styles.child} />
    </div>
  )

  // Animate the parent of the tracked element to prove reactivity.
  const [{ width, height }] = useSpring(() => ({
    to: { width: 200, height: 200 },
    from: { width: 100, height: 100 },
    loop: { reverse: true },
  }))

  // This button can mount/unmount the tracked element to prove reactivity.
  const mountBtn = (
    <button onClick={() => setMounted(m => !m)} style={{ marginBottom: 10 }}>
      {mounted ? 'Unmount it' : 'Mount it'}
    </button>
  )

  // This button can toggle the size tracking.
  const trackBtn = (
    <button onClick={() => setTracking(t => !t)} style={{ marginLeft: 10 }}>
      {tracking ? 'Stop tracking' : 'Start tracking'}
    </button>
  )

  return (
    <>
      {mountBtn}
      {trackBtn}
      <a.div style={styles.text}>{text}</a.div>
      <a.div
        style={{
          width,
          height,
          background: 'pink',
          // Animating width/height is expensive, but this helps a little.
          willChange: 'width, height' as any,
          position: 'relative',
        }}>
        {tracked}
      </a.div>
    </>
  )
}

const styles = {
  // The tracked element uses percentage-based sizing.
  tracked: {
    position: 'relative', // Remove this to break the demo.
    width: '50%',
    height: '50%',
    background: 'red',
  },
  child: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    background: 'black',
  },
  text: {
    whiteSpace: 'nowrap',
    fontFamily: 'sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
} as const

ReactDOM.render(<App />, document.getElementById('root'))
