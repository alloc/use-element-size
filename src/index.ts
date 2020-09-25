import { useCallback, useEffect, useState, RefCallback } from 'react'

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
    rafId: 0,
  }))

  useEffect(() => {
    if (onSize && !(state.elem || state.onSize)) {
      updateSize()
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
          updateSize()
          sensor!.contentDocument!.defaultView!.addEventListener(
            'resize',
            updateSize
          )
        }

        elem!.appendChild(sensor)
      }
      state.sensor = sensor
      updateSize()
    }
  }

  function updateSize() {
    if (!state.rafId)
      state.rafId = requestAnimationFrame(() => {
        state.rafId = 0

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
}

type Falsy = false | null | undefined

type State = {
  elem: HTMLElement | null
  size: Size | null
  onSize: SizeCallback | Falsy
  sensor: HTMLObjectElement | null
  rafId: number
}
