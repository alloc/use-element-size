import * as reactPlugin from 'vite-plugin-react'
import type { UserConfig } from 'vite'

const config: UserConfig = {
  jsx: 'react',
  plugins: [reactPlugin],
  optimizeDeps: {
    link: ['use-element-size'],
  },
}

export default config
