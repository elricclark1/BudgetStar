import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import './index.css'
import App from './App'

// Force dayjs to use Sunday as the first day of the week for the 'en' locale
dayjs.locale({
  ...dayjs.Ls['en'],
  weekStart: 0,
});

const theme = createTheme({
  primaryColor: 'teal',
  colors: {
    teal: [
      '#f0fdfa',
      '#ccfbf1',
      '#99f6e4',
      '#5eead4',
      '#2dd4bf', // This is our new Aquamarine accent
      '#14b8a6',
      '#0d9488',
      '#0f766e',
      '#115e59',
      '#134e4a',
    ],
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <DatesProvider settings={{ firstDayOfWeek: 0, weekendDays: [0], locale: 'en' }}>
        <App />
      </DatesProvider>
    </MantineProvider>
  </React.StrictMode>,
)
