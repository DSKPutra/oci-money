import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { NavTabs } from './components/NavTabs'
import { Footer } from './components/Footer'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DashboardPage } from './pages/DashboardPage'
import { DirectoryPage } from './pages/DirectoryPage'
import { ExplorerPage } from './pages/ExplorerPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SmartMoneyPage } from './pages/SmartMoneyPage'
import { SecurityPage } from './pages/SecurityPage'
import { PortfolioPage } from './pages/PortfolioPage'
import { YieldsPage } from './pages/YieldsPage'
import { ToolsPage } from './pages/ToolsPage'

function AppRoutes() {
  const location = useLocation()
  return (
    <ErrorBoundary key={location.pathname}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/explorer" element={<ExplorerPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/smart-money" element={<SmartMoneyPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/yields" element={<YieldsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
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
