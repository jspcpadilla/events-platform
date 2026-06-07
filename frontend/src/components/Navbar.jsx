import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const isManager = user?.role === 'admin' || user?.role === 'organizer'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900">EventosPro</span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium transition">
            Explorar
          </Link>
          {isAuthenticated && (
            <Link to="/my-enrollments" className="text-gray-600 hover:text-gray-900 font-medium transition">
              Mis eventos
            </Link>
          )}
          {isManager && (
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium transition">
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth desktop */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Botón crear evento para managers */}
              {isManager && (
                <Link
                  to="/events/create"
                  className="bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-violet-700 transition flex items-center gap-2"
                >
                  <span>+</span> Crear evento
                </Link>
              )}
              <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-700 font-semibold text-sm">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <span className="text-gray-700 font-medium text-sm">{user?.first_name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-full hover:border-gray-400 transition"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-700 font-medium hover:text-gray-900 transition text-sm">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-violet-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-violet-700 transition shadow-sm"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger mobile */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-700"></div>
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 space-y-4 bg-white">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Explorar</Link>
          {isAuthenticated && (
            <Link to="/my-enrollments" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Mis eventos</Link>
          )}
          {isManager && (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Dashboard</Link>
              <Link to="/events/create" onClick={() => setMenuOpen(false)} className="block text-violet-600 font-medium">+ Crear evento</Link>
            </>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="block text-red-500 font-medium">Cerrar sesión</button>
          ) : (
            <div className="space-y-3">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Iniciar sesión</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block bg-violet-600 text-white text-center py-2 rounded-full font-medium">Registrarse</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}