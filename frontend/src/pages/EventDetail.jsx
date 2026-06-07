import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../api/axios'
import { useAuth } from '../hooks/useAuth'

export default function EventDetail() {
  const { id }                    = useParams()
  const { isAuthenticated }       = useAuth()
  const navigate                  = useNavigate()
  const [event, setEvent]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled]   = useState(false)
  const [message, setMessage]     = useState('')
  const [error, setError]         = useState('')

  useEffect(() => { fetchEvent() }, [id])

  const fetchEvent = async () => {
    try {
      const res = await axiosInstance.get(`/events/${id}/`)
      setEvent(res.data)
      if (isAuthenticated) {
        const enRes = await axiosInstance.get('/enrollments/')
        setEnrolled(enRes.data.some(e => e.event === res.data.id))
      }
    } catch { navigate('/') }
    finally { setLoading(false) }
  }

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setEnrolling(true); setError(''); setMessage('')
    try {
      await axiosInstance.post('/enrollments/enroll/', { event: event.id })
      setEnrolled(true)
      setMessage('¡Te has inscrito exitosamente!')
      setEvent(prev => ({ ...prev, available_spots: prev.available_spots - 1 }))
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Error al inscribirse.')
    } finally { setEnrolling(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
    </div>
  )

  if (!event) return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-violet-600 transition">Eventos</Link>
        <span>/</span>
        <span className="text-gray-600">{event.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Columna principal */}
        <div className="lg:col-span-2">

          {/* Banner */}
          <div className="h-64 md:h-80 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-3xl flex items-end p-8 mb-8">
            {event.category && (
              <div>
                <span className="bg-white/20 backdrop-blur text-white text-sm px-4 py-1.5 rounded-full mb-3 inline-block">
                  {event.category.name}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  {event.title}
                </h1>
              </div>
            )}
          </div>

          {/* Organizador */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-violet-700 font-bold text-sm">
                {event.organizer?.first_name?.[0]}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Organizado por</p>
              <p className="font-semibold text-gray-800">{event.organizer?.full_name}</p>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sobre este evento</h2>
            <p className="text-gray-600 leading-relaxed text-base">{event.description}</p>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '📅', label: 'Inicio', value: new Date(event.start_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { icon: '🏁', label: 'Fin', value: new Date(event.end_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { icon: '📍', label: 'Ubicación', value: event.location },
              { icon: '👥', label: 'Capacidad', value: `${event.capacity} personas` },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-xs text-gray-400 mt-2">{item.label}</p>
                <p className="font-semibold text-gray-800 text-sm mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sticky top-24 shadow-sm">

            {/* Precio */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-violet-600">
                {event.is_free ? 'Gratis' : `$${event.price}`}
              </p>
              {event.is_free && (
                <p className="text-gray-400 text-sm mt-1">Sin costo de inscripción</p>
              )}
            </div>

            {/* Cupos */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Cupos disponibles</span>
                <span className="font-bold text-gray-800">{event.available_spots}/{event.capacity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-violet-600 h-2 rounded-full transition-all"
                  style={{ width: `${((event.capacity - event.available_spots) / event.capacity) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {event.capacity - event.available_spots} personas inscritas
              </p>
            </div>

            {/* Mensajes */}
            {message && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-2xl mb-4 text-sm font-medium">
                ✓ {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              onClick={handleEnroll}
              disabled={enrolling || enrolled || !event.is_available}
              className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200
                ${enrolled
                  ? 'bg-green-500 text-white cursor-default'
                  : event.is_available
                    ? 'bg-violet-600 text-white hover:bg-violet-700 active:scale-95 shadow-lg shadow-violet-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {enrolled ? '✓ Inscrito' : enrolling ? 'Procesando...' : !event.is_available ? 'Sin cupos' : isAuthenticated ? 'Inscribirme ahora' : 'Iniciar sesión para inscribirse'}
            </button>

            {!isAuthenticated && (
              <p className="text-center text-xs text-gray-400 mt-3">
                <Link to="/login" className="text-violet-600 hover:underline">Inicia sesión</Link> para inscribirte
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}