import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { NavTabs } from './components/NavTabs'
import { Footer } from './components/Footer'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DirectoryPage } from './pages/DirectoryPage'
import { ExplorerPage } from './pages/ExplorerPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SmartMoneyPage } from './pages/SmartMoneyPage'
import { SecurityPage } from './pages/SecurityPage'

function AppRoutes() {
  const location = useLocation()
  return (
    <ErrorBoundary key={location.pathname}>
      <Routes>
        <Route path="/" element={<DirectoryPage />} />
        <Route path="/explorer" element={<ExplorerPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/smart-money" element={<SmartMoneyPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Header />
        <NavTabs />
        <AppRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  )
}
