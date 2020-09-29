import { useCallback, useEffect, useState, RefCallback } from 'react'
import { raf } from 'rafz'

export type Size = { width: number; height: number }
export type SizeCallback = (
  size: Size | null,
  prevSize: Size | null,
  elem: HTMLElement | null
) => void

export function useElementSize(
  onSize: SizeCallback | Falsy
): RefCallback<HTMLElement> {
  let [state] = useState<State>(() => ({
    elem: null,
    size: null,
    onSize,
    sensor: null,
  }))

  useEffect(() => {
    if (onSize && !(state.elem || state.onSize)) {
      scheduleSizeUpdate(state)
    }
    state.onSize = onSize
    updateSensor()
  })

  // Prevent `onSize` calls after unmount.
  useEffect(
    () => () => {
      state.onSize = false
    },
    []
  )

  // The ref function
  return useCallback(elem => {
    state.elem = elem
    updateSensor()
  }, [])

  function updateSensor() {
    let { elem, sensor, onSize } = state
    if (!sensor != !(elem && onSize)) {
      if (sensor) {
        if (loadQueue.delete(state)) {
          onSensorLoaded()
        }
        scheduleSizeUpdate(state)
        sensor.remove()
        sensor = null
      } else {
        sensor = document.createElement('object')
        sensor.data = 'about:blank'
        sensor.tabIndex = -1
        sensor.setAttribute(
          'style',
          'position:absolute;top:0;left:0;height:100%;width:100%;pointer-events:none;z-index:-1'
        )
        loadCount++
        loadQueue.add(state)
        sensor.onload = onSensorLoaded
        elem!.appendChild(sensor)
      }
      state.sensor = sensor
    }
  }
}

type Falsy = false | null | undefined

type State = {
  elem: HTMLElement | null
  size: Size | null
  onSize: SizeCallback | Falsy
  sensor: HTMLObjectElement | null
}

// Sensors can take multiple frames to load, so their load handlers must be
// batched to force initial `onSize` calls into one frame when possible.
// Once the load count hits zero, the load queue is processed.
let loadQueue = new Set<State>()
let loadCount = 0

// The `onload` handler attached to every sensor.
function onSensorLoaded() {
  if (--loadCount == 0) {
    loadQueue.forEach(state => {
      scheduleSizeUpdate(state)
      state.sensor!.contentDocument!.defaultView!.onresize = () =>
        scheduleSizeUpdate(state)
    })
    loadQueue.clear()
  }
}

// Size updates are batched on a per-frame basis. This lets us avoid excessive
// re-rendering when multiple handlers need to set React-owned state.
let updateQueue: State[] = []

function scheduleSizeUpdate(state: State) {
  // Sort the queue so that ancestors update first, which gives descendants
  // access to any synchronous updates made by their ancestors.
  let i = updateQueue.length
  for (; i > 0; i--) {
    let queued = updateQueue[i - 1]
    if (queued == state) return
    if (queued.elem && queued.elem.contains(state.elem)) {
      break // Found an ancestor.
    }
  }

  updateQueue.splice(i, 0, state)
  raf.onFrame(flushSizeUpdates)
}

function flushSizeUpdates() {
  let current = updateQueue
  updateQueue = []
  current.forEach(state => {
    let { elem, size, onSize } = state
    if (onSize)
      onSize(
        (state.size = elem
          ? { width: elem.clientWidth, height: elem.clientHeight }
          : null),
        size,
        elem
      )
  })
}
