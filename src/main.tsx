import { setupListeners } from '@reduxjs/toolkit/query'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from './app/routes'
import { createAppStore } from './app/store'
import { initializeTheme } from './app/theme'
import './index.css'

initializeTheme()

const router = createBrowserRouter(routes)
const store = createAppStore()
setupListeners(store.dispatch)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
