import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import LandingPage          from './pages/LandingPage'
import DashboardCiudadania  from './pages/DashboardCiudadania'
import DashboardEmpresas    from './pages/DashboardEmpresas'
import { ChatWidget }       from './components/ChatWidget'

function Navbar() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'
  return (
    <nav className={`main-nav ${isLanding ? 'main-nav--transparent' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">🏛️</div>
          Municipio
        </Link>
        <div className="nav-links">
          <Link to="/ciudadania" className={`nav-link ${pathname === '/ciudadania' ? 'active' : ''}`}>📋 Ciudadanía</Link>
          <Link to="/empresas"   className={`nav-link ${pathname === '/empresas'   ? 'active' : ''}`}>📊 Empresas</Link>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/"           element={<LandingPage />} />
          <Route path="/ciudadania" element={<DashboardCiudadania />} />
          <Route path="/empresas"   element={<DashboardEmpresas />} />
        </Routes>
        <ChatWidget />
      </div>
    </BrowserRouter>
  )
}
