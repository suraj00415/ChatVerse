import { ThemeProvider } from "@/components/theme-provider"
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import 'react-toastify/dist/ReactToastify.css'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App.tsx'
import { store } from './features/store.ts'
import './index.css'
import { persistStore } from 'redux-persist'
import { Toaster } from "./components/ui/toaster.tsx"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'



let persistor = persistStore(store)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Routes>
                <Route path='/*' element={<App />} />
              </Routes>
            </LocalizationProvider>
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </ThemeProvider>
    <Toaster />
  </React.StrictMode>,
)
