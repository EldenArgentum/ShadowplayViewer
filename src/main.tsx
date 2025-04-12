import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import "@mantine/core/styles.css"
import { MantineProvider } from '@mantine/core'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <MantineProvider defaultColorScheme="dark">
          <App />
      </MantineProvider>
  </React.StrictMode>,
)

// Use contextBridge
if (window.ipcRenderer) {
    window.ipcRenderer.on('main-process-message', (_event:any, message:any) => {
      console.log(message)
    })
}
