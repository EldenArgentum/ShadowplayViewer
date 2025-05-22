import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import "@mantine/core/styles.css"
import { MantineProvider } from '@mantine/core'
import {Notifications} from "@mantine/notifications";
import {ModalsProvider} from "@mantine/modals";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <MantineProvider defaultColorScheme="dark" >
          <ModalsProvider>
              <Notifications position="bottom-right"/>
              <App />
          </ModalsProvider>
      </MantineProvider>
  </React.StrictMode>,
)

// Use contextBridge
if (window.ipcRenderer) {
    window.ipcRenderer.on('main-process-message', (_event:any, message:any) => {
      console.log(message)
    })
}
