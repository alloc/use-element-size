import { useCallback, useEffect, useState, RefCallback } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'

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
        sensor.onload = () => {
          scheduleSizeUpdate(state)
          sensor!.contentDocument!.defaultView!.addEventListener(
            'resize',
            () => scheduleSizeUpdate(state)
          )
        }

        elem!.appendChild(sensor)
      }
      state.sensor = sensor
      scheduleSizeUpdate(state)
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

// Size updates are batched on a per-frame basis. This lets us avoid excessive
// re-rendering when multiple handlers need to set React-owned state.
let updateQueue: State[] = []

function scheduleSizeUpdate(state: State) {
  if (!updateQueue.length)
    requestAnimationFrame(() =>
      batchedUpdates(() => {
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
      })
    )

  if (!updateQueue.includes(state)) {
    updateQueue.push(state)
  }
}
